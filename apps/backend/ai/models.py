from typing import Optional, Literal
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Column
from datetime import datetime, timezone
from core.database.base import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), default="New Chat")
    user_id = Column(ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True)
    session_id = Column(ForeignKey("chat_sessions.id"))
    role = Column(String(20))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
