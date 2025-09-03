from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JournalEntry(BaseModel):
    user_id: str
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
class JournalCreate(BaseModel):
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    
class JournalResponse(BaseModel):
    id: str
    content: str
    mood: Optional[str] = None
    tags: List[str]
    created_at: datetime
    insights: Optional[str] = None