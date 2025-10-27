from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database.session import get_session
from ai.services import chat_service
from ai.providers.openai_provider import OpenAIProvider
from ai.providers.ollama_provider import OllamaProvider
from api.v1.serializers.chat import ChatSessionOut, ChatMessageOut, CreateSessionIn, SendMessageIn

router = APIRouter(prefix="/chat")

@router.post("/sessions", response_model=ChatSessionOut)
async def create_session(body: CreateSessionIn, db: AsyncSession = Depends(get_session)):
    s = await chat_service.create_session(db, title=body.title or "New Chat")
    return ChatSessionOut(id=s.id, title=s.title)

@router.get("/sessions", response_model=list[ChatSessionOut])
async def list_sessions(db: AsyncSession = Depends(get_session)):
    sessions = await chat_service.list_sessions(db)
    return [ChatSessionOut(id=s.id, title=s.title) for s in sessions]

@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
async def get_messages(session_id: int, db: AsyncSession = Depends(get_session)):
    msgs = await chat_service.get_messages(db, session_id)
    return [ChatMessageOut(id=m.id, role=m.role, content=m.content) for m in msgs]

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageOut)
async def send_message(session_id: int, body: SendMessageIn, db: AsyncSession = Depends(get_session)):
    # store user message
    await chat_service.add_message(db, session_id, "user", body.content)
    # choose provider
    provider_name = (body.provider or "openai").lower()
    if provider_name == "ollama":
        provider = OllamaProvider()
    else:
        try:
            provider = OpenAIProvider()
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    # generate assistant reply with tools (default True)
    msg = await chat_service.generate_reply(db, session_id, provider, use_tools=bool(body.use_tools) if body.use_tools is not None else True)
    return ChatMessageOut(id=msg.id, role=msg.role, content=msg.content)
