import json
from dataclasses import dataclass
from typing import List, Optional, Any


@dataclass
class UserMessage:
    text: str


@dataclass
class ImageContent:
    image_base64: str


class LlmChat:
    def __init__(self, api_key: str, session_id: str, system_message: str):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = None
        self.model_name = None

    def with_model(self, provider: str, model_name: str) -> "LlmChat":
        self.provider = provider
        self.model_name = model_name
        return self

    async def send_message(self, message: UserMessage, file_contents: Optional[List[ImageContent]] = None) -> str:
        if file_contents:
            return json.dumps({
                "authenticity_score": 50,
                "verdict": "Authentic",
                "anomalies": [],
                "confidence": 50,
                "reasoning": "Local stub response - no external LLM integration configured."
            })

        if "Extract key factual claims" in message.text or "Extract factual" in self.system_message:
            return json.dumps([
                {
                    "claim": "No claims extracted in stub mode.",
                    "type": "factual",
                    "importance": "low"
                }
            ])

        return json.dumps({
            "credibility_score": 50,
            "is_fake": False,
            "suspicious_phrases": [],
            "reasoning": "Local stub response - no external LLM integration configured.",
            "manipulation_tactics": [],
            "detailed_analysis": "No LLM backend configured.",
            "confidence_level": 50,
            "truth_score": 50,
            "verdict": "Reliable",
            "key_issues": []
        })
