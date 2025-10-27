from typing import Optional
from pydantic import BaseModel

class ChatSessionOut(BaseModel):
    id: int
    title: str

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str

class CreateSessionIn(BaseModel):
    title: Optional[str] = "New Chat"

class SendMessageIn(BaseModel):
    content: str
    provider: Optional[str] = "openai"
    use_tools: Optional[bool] = True
