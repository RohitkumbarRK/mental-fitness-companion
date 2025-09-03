from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timedelta
from bson import ObjectId

from models.mood import MoodCreate, MoodResponse, MoodStats
from utils.auth import get_current_user
from config.database import moods_collection, users_collection

router = APIRouter()

@router.post("/", response_model=MoodResponse, status_code=status.HTTP_201_CREATED)
async def create_mood_entry(
    mood: MoodCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    now = datetime.now()
    
    # Create mood entry
    mood_data = {
        "user_id": user_id,
        "mood_score": mood.mood_score,
        "energy_level": mood.energy_level,
        "focus_level": mood.focus_level,
        "notes": mood.notes,
        "created_at": now
    }
    
    # Insert into database
    result = moods_collection.insert_one(mood_data)
    
    # Update user streak
    # Check if user has logged mood today or yesterday
    yesterday = now - timedelta(days=1)
    yesterday_start = datetime(yesterday.year, yesterday.month, yesterday.day)
    
    recent_mood = moods_collection.find_one({
        "user_id": user_id,
        "created_at": {"$gte": yesterday_start, "$lt": now}
    })
    
    if recent_mood:
        # User has logged mood recently, increment streak
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"streak": 1}}
        )
    else:
        # Reset streak
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"streak": 1}}
        )
    
    # Check if user has earned any badges
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    streak = user.get("streak", 0)
    badges = user.get("badges", [])
    
    # Add streak badges
    if streak >= 7 and "7-day-streak" not in badges:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"badges": "7-day-streak"}}
        )
    
    if streak >= 30 and "30-day-streak" not in badges:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"badges": "30-day-streak"}}
        )
    
    # Get created mood entry
    created_mood = moods_collection.find_one({"_id": result.inserted_id})
    
    return MoodResponse(
        id=str(created_mood["_id"]),
        mood_score=created_mood["mood_score"],
        energy_level=created_mood["energy_level"],
        focus_level=created_mood["focus_level"],
        notes=created_mood["notes"],
        created_at=created_mood["created_at"]
    )

@router.get("/", response_model=List[MoodResponse])
async def get_mood_entries(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Get all mood entries for user
    entries = list(moods_collection.find({"user_id": user_id}).sort("created_at", -1))
    
    # Convert ObjectId to string
    for entry in entries:
        entry["id"] = str(entry["_id"])
    
    return entries

@router.get("/stats", response_model=MoodStats)
async def get_mood_stats(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Get all mood entries for user
    entries = list(moods_collection.find({"user_id": user_id}))
    
    if not entries:
        return MoodStats(
            average_mood=0,
            average_energy=0,
            average_focus=0,
            mood_trend=[],
            streak_days=0
        )
    
    # Calculate averages
    total_mood = sum(entry["mood_score"] for entry in entries)
    total_energy = sum(entry["energy_level"] for entry in entries)
    total_focus = sum(entry["focus_level"] for entry in entries)
    count = len(entries)
    
    # Get user streak
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    streak = user.get("streak", 0)
    
    # Create mood trend data (last 7 days)
    today = datetime.now()
    mood_trend = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)
        
        # Find mood entry for this day
        day_entry = moods_collection.find_one({
            "user_id": user_id,
            "created_at": {"$gte": day_start, "$lt": day_end}
        })
        
        mood_value = day_entry["mood_score"] if day_entry else None
        mood_trend.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "value": mood_value
        })
    
    return MoodStats(
        average_mood=round(total_mood / count, 1),
        average_energy=round(total_energy / count, 1),
        average_focus=round(total_focus / count, 1),
        mood_trend=mood_trend,
        streak_days=streak
    )