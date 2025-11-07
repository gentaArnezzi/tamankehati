# apps/backend/core/auth/config.py
import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-secret-change-in-production")
ALGORITHM = "HS256"
# Standar industri: Access token 15 menit (OAuth2/JWT best practice)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
# Standar industri: Refresh token 7 hari (OAuth2/JWT best practice)
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

def access_token_timedelta() -> timedelta:
    return timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

def refresh_token_timedelta() -> timedelta:
    return timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
