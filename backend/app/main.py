from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.agent_schemas import TaskRequest, AgentStage
from app.worker.celery_app import celery_app
from app.db.session import get_db
from app.db.models import PipelineTask
from sqlalchemy.orm import Session
from loguru import logger
import uuid
from typing import Optional, List
from pydantic import BaseModel
from fastapi import WebSocket, WebSocketDisconnect
import redis
import json
import asyncio

app = FastAPI(title="Content Agent System API")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.config import settings

# Redis for Pub/Sub
redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0, decode_responses=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

manager = ConnectionManager()

@app.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await manager.connect(websocket)
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f"task_{task_id}")
    logger.info(f"WebSocket client connected for task: {task_id}")
    
    try:
        while True:
            message = pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_text(message['data'])
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        pubsub.unsubscribe(f"task_{task_id}")

@app.post("/generate")
async def generate_content(request: TaskRequest):
    task_id = str(uuid.uuid4())
    logger.info(f"Received generation request: {request.prompt[:50]}...")
    
    # We pass the custom task_id to Celery
    celery_task = celery_app.send_task(
        "app.worker.tasks.run_content_pipeline",
        args=[request.model_dump(), task_id],
        task_id=task_id
    )
    return {"task_id": task_id}

@app.get("/status/{task_id}")
async def get_status(task_id: str, db: Session = Depends(get_db)):
    # 1. Check Celery for real-time meta
    res = celery_app.AsyncResult(task_id)
    if res.state == "PROCESSING" or res.state == "SUCCESS":
        return {
            "task_id": task_id,
            "status": res.state,
            "result": res.result,
            "meta": res.info or res.result
        }
    
    # 2. Fallback to DB (for old tasks)
    task = db.query(PipelineTask).filter(PipelineTask.task_id == task_id).first()
    if task:
        return {
            "task_id": task_id,
            "status": task.status.value,
            "result": None,
            "meta": task.full_state
        }
        
    return {"task_id": task_id, "status": "PENDING"}

@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    tasks = db.query(PipelineTask).order_by(PipelineTask.created_at.desc()).limit(10).all()
    return [
        {
            "task_id": t.task_id,
            "prompt": t.original_prompt,
            "status": t.status,
            "created_at": t.created_at
        } for t in tasks
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
