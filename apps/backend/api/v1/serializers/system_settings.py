from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime

class SystemSettingsOut(BaseModel):
    id: int
    key: str
    value: Dict[str, Any]  # Flexible untuk berbagai tipe
    description: Optional[str] = None
    is_sensitive: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemSettingsIn(BaseModel):
    key: str = Field(..., min_length=1, max_length=255, description="Unique key for the setting")
    value: Dict[str, Any] = Field(..., description="Value of the setting (can be string, dict, etc.)")
    description: Optional[str] = Field(None, description="Optional description")
    is_sensitive: bool = Field(False, description="Whether the setting contains sensitive data")

class SystemSettingsUpdate(BaseModel):
    value: Dict[str, Any] = Field(..., description="Updated value")
    description: Optional[str] = Field(None, description="Updated description")
    is_sensitive: Optional[bool] = Field(None, description="Updated sensitivity flag")
