from typing import List
from pydantic import BaseModel
from app.schemas.ai import ChatMessage


class AgentRequest(BaseModel):
    messages: List[ChatMessage]
