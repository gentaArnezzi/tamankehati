from fastapi import APIRouter, Request, HTTPException, status
from api.v1.serializers.public import ChatMessageRequest, ChatMessageResponse
from api.v1.public.services import PublicChatbotService
from api.v1.public.constants import (
    CHATBOT_ERROR_GENERAL,
    RATE_LIMIT_EXCEEDED,
    INVALID_MESSAGE_EMPTY
)
import time
from typing import Dict

router = APIRouter()

# Simple in-memory rate limiting (for production, use Redis or similar)
rate_limit_storage: Dict[str, Dict[str, float]] = {}

def check_rate_limit(ip: str, limit: int = 10, window: int = 60) -> bool:
    """
    Check if IP has exceeded rate limit.
    Args:
        ip: Client IP address
        limit: Maximum requests allowed
        window: Time window in seconds
    Returns:
        True if within limit, False if exceeded
    """
    current_time = time.time()
    
    # Clean old entries
    if ip in rate_limit_storage:
        rate_limit_storage[ip] = {
            timestamp: count for timestamp, count in rate_limit_storage[ip].items()
            if current_time - timestamp < window
        }
    else:
        rate_limit_storage[ip] = {}
    
    # Count requests in current window
    current_requests = sum(rate_limit_storage[ip].values())
    
    if current_requests >= limit:
        return False
    
    # Add current request
    if current_time in rate_limit_storage[ip]:
        rate_limit_storage[ip][current_time] += 1
    else:
        rate_limit_storage[ip][current_time] = 1
    
    return True

def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    # Check for forwarded headers first (for reverse proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct connection
    return request.client.host if request.client else "unknown"

@router.post("/", response_model=ChatMessageResponse)
async def send_chat_message(request: Request, chat_request: ChatMessageRequest):
    """
    Send a message to the chatbot with rate limiting.
    Rate limit: 10 requests per minute per IP.
    """
    # Get client IP
    client_ip = get_client_ip(request)
    
    # Check rate limit
    if not check_rate_limit(client_ip, limit=10, window=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=RATE_LIMIT_EXCEEDED,
            headers={"Retry-After": "60"}
        )
    
    # Sanitize input
    sanitized_message = chat_request.message.strip()[:500]  # Limit to 500 characters
    
    if not sanitized_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_MESSAGE_EMPTY
        )
    
    try:
        reply = await PublicChatbotService.send_message(message=sanitized_message)
        return ChatMessageResponse(reply=reply)
    except Exception as e:
        # Log error securely without exposing system information
        print(f"Chatbot error for IP {client_ip}: Internal processing error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=CHATBOT_ERROR_GENERAL
        )