from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import ContentDraft, ScriptOutline, StructuredTask, DraftScene
from loguru import logger

class WriterAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a World-Class Screenwriter and Video Director. Your mission is to "
            "draft high-fidelity, high-retention video scripts that perfectly align with the "
            "requested tone, audience, and platform (YouTube/Instagram). You operate in a 'Scene-by-Scene' "
            "mode—meaning you focus intensely on the specific scene provided, writing detailed "
            "visual instructions (A-roll/B-roll/Text) and engaging spoken dialogue or VoiceOver (Audio). "
            "Ensure the pacing is perfect, avoid filler words, and hook the viewer instantly."
        )
        super().__init__(role="Writer", system_prompt=system_prompt)

    def execute(self, task: StructuredTask, outline: ScriptOutline) -> ContentDraft:
        logger.info(f"[Writer] Starting generation for all {len(outline.scenes)} scenes in a single request...")

        user_prompt = (
            f"Write the complete video script based on the following outline:\n"
            f"Platform: {task.platform}\n"
            f"Visual Style: {task.visual_style}\n"
            f"Topic: {task.topic}\n"
            f"Tone: {task.tone}\n\n"
            f"Outline Scenes:\n{outline.model_dump_json()}\n\n"
            f"Respond with the detailed Visuals and Audio Dialogue for EVERY SCENE in the outline. "
            f"Return a complete 'ContentDraft' JSON object with the 'scenes' array."
        )
        
        draft = self._call_llm(user_prompt, ContentDraft)

        # Build a raw text version of the script
        full_text_blocks = []
        for s in draft.scenes:
            full_text_blocks.append(f"### Scene {s.scene_number}\n**Visual:** {s.visuals}\n**Audio:** {s.audio_dialogue}")
        draft.full_text = "\n\n".join(full_text_blocks)
        
        return draft
