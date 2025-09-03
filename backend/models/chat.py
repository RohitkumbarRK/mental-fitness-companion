from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    
class ChatSession(BaseModel):
    user_id: str
    messages: List[Message]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
class ChatRequest(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    response: str
    sentiment: Optional[str] = None
    suggestions: Optional[List[str]] = None