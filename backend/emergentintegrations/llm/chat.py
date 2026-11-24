import json
import os
import httpx
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
        # Real model when a Gemini key is configured; every provider name maps to Gemini so one key is enough.
        key = os.environ.get("GEMINI_API_KEY", "").strip()
        if key:
            parts = [{"text": message.text}]
            for f in file_contents or []:
                parts.append({"inline_data": {"mime_type": "image/jpeg", "data": f.image_base64}})
            body = {
                "system_instruction": {"parts": [{"text": self.system_message}]},
                "contents": [{"role": "user", "parts": parts}],
                "generationConfig": {"temperature": 0.2},
            }
            model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
            async with httpx.AsyncClient(timeout=90) as client:
                r = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    headers={"x-goog-api-key": key}, json=body)
            r.raise_for_status()
            data = r.json()
            text = "".join(p.get("text", "") for p in data["candidates"][0]["content"]["parts"]).strip()
            # The callers expect bare JSON; strip a ```json fence if the model adds one.
            if text.startswith("```"):
                first_newline = text.find(chr(10))
                text = text[first_newline + 1:] if first_newline != -1 else text.strip("`")
                text = text.rsplit("```", 1)[0].strip()
            return text

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
