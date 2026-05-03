from app.worker.celery_app import celery_app
from app.core.orchestrator import ContentOrchestrator
from app.schemas.agent_schemas import TaskRequest, SharedState, AgentStage
from app.db.session import SessionLocal
from app.db.models import PipelineTask
from loguru import logger
from datetime import datetime
import json
import redis
from app.core.config import settings

# Redis for broadcasting
redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0, decode_responses=True)

def update_db_task(state: SharedState):
    db = SessionLocal()
    try:
        task = db.query(PipelineTask).filter(PipelineTask.task_id == state.task_id).first()
        if not task:
            task = PipelineTask(task_id=state.task_id, original_prompt=state.original_request.prompt)
            db.add(task)
        
        task.status = state.current_stage
        task.full_state = state.model_dump()
        
        logger.info(f"DB Update [{state.task_id}]: stage={state.current_stage}")
        
        if state.current_stage == AgentStage.COMPLETED:
            task.final_result = state.final_output.content
            
        db.commit()
    except Exception as e:
        logger.error(f"Failed to update DB task: {str(e)}")
    finally:
        db.close()

@celery_app.task(name="app.worker.tasks.run_content_pipeline", bind=True)
def run_content_pipeline(self, request_data: dict, task_id: str = None, start_at: str = "parser"):
    logger.info(f"Worker received pipeline task. Stage: {start_at}")
    
    db = SessionLocal()
    try:
        # 1. Load or Initialize State
        db_task = None
        if task_id:
            db_task = db.query(PipelineTask).filter(PipelineTask.task_id == task_id).first()
        
        if db_task and db_task.full_state and start_at != "parser":
            # RESUME case
            state = SharedState(**db_task.full_state)
        else:
            # START case
            if not request_data:
                 raise Exception("New tasks must provide request_data.")
            request = TaskRequest(**request_data)
            state = SharedState(task_id=task_id or str(self.request.id), original_request=request)
            if not db_task:
                db_task = PipelineTask(
                    task_id=state.task_id, 
                    original_prompt=state.original_request.prompt,
                    status=AgentStage.PARSER
                )
                db.add(db_task)
                db.commit()

        # 2. Setup Orchestrator with Progress Broadcasting
        orchestrator = ContentOrchestrator()
        from app.schemas.agent_schemas import LogEntry
        
        def log_and_update(state, agent, message, level="INFO"):
            entry = LogEntry(
                timestamp=datetime.utcnow().strftime("%H:%M:%S"),
                agent=agent,
                message=message,
                level=level
            )
            state.logs.append(entry)
            logger.info(f"[{agent}] {message}")
            
            # Broadcast to Celery UI
            self.update_state(state="PROCESSING", meta=state.model_dump())
            
            # Broadcast to WebSockets via Redis
            try:
                redis_client.publish(f"task_{state.task_id}", json.dumps({
                    "type": "status_update",
                    "data": {
                        "task_id": state.task_id,
                        "status": "PROCESSING",
                        "meta": state.model_dump()
                    }
                }))
            except Exception as e:
                logger.error(f"Redis publish failed: {str(e)}")

            # Persistent storage
            update_db_task(state)
        
        orchestrator._log_step = log_and_update
        
        # 3. Run the pipeline
        start_stage = AgentStage(start_at)
        result_state = orchestrator.run_pipeline(state=state, start_at=start_stage)
        
        # Final update
        update_db_task(result_state)
        return result_state.model_dump()
        
    except Exception as e:
        logger.error(f"Worker task failed: {str(e)}")
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
