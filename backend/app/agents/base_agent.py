import json
from typing import Type, TypeVar, Any
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from loguru import logger

from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log

T = TypeVar("T", bound=BaseModel)

class BaseAgent:
    def __init__(self, role: str, system_prompt: str, model: str = settings.DEFAULT_MODEL):
        self.role = role
        self.system_prompt = system_prompt
        self.model = model
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        before_sleep=before_sleep_log(logger, "INFO"),
        reraise=True
    )
    def _call_llm(self, user_prompt: str, response_model: Type[T]) -> T:
        logger.info("[" + self.role + "] Initializing LLM call...")
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": (
                            f"{self.system_prompt}\n\n"
                            "### OUTPUT FORMAT REQUIREMENT ###\n"
                            "You must return ONLY a raw JSON object. "
                            "DO NOT include markdown code blocks (like ```json).\n"
                            "DO NOT return the schema definition itself. "
                            "Instead, return a valid instance of data that matches this schema.\n\n"
                            f"Target Schema: {json.dumps(response_model.model_json_schema())}"
                        )
                    },
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            raw_content = response.choices[0].message.content
            validated_data = response_model.model_validate_json(raw_content)
            logger.success("[" + self.role + "] Successfully validated structured output from Groq.")
            return validated_data
        
        except Exception as groq_err:
            logger.warning(f"[{self.role}] Groq attempt failed: {str(groq_err)}. Attempting NVIDIA fallback...")
            try:
                return self._call_nvidia(user_prompt, response_model)
            except Exception as nv_err:
                logger.error(f"[{self.role}] NVIDIA fallback also failed: {str(nv_err)}")
                # If both fail, raise a clean exception with the original Groq error to preserve context
                raise Exception(f"Pipeline stalled. Groq: {str(groq_err)} | NVIDIA: {str(nv_err)}")

    def _call_nvidia(self, user_prompt: str, response_model: Type[T]) -> T:
        import httpx
        
        headers = {
            "Authorization": "Bearer " + settings.NVIDIA_API_KEY.strip(),
            "Accept": "application/json",
        }
        
        payload = {
            "model": settings.NVIDIA_MODEL,
            "messages": [
                {
                    "role": "system", 
                    "content": (
                        f"{self.system_prompt}\n\n"
                        "### OUTPUT FORMAT REQUIREMENT ###\n"
                        "You must return ONLY a raw JSON object.\n"
                        "DO NOT return the schema definition itself. "
                        "Instead, return a valid instance of data that matches this schema.\n\n"
                        f"Target Schema: {json.dumps(response_model.model_json_schema())}"
                    )
                },
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 4096,
        }
        
        with httpx.Client() as client:
            try:
                response = client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=120.0
                )
                
                if response.status_code != 200:
                    # Capture the error but don't let it crash the string conversion
                    err_msg = response.text or f"Status {response.status_code}"
                    raise Exception(f"NVIDIA API Error {response.status_code}: {err_msg}")
                    
                data = response.json()
                
                if "choices" not in data or not data["choices"]:
                    raise Exception(f"NVIDIA returned unexpected format: {json.dumps(data)}")
                    
                raw_content = data["choices"][0]["message"]["content"]
                
                # Clean up potential markdown blocks if the model ignored instructions
                if "```json" in raw_content:
                    raw_content = raw_content.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_content:
                    raw_content = raw_content.split("```")[1].split("```")[0].strip()
                    
                # Final check to ensure it's not empty
                if not raw_content or raw_content.strip() == "":
                    raise Exception("NVIDIA returned empty content")
                    
                validated_data = response_model.model_validate_json(raw_content)
                logger.success(f"[{self.role}] Successfully validated structured output from NVIDIA.")
                return validated_data
            except httpx.RequestError as req_err:
                raise Exception(f"NVIDIA connection failed: {str(req_err)}")
            except Exception as e:
                # This ensures we don't return a KeyError or other internal exception
                raise Exception(str(e))

    def execute(self, *args, **kwargs) -> Any:
        """To be implemented by subclasses"""
        raise NotImplementedError
