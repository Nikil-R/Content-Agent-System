from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import ScriptOutline, StructuredTask

class PlannerAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a Master YouTube/TikTok Video Producer and Content Architect. Your role is to transform a structured task "
            "into a blueprint for high-performance video retention. You must design a 'Script Outline' "
            "that ensures maximum audience retention, psychological engagement, and perfect pacing. "
            "Break the video down into specific SCENES (e.g., The Hook, The Intro, The Build-up, The Payoff, Call to Action). "
            "Each scene must have a clear visual cue and an estimated duration in seconds."
        )
        super().__init__(role="Planner", system_prompt=system_prompt)

    def execute(self, task: StructuredTask) -> ScriptOutline:
        user_prompt = (
            f"Create a video scene-by-scene outline for the following task:\n"
            f"Topic: {task.topic}\n"
            f"Platform: {task.platform}\n"
            f"Target Duration: {task.target_duration}\n"
            f"Visual Style: {task.visual_style}\n"
            f"Tone: {task.tone}\n"
            f"Audience: {task.audience}\n"
            f"Angle: {task.angle}\n"
            f"Keywords: {', '.join(task.keywords)}"
        )
        return self._call_llm(user_prompt, ScriptOutline)
