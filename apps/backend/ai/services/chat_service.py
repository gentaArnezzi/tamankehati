from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ai.models import ChatSession, ChatMessage
from ai.providers.base import ChatTurn, LLMProvider
from ai.rag.retriever_hybrid import hybrid_retrieve
from ai.rag.retriever_pg import trigram_retrieve
from ai.rag.retriever import keyword_retrieve
from ai.services.tooling import maybe_run_tool

async def create_session(db: AsyncSession, user_id: Optional[int] = None, title: str = "New Chat") -> ChatSession:
    s = ChatSession(title=title, user_id=user_id)
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s

async def list_sessions(db: AsyncSession, user_id: Optional[int] = None) -> list[ChatSession]:
    q = select(ChatSession)
    if user_id is not None:
        q = q.where(ChatSession.user_id == user_id)
    res = await db.execute(q.order_by(ChatSession.id.desc()))
    return res.scalars().all()

async def add_message(db: AsyncSession, session_id: int, role: str, content: str) -> ChatMessage:
    m = ChatMessage(session_id=session_id, role=role, content=content)
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m

async def get_messages(db: AsyncSession, session_id: int) -> list[ChatMessage]:
    res = await db.execute(select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.id.asc()))
    return res.scalars().all()

async def prepare_messages_with_context(db: AsyncSession, session_id: int, *, use_tools: bool = True) -> list[ChatTurn]:
    msgs = await get_messages(db, session_id)
    history: list[ChatTurn] = [{"role": m.role, "content": m.content} for m in msgs]
    q = ""
    if history and history[-1]["role"] == "user":
        q = history[-1]["content"]

    # (1) Optional: run tool based on user query
    if use_tools and q:
        tool_md = await maybe_run_tool(db, q)
        if tool_md:
            history.insert(0, {"role": "system", "content": f"You have access to results from internal tools.\n{tool_md}"})

    # (2) RAG context (hybrid -> trigram -> keyword)
    context_snippets = []
    if q:
        try:
            context_snippets = await hybrid_retrieve(db, q, limit=8)
        except Exception:
            try:
                context_snippets = await trigram_retrieve(db, q, limit=6)
            except Exception:
                context_snippets = await keyword_retrieve(db, q, limit=5)
    if context_snippets:
        context = "\n\n".join([f"- {t}: {s}" for t, s in context_snippets])
        history.insert(0, {"role": "system", "content": f"You are a biodiversity assistant for Taman Kehati. Use this context if helpful:\n{context}"})
    return history

async def generate_reply(db: AsyncSession, session_id: int, provider: LLMProvider, *, use_tools: bool = True) -> ChatMessage:
    history = await prepare_messages_with_context(db, session_id, use_tools=use_tools)
    reply_text = await provider.generate(history)
    return await add_message(db, session_id, "assistant", reply_text)
