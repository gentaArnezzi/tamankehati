from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    type: str
    title: str
    message: str
    resource: Optional[str]
    resource_id: Optional[int]
    region_code: Optional[str]
    is_read: bool
    created_at: datetime
    from_user_id: Optional[int]

class NotificationListResponse(BaseModel):
    items: List[NotificationOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
