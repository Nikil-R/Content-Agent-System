from app.agents.parser_agent import ParserAgent
from app.agents.planner_agent import PlannerAgent
from app.agents.writer_agent import WriterAgent
from app.agents.critic_agent import CriticAgent
from app.agents.optimizer_agent import OptimizerAgent
from app.agents.formatter_agent import FormatterAgent
from app.core.evaluator import QualityEvaluator
from app.schemas.agent_schemas import SharedState, AgentStage, TaskRequest
from loguru import logger
import uuid
from datetime import datetime

class ContentOrchestrator:
    def __init__(self):
        self.parser = ParserAgent()
        self.planner = PlannerAgent()
        self.writer = WriterAgent()
        self.critic = CriticAgent()
        self.optimizer = OptimizerAgent()
        self.formatter = FormatterAgent()
        self.evaluator = QualityEvaluator()

    def _log_step(self, state: SharedState, agent: str, message: str, level: str = "INFO"):
        entry = {
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
            "agent": agent,
            "message": message,
            "level": level
        }
        state.logs.append(entry)
        logger.info(f"[{agent}] {message}")

    def run_pipeline(self, request: TaskRequest = None, state: SharedState = None, start_at: AgentStage = AgentStage.PARSER) -> SharedState:
        if state is None:
            state = SharedState(
                task_id=str(uuid.uuid4()),
                original_request=request,
                current_stage=start_at
            )
            self._log_step(state, "System", "Initializing multi-agent pipeline...")
        else:
            # Override current_stage for resumption
            state.current_stage = start_at

        try:
            # 1. Parsing
            if state.current_stage == AgentStage.PARSER:
                self._log_step(state, "Parser", "Deconstructing raw prompt into structured task...")
                state.structured_task = self.parser.execute(state.original_request)
                self._log_step(state, "Parser", f"Identified topic: {state.structured_task.topic}")
                state.current_stage = AgentStage.PLANNER

            # 2. Planning
            if state.current_stage == AgentStage.PLANNER:
                self._log_step(state, "Planner", "Architecting content blueprint and narrative flow...")
                state.outline = self.planner.execute(state.structured_task)
                self._log_step(state, "Planner", f"Created outline with {len(state.outline.sections)} logical sections.")
                
                # AUTOMATIC PROGRESSION: Skip manual approval
                state.current_stage = AgentStage.WRITER
                self._log_step(state, "System", "Proceeding to generation automatically.")

            # 3. Writing
            if state.current_stage == AgentStage.WRITER:
                self._log_step(state, "Writer", "Commencing sectional drafting...")
                state.draft = self.writer.execute(state.structured_task, state.outline)
                self._log_step(state, "Writer", f"Drafting complete. Total word count: {len(state.draft.full_text.split())}")
                state.current_stage = AgentStage.CRITIC

            # 4. Critiquing
            if state.current_stage == AgentStage.CRITIC:
                self._log_step(state, "Critic", "Performing surgical quality audit against requirements...")
                state.feedback = self.critic.execute(state.structured_task, state.draft)
                if state.feedback.is_satisfactory:
                    self._log_step(state, "Critic", "Quality check PASSED. No critical flaws detected.")
                else:
                    self._log_step(state, "Critic", f"Quality check FAILED. Identified {len(state.feedback.feedback_items)} issues.")
                state.current_stage = AgentStage.OPTIMIZER
            
            # 5. Optimizing
            if state.current_stage == AgentStage.OPTIMIZER:
                self._log_step(state, "Optimizer", "Executing targeted refinements based on auditor feedback...")
                state.draft = self.optimizer.execute(state.structured_task, state.draft, state.feedback)
                self._log_step(state, "Optimizer", "Refinement complete.")
                state.current_stage = AgentStage.FORMATTER
            
            # 6. Formatting
            if state.current_stage == AgentStage.FORMATTER:
                self._log_step(state, "Formatter", f"Transforming refined content into {state.original_request.format.value}...")
                state.final_output = self.formatter.execute(state.structured_task, state.draft)
                state.current_stage = AgentStage.EVALUATOR
            
            # 8. Evaluation
            if state.current_stage == AgentStage.EVALUATOR:
                self._log_step(state, "Evaluator", "Finalizing quality metrics and RAGAS-style scoring...")
                state.evaluation_results = self.evaluator.evaluate(state.structured_task, state.final_output)
                self._log_score_log = f"Overall Performance Score: {state.evaluation_results.get('overall_score', 0)}/10"
                self._log_step(state, "Evaluator", self._log_score_log)
                state.current_stage = AgentStage.COMPLETED
                self._log_step(state, "System", "Pipeline execution complete. Delivering output.")

            return state
            
        except Exception as e:
            state.current_stage = AgentStage.FAILED
            error_msg = f"Critical Failure: {str(e)}"
            logger.error("[System] " + error_msg)
            state.errors.append(error_msg)
            # Log to internal pipeline logs as well
            self._log_step(state, "System", error_msg, level="ERROR")

        return state
