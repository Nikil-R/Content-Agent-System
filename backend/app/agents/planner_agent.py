from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import ContentOutline, StructuredTask

class PlannerAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Master Content Architect. Your role is to transform a structured task "
            "into a blueprint for high-performance content. You must design a 'Content Outline' "
            "that ensures logical progression, psychological engagement, and comprehensive coverage. "
            "Each section must have a clear purpose: from the 'Hook' in the introduction to the "
            "'Synthesis' in the conclusion. Your outlines should be so detailed that a writer "
            "knows exactly what data points and emotional notes to hit in every section."
        )
        super().__init__(role="Planner", system_prompt=system_prompt)

    def execute(self, task: StructuredTask) -> ContentOutline:
        user_prompt = (
            f"Create an outline for the following task:\n"
            f"Topic: {task.topic}\n"
            f"Tone: {task.tone}\n"
            f"Audience: {task.audience}\n"
            f"Angle: {task.angle}\n"
            f"Keywords: {', '.join(task.keywords)}"
        )
        return self._call_llm(user_prompt, ContentOutline)
