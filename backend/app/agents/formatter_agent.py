from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import FinalOutput, ContentDraft, StructuredTask

class FormatterAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Professional Script Formatter. Your job is to take a refined "
            "video script draft and format it into a clean Markdown table or visually pleasing layout. "
            "Ensure clear separation between Visual Cues and Audio Dialogue/VO."
        )
        super().__init__(role="Formatter", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, draft: ContentDraft) -> FinalOutput:
        user_prompt = (
            f"Format the following video script into a clean, easy-to-read {task.format} document:\n\n"
            f"Script Content:\n{draft.full_text}"
        )
        return self._call_llm(user_prompt, FinalOutput)
