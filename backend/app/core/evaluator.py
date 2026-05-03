from typing import Dict
from pydantic import BaseModel, Field
from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import FinalOutput, StructuredTask
from loguru import logger

class EvaluationMetrics(BaseModel):
    coherence: float = Field(..., ge=0, le=10, description="Logical flow and connection between ideas")
    relevance: float = Field(..., ge=0, le=10, description="Alignment with the original task and audience")
    completeness: float = Field(..., ge=0, le=10, description="Coverage of all planned sections and keywords")
    tone_accuracy: float = Field(..., ge=0, le=10, description="Consistency with the requested tone")
    overall_score: float = Field(..., ge=0, le=10)

class QualityEvaluator(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are an AI Quality Auditor. Your job is to objectively evaluate "
            "generated content based on specific metrics. You must provide scores "
            "between 0 and 10 for each metric and an overall quality score. "
            "Be critical and precise."
        )
        super().__init__(role="Evaluator", system_prompt=system_prompt)

    def evaluate(self, task: StructuredTask, final_output: FinalOutput) -> Dict[str, float]:
        logger.info("[Evaluator] Running quality metrics evaluation...")
        
        user_prompt = (
            f"Evaluate the following content based on the original task:\n\n"
            f"Topic: {task.topic}\n"
            f"Tone: {task.tone}\n"
            f"Audience: {task.audience}\n\n"
            f"Generated Content:\n{final_output.content}"
        )
        
        metrics = self._call_llm(user_prompt, EvaluationMetrics)
        return metrics.model_dump()
