from typing import Optional, List
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    procedure: Optional[str] = None
    budget: Optional[float] = None
    region: Optional[str] = None
