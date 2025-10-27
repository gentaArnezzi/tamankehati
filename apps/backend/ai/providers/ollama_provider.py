import os, json
from typing import Sequence, AsyncIterator
from .base import ChatTurn, LLMProvider
import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")

class OllamaProvider(LLMProvider):
    async def generate(self, messages: Sequence[ChatTurn]) -> str:
        # Fallback non-streaming
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        async with httpx.AsyncClient(timeout=120) as client:
            try:
                # Try chat API first
                r = await client.post(f"{OLLAMA_URL}/api/chat", json={
                    "model": OLLAMA_MODEL, 
                    "messages": [{"role": m['role'], "content": m['content']} for m in messages],
                    "stream": False
                })
                r.raise_for_status()
                response = r.json()
                return response.get("message", {}).get("content", "")
            except Exception:
                # Fallback to generate API
                r = await client.post(f"{OLLAMA_URL}/api/generate", json={
                    "model": OLLAMA_MODEL, 
                    "prompt": prompt,
                    "stream": False
                })
                r.raise_for_status()
                response = r.json()
                return response.get("response", "")

    async def stream(self, messages: Sequence[ChatTurn]) -> AsyncIterator[str]:
        """Stream tokens from Ollama REST API."""
        # Prefer chat API if available, else use generate with stream
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": "\n".join([f"{m['role']}: {m['content']}" for m in messages]),
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", f"{OLLAMA_URL}/api/generate", json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        j = json.loads(line)
                        if j.get("done"):
                            break
                        chunk = j.get("response") or ""
                        if chunk:
                            yield chunk
                    except Exception:
                        # some servers send 'data: {...}' format, try to strip
                        if line.startswith("data: "):
                            try:
                                j = json.loads(line[6:])
                                chunk = j.get("response") or ""
                                if chunk:
                                    yield chunk
                            except Exception:
                                continue
