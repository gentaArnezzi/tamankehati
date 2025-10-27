from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RegionBase(BaseModel):
    name: str = Field(..., max_length=100, example="DKI Jakarta")
    code: str = Field(..., max_length=10, example="JKT")
    timezone: Optional[str] = Field(None, example="Asia/Jakarta")
    is_active: bool = Field(True, example=True)

class RegionCreate(RegionBase):
    pass

class RegionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100, example="DKI Jakarta")
    code: Optional[str] = Field(None, max_length=10, example="JKT")
    timezone: Optional[str] = Field(None, example="Asia/Jakarta")
    is_active: Optional[bool] = Field(None, example=True)

class RegionInDBBase(RegionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Region(RegionInDBBase):
    pass

class RegionInDB(RegionInDBBase):
    pass