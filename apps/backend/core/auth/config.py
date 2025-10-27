# apps/backend/core/auth/config.py
import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def access_token_timedelta() -> timedelta:
    return timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
