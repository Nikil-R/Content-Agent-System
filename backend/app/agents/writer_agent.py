from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import ContentDraft, ContentOutline, StructuredTask, DraftSection
from loguru import logger

class WriterAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a World-Class Ghostwriter and Subject Matter Expert. Your mission is to "
            "draft high-fidelity prose that sounds human, authoritative, and perfectly "
            "aligned with the requested tone and audience. You operate in a 'Sectional Write' "
            "mode—meaning you focus intensely on the specific header and description provided, "
            "weaving in the unique 'Angle' to ensure the piece is not generic AI-slop. "
            "Avoid filler, maintain strong sentence variety, and hit every required keyword naturally."
        )
        super().__init__(role="Writer", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, outline: ContentOutline) -> ContentDraft:
        draft_sections = []
        logger.info(f"[Writer] Starting generation for {len(outline.sections)} sections...")

        for section in outline.sections:
            logger.info(f"[Writer] Writing section: {section.title}")
            user_prompt = (
                f"Write the following section for a piece of content:\n"
                f"Topic: {task.topic}\n"
                f"Tone: {task.tone}\n"
                f"Audience: {task.audience}\n"
                f"Section Title: {section.title}\n"
                f"Section Description: {section.description}\n"
                f"Keywords to include: {', '.join(task.keywords)}\n\n"
                f"Respond with the written content for THIS SECTION ONLY."
            )
            
            # For the section content, we don't necessarily need a complex schema,
            # but we can wrap it in a simple DraftSection model.
            section_output = self._call_llm(user_prompt, DraftSection)
            draft_sections.append(section_output)

        full_text = "\n\n".join([s.content for s in draft_sections])
        return ContentDraft(sections=draft_sections, full_text=full_text)
