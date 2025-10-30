from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database.session import get_session
from ai.services import chat_service
from ai.providers.openai_provider import OpenAIProvider
from ai.providers.ollama_provider import OllamaProvider
from utils.ratelimit import ws_rate_check

router = APIRouter(prefix="/chat")

@router.websocket("/ws/{session_id}")
async def chat_ws(websocket: WebSocket, session_id: int, db: AsyncSession = Depends(get_session)):
    await websocket.accept()
    try:
        while True:
            # Rate check per message (per token scope if Authorization header present)
            await ws_rate_check(websocket, route=f"/api/v1/chat/ws/{session_id}", limit=60, window_sec=60, scope="token")
            data = await websocket.receive_json()
            content = data.get("content", "")
            provider_name = (data.get("provider") or "google").lower()
            use_tools = bool(data.get("use_tools", True))
            await chat_service.add_message(db, session_id, "user", content)
            history = await chat_service.prepare_messages_with_context(db, session_id, use_tools=use_tools)
            
            # Choose provider
            if provider_name == "ollama":
                prov = OllamaProvider()
            elif provider_name == "google" or provider_name == "gemini":
                from ai.providers.google_provider import GoogleProvider
                prov = GoogleProvider()
            else:  # openai
                prov = OpenAIProvider()
            await websocket.send_json({"event": "start"})
            aggregated = []
            async for chunk in prov.stream(history):
                aggregated.append(chunk)
                await websocket.send_json({"event": "chunk", "data": chunk})
            final_text = "".join(aggregated)
            await chat_service.add_message(db, session_id, "assistant", final_text)
            await websocket.send_json({"event": "done"})
    except WebSocketDisconnect:
        return
    except Exception as e:
        try:
            await websocket.send_json({"event": "error", "data": str(e)})
        finally:
            await websocket.close(code=1011)
