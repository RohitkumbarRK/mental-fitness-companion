from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from models.journal import JournalCreate, JournalResponse, JournalEntry
from utils.auth import get_current_user
from utils.sentiment import get_text_insights
from config.ai_config import get_llm
from config.database import journals_collection

router = APIRouter()

@router.post("/", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    journal: JournalCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    now = datetime.now()
    
    # Create journal entry
    journal_data = {
        "user_id": user_id,
        "content": journal.content,
        "mood": journal.mood,
        "tags": journal.tags,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert into database
    result = journals_collection.insert_one(journal_data)
    
    # Get insights from AI
    llm = get_llm()
    prompt = f"""
    Based on the following journal entry, provide a brief, supportive insight that might help the person. 
    Be empathetic and constructive. Keep it to 2-3 sentences maximum.
    
    Journal entry: {journal.content}
    """
    
    insights = llm(prompt)
    
    # Get created journal entry
    created_journal = journals_collection.find_one({"_id": result.inserted_id})
    
    return JournalResponse(
        id=str(created_journal["_id"]),
        content=created_journal["content"],
        mood=created_journal["mood"],
        tags=created_journal["tags"],
        created_at=created_journal["created_at"],
        insights=insights
    )

@router.get("/", response_model=List[JournalResponse])
async def get_journal_entries(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Get all journal entries for user
    entries = list(journals_collection.find({"user_id": user_id}).sort("created_at", -1))
    
    # Convert ObjectId to string
    for entry in entries:
        entry["id"] = str(entry["_id"])
    
    return entries

@router.get("/{journal_id}", response_model=JournalResponse)
async def get_journal_entry(
    journal_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    # Get journal entry
    entry = journals_collection.find_one({"_id": ObjectId(journal_id), "user_id": user_id})
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    # Convert ObjectId to string
    entry["id"] = str(entry["_id"])
    
    # Get insights from AI
    llm = get_llm()
    prompt = f"""
    Based on the following journal entry, provide a brief, supportive insight that might help the person. 
    Be empathetic and constructive. Keep it to 2-3 sentences maximum.
    
    Journal entry: {entry["content"]}
    """
    
    insights = llm(prompt)
    entry["insights"] = insights
    
    return entry

@router.delete("/{journal_id}")
async def delete_journal_entry(
    journal_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    # Delete journal entry
    result = journals_collection.delete_one({"_id": ObjectId(journal_id), "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    return {"message": "Journal entry deleted successfully"}