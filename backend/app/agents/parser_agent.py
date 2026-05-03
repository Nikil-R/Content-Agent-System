from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import StructuredTask, TaskRequest

class ParserAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are an Elite Content Strategist and NLP Engineer. Your mission is to deconstruct "
            "raw user requests into a high-fidelity, machine-readable JSON task object. "
            "You must identify:\n"
            "1. TOPIC: The core subject matter.\n"
            "2. TONE: The specific linguistic style (e.g., authoritative, whimsical, clinical).\n"
            "3. AUDIENCE: The psychological profile of the reader.\n"
            "4. FORMAT: The structural layout (e.g., Whitepaper, Listicle, Deep-Dive).\n"
            "5. ANGLE: A unique narrative hook that prevents generic content.\n"
            "6. KEYWORDS: Semantic terms crucial for SEO and topical authority.\n"
            "Precision is paramount. If the user input is vague, use your expertise to infer "
            "the most professional parameters.\n\n"
            "EXAMPLE OUTPUT:\n"
            "{\n"
            "  \"topic\": \"AI in Healthcare\",\n"
            "  \"tone\": \"Authoritative\",\n"
            "  \"audience\": \"Medical Professionals\",\n"
            "  \"format\": \"Whitepaper\",\n"
            "  \"word_count\": 2000,\n"
            "  \"keywords\": [\"AI\", \"Diagnostics\", \"Healthcare\"],\n"
            "  \"angle\": \"The ethical implications of AI-driven surgery\"\n"
            "}"
        )
        super().__init__(role="Input Parser", system_prompt=system_prompt)

    def execute(self, request: TaskRequest) -> StructuredTask:
        user_prompt = f"Extract details from this request: {request.prompt}"
        return self._call_llm(user_prompt, StructuredTask)
