from typing import Sequence, TypedDict

class ChatTurn(TypedDict):
    role: str
    content: str

class LLMProvider:
    async def generate(self, messages: Sequence[ChatTurn]) -> str:
        raise NotImplementedError
