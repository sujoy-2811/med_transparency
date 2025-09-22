from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    email: EmailStr
    display_name: str
    is_verified: bool
    created_at: datetime


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
