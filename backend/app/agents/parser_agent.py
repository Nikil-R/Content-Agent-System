from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import StructuredTask, TaskRequest

class ParserAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are an Elite Video Producer and Strategist. Your mission is to deconstruct "
            "raw user requests into a high-fidelity, machine-readable JSON task object for a video script. "
            "You must identify:\n"
            "1. TOPIC: The core subject matter.\n"
            "2. PLATFORM: YouTube, Instagram Reel, or TikTok.\n"
            "3. TARGET DURATION: e.g. 60 seconds, 10 minutes.\n"
            "4. TONE: The specific linguistic style (e.g., energetic, authoritative, comedic).\n"
            "5. AUDIENCE: The psychological profile of the viewer.\n"
            "6. VISUAL STYLE: e.g. Fast-paced cuts, Cinematic B-roll, Talking Head.\n"
            "7. ANGLE: A unique narrative hook that prevents generic content.\n"
            "8. KEYWORDS: Semantic terms crucial for YouTube/TikTok SEO.\n"
            "Precision is paramount. If the user input is vague, use your expertise to infer "
            "the most engaging parameters.\n\n"
            "EXAMPLE OUTPUT:\n"
            "{\n"
            "  \"topic\": \"Antigravity 2.0 Release\",\n"
            "  \"platform\": \"Instagram Reel\",\n"
            "  \"target_duration\": \"60 seconds\",\n"
            "  \"tone\": \"High-Energy and Exciting\",\n"
            "  \"audience\": \"Tech Enthusiasts\",\n"
            "  \"visual_style\": \"Fast-paced cuts with pop-up text\",\n"
            "  \"keywords\": [\"Antigravity 2.0\", \"AI Agent\", \"Tech Update\"],\n"
            "  \"angle\": \"Why this update makes 90% of your workflow obsolete\"\n"
            "}"
        )
        super().__init__(role="Input Parser", system_prompt=system_prompt)

    def execute(self, request: TaskRequest) -> StructuredTask:
        user_prompt = f"Extract details from this request: {request.prompt}"
        return self._call_llm(user_prompt, StructuredTask)
