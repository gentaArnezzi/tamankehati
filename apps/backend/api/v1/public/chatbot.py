from fastapi import APIRouter
from api.v1.serializers.public import ChatMessageRequest, ChatMessageResponse
from api.v1.public.services import PublicChatbotService

router = APIRouter()


@router.post("/", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    reply = await PublicChatbotService.send_message(message=request.message)
    return ChatMessageResponse(reply=reply)