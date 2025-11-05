import os, json
from typing import Sequence, AsyncIterator
from .base import ChatTurn, LLMProvider
import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")

class OllamaProvider(LLMProvider):
    async def generate(self, messages: Sequence[ChatTurn]) -> str:
        # Optimized non-streaming with reasonable timeout
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        # Timeout based on model size: larger models need more time
        # For llama3.1:8b and similar large models, use 180 seconds
        # For smaller models like qwen2:1.5b, 60 seconds is enough
        model = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")
        # Increase timeout for large models (8b+ parameters)
        if "8b" in model.lower() or "7b" in model.lower() or "13b" in model.lower() or "14b" in model.lower():
            timeout = 180.0  # 3 minutes for large models
        else:
            timeout = 60.0  # 1 minute for smaller models
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                # Optimize for qwen2:1.5b - limit output length and use faster params
                # num_predict limits max tokens generated (faster response)
                # For small model like qwen2:1.5b, 500 tokens is enough for 200-words description
                chat_params = {
                    "model": OLLAMA_MODEL, 
                    "messages": [{"role": m['role'], "content": m['content']} for m in messages],
                    "stream": False,
                    "options": {
                        "num_predict": 500,  # Limit output to ~500 tokens (faster)
                        "temperature": 0.7,  # Balanced creativity
                        "top_p": 0.9,  # Nucleus sampling
                    }
                }
                # Try chat API first
                r = await client.post(f"{OLLAMA_URL}/api/chat", json=chat_params)
                r.raise_for_status()
                response = r.json()
                return response.get("message", {}).get("content", "")
            except Exception as e:
                # Fallback to generate API with same optimization
                generate_params = {
                    "model": OLLAMA_MODEL, 
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": 500,  # Limit output length
                        "temperature": 0.7,
                        "top_p": 0.9,
                    }
                }
                r = await client.post(f"{OLLAMA_URL}/api/generate", json=generate_params)
                r.raise_for_status()
                response = r.json()
                return response.get("response", "")

    async def stream(self, messages: Sequence[ChatTurn]) -> AsyncIterator[str]:
        """Stream tokens from Ollama REST API."""
        # Use generate API with streaming mode
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": "\n".join([f"{m['role']}: {m['content']}" for m in messages]),
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream("POST", f"{OLLAMA_URL}/api/generate", json=payload) as resp:
                resp.raise_for_status()
                # Use aiter_text() for better streaming performance
                buffer = ""
                async for chunk in resp.aiter_text():
                    if not chunk:
                        continue
                    buffer += chunk
                    # Process complete lines (Ollama sends JSON per line)
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            # Handle 'data: {...}' format if present
                            if line.startswith("data: "):
                                line = line[6:]
                            j = json.loads(line)
                            if j.get("done"):
                                break
                            chunk_text = j.get("response") or ""
                            if chunk_text:
                                yield chunk_text
                        except json.JSONDecodeError:
                            # If incomplete JSON, keep in buffer
                            buffer = line + "\n" + buffer
                            break
                        except Exception:
                            continue
                # Process any remaining buffer
                if buffer.strip():
                    try:
                        if buffer.startswith("data: "):
                            buffer = buffer[6:]
                        j = json.loads(buffer.strip())
                        if not j.get("done"):
                            chunk_text = j.get("response") or ""
                            if chunk_text:
                                yield chunk_text
                    except Exception:
                        pass
