import os, json
from typing import Sequence, AsyncIterator, Optional
from .base import ChatTurn, LLMProvider
import httpx

OPENAI_BASE = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY not set")

    async def generate(self, messages: Sequence[ChatTurn]) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"model": OPENAI_MODEL, "messages": list(messages)}
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(f"{OPENAI_BASE}/chat/completions", headers=headers, json=payload)
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"]

    async def stream(self, messages: Sequence[ChatTurn]) -> AsyncIterator[str]:
        """Yield tokens as they arrive from OpenAI's streaming API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "text/event-stream",
            "Content-Type": "application/json",
        }
        payload = {"model": OPENAI_MODEL, "messages": list(messages), "stream": True}
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", f"{OPENAI_BASE}/chat/completions", headers=headers, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data = line[len("data: "):]
                        if data.strip() == "[DONE]":
                            break
                        try:
                            j = json.loads(data)
                            delta = j["choices"][0].get("delta") or j["choices"][0].get("message", {})
                            chunk = delta.get("content") or ""
                            if chunk:
                                yield chunk
                        except Exception:
                            # if parsing fails, skip line
                            continue
