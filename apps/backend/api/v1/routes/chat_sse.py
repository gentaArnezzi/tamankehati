from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from core.database.session import get_session
from ai.services import chat_service
from ai.providers.openai_provider import OpenAIProvider
from ai.providers.ollama_provider import OllamaProvider
from utils.ratelimit import rate_limiter

router = APIRouter(prefix="/chat")

# Example: per-IP 20 requests per 60s for SSE
rl_sse = rate_limiter(limit=20, window_sec=60, scope="ip")

@router.get("/sse/{session_id}", dependencies=[Depends(rl_sse)])
async def chat_sse(session_id: int, request: Request, q: str, provider: str = "google", use_tools: bool = True, db: AsyncSession = Depends(get_session)):
    async def event_stream():
        try:
            await chat_service.add_message(db, session_id, "user", q)
            history = await chat_service.prepare_messages_with_context(db, session_id, use_tools=use_tools)
            
            # Choose provider
            if provider.lower() == "ollama":
                prov = OllamaProvider()
            elif provider.lower() in ["google", "gemini"]:
                from ai.providers.google_provider import GoogleProvider
                prov = GoogleProvider()
            else:  # openai
                prov = OpenAIProvider()
            yield "event: start\n\n"
            aggregated = []
            async for chunk in prov.stream(history):
                aggregated.append(chunk)
                yield f"data: {chunk}\n\n"
            final_text = "".join(aggregated)
            await chat_service.add_message(db, session_id, "assistant", final_text)
            yield "event: done\ndata: [DONE]\n\n"
        except Exception as e:
            yield f"event: error\ndata: {str(e)}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
