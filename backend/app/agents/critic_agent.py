from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import FeedbackReport, ContentDraft, StructuredTask

class CriticAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Rigorous Video Producer and Retention Expert. Your job is to perform a surgical analysis "
            "of the video script draft. You are not here to be nice; you are here to ensure maximum viewer retention. "
            "Flag inconsistencies in pacing, weak visual hooks, boring audio dialogue, "
            "and missed opportunities to leverage the 'Angle'. Your feedback must be "
            "structured, actionable, and prioritized by severity."
        )
        super().__init__(role="Critic", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, draft: ContentDraft) -> FeedbackReport:
        user_prompt = (
            f"Review this video script draft against the task requirements:\n"
            f"Topic: {task.topic}\n"
            f"Platform: {task.platform}\n"
            f"Target Duration: {task.target_duration}\n"
            f"Visual Style: {task.visual_style}\n"
            f"Tone: {task.tone}\n"
            f"Audience: {task.audience}\n"
            f"Required Keywords: {', '.join(task.keywords)}\n\n"
            f"Draft Script (Scenes with Visuals and Audio):\n{draft.full_text}"
        )
        return self._call_llm(user_prompt, FeedbackReport)
