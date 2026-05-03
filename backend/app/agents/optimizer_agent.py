from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import ContentDraft, FeedbackReport, StructuredTask, DraftSection
from loguru import logger

class OptimizerAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Precision Editor. Your mission is to implement the Critic's "
            "feedback with surgical accuracy. You do not rewrite for the sake of rewriting. "
            "Instead, you strengthen the weak points, fix the logical gaps, and polish the "
            "stylistic nuances flagged in the audit. The final output must be seamless, "
            "retaining the strengths of the original draft while eliminating its flaws."
        )
        super().__init__(role="Optimizer", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, draft: ContentDraft, feedback: FeedbackReport) -> ContentDraft:
        if feedback.is_satisfactory:
            logger.info("[Optimizer] Content is already satisfactory. No optimization needed.")
            return draft

        logger.info(f"[Optimizer] Optimizing {len(feedback.feedback_items)} flagged items...")
        
        # In a real production system, we'd surgically replace only the sections mentioned.
        # For simplicity in this initial version, we pass the draft and feedback to refine the whole context
        # but instruct the model to be targeted.
        user_prompt = (
            f"Optimize the following draft based on the feedback report:\n"
            f"Topic: {task.topic}\n"
            f"Tone: {task.tone}\n\n"
            f"Original Draft:\n{draft.full_text}\n\n"
            f"Feedback Items:\n{feedback.model_dump_json()}\n\n"
            f"Rewrite the draft to incorporate the feedback while maintaining the overall flow.\n"
            f"IMPORTANT: You must return a complete 'ContentDraft' object containing both the 'sections' list AND the 'full_text' string (which should be the concatenated sections)."
        )
        
        # We expect a refined ContentDraft back.
        return self._call_llm(user_prompt, ContentDraft)
