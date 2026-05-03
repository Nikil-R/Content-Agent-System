from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import FinalOutput, ContentDraft, StructuredTask

class FormatterAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Digital Publishing Expert. Your job is to take a refined "
            "content draft and format it into the requested output format (Markdown, HTML, etc.). "
            "Ensure proper use of headings, spacing, and structural elements."
        )
        super().__init__(role="Formatter", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, draft: ContentDraft) -> FinalOutput:
        user_prompt = (
            f"Format the following content into {task.format}:\n\n"
            f"Content:\n{draft.full_text}"
        )
        return self._call_llm(user_prompt, FinalOutput)
