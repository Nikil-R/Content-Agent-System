from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import FeedbackReport, ContentDraft, StructuredTask

class CriticAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Rigorous Editorial Auditor. Your job is to perform a surgical analysis "
            "of the content draft. You are not here to be nice; you are here to ensure excellence. "
            "Flag inconsistencies in logic, deviations from the requested tone, weak vocabulary, "
            "and missed opportunities to leverage the 'Angle'. Your feedback must be "
            "structured, actionable, and prioritized by severity."
        )
        super().__init__(role="Critic", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, draft: ContentDraft) -> FeedbackReport:
        user_prompt = (
            f"Review this draft against the task requirements:\n"
            f"Topic: {task.topic}\n"
            f"Tone: {task.tone}\n"
            f"Audience: {task.audience}\n"
            f"Required Keywords: {', '.join(task.keywords)}\n\n"
            f"Draft Content:\n{draft.full_text}"
        )
        return self._call_llm(user_prompt, FeedbackReport)
