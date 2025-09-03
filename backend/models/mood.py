from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MoodEntry(BaseModel):
    user_id: str
    mood_score: int  # 1-10 scale
    energy_level: int  # 1-10 scale
    focus_level: int  # 1-10 scale
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
class MoodCreate(BaseModel):
    mood_score: int
    energy_level: int
    focus_level: int
    notes: Optional[str] = None
    
class MoodResponse(BaseModel):
    id: str
    mood_score: int
    energy_level: int
    focus_level: int
    notes: Optional[str] = None
    created_at: datetime
    
class MoodStats(BaseModel):
    average_mood: float
    average_energy: float
    average_focus: float
    mood_trend: List[dict]  # List of {date, value} pairs
    streak_days: int