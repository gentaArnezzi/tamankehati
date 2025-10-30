"""
Google AI (Gemini) Provider
Uses Google Generative AI API
"""
import os
import json
from typing import Sequence, AsyncIterator, Optional
from .base import ChatTurn, LLMProvider
import httpx


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")
GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

class GoogleProvider(LLMProvider):
    """Google AI (Gemini) Provider"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GOOGLE_API_KEY
        if not self.api_key:
            raise RuntimeError("GOOGLE_API_KEY not set")
        self.model = GOOGLE_MODEL
    
    def _convert_messages_to_google_format(self, messages: Sequence[ChatTurn]) -> list[dict]:
        """Convert ChatTurn messages to Google AI format"""
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        return contents
    
    async def generate(self, messages: Sequence[ChatTurn]) -> str:
        """Non-streaming generation"""
        url = f"{GOOGLE_API_BASE}/models/{self.model}:generateContent"
        params = {"key": self.api_key}
        
        contents = self._convert_messages_to_google_format(messages)
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        async with httpx.AsyncClient(timeout=60) as client:
            try:
                response = await client.post(url, params=params, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # Extract text from Google AI response
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            return parts[0]["text"]
                
                return "No response from Google AI"
                
            except httpx.HTTPStatusError as e:
                error_detail = e.response.text if e.response else str(e)
                raise RuntimeError(f"Google AI API error: {error_detail}")
            except Exception as e:
                raise RuntimeError(f"Google AI request failed: {str(e)}")
    
    async def stream(self, messages: Sequence[ChatTurn]) -> AsyncIterator[str]:
        """Streaming generation"""
        url = f"{GOOGLE_API_BASE}/models/{self.model}:streamGenerateContent"
        params = {"key": self.api_key, "alt": "sse"}
        
        contents = self._convert_messages_to_google_format(messages)
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        async with httpx.AsyncClient(timeout=120) as client:
            try:
                async with client.stream("POST", url, params=params, json=payload) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        
                        try:
                            # Remove "data: " prefix
                            json_str = line[6:]
                            if json_str.strip() == "[DONE]":
                                break
                            
                            chunk_data = json.loads(json_str)
                            
                            # Extract text from chunk
                            if "candidates" in chunk_data and len(chunk_data["candidates"]) > 0:
                                candidate = chunk_data["candidates"][0]
                                if "content" in candidate and "parts" in candidate["content"]:
                                    parts = candidate["content"]["parts"]
                                    if len(parts) > 0 and "text" in parts[0]:
                                        yield parts[0]["text"]
                        
                        except json.JSONDecodeError:
                            continue
                        except Exception as e:
                            print(f"Error processing chunk: {e}")
                            continue
                            
            except httpx.HTTPStatusError as e:
                error_detail = e.response.text if e.response else str(e)
                raise RuntimeError(f"Google AI streaming error: {error_detail}")
            except Exception as e:
                raise RuntimeError(f"Google AI streaming failed: {str(e)}")

