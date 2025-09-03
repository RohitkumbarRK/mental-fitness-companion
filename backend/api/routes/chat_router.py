from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from models.chat import ChatRequest, ChatResponse, Message, ChatSession
from utils.auth import get_current_user
from utils.sentiment import get_text_insights
from config.ai_config import get_conversation_chain, MENTAL_HEALTH_SYSTEM_PROMPT
from config.database import chats_collection

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    # Get or create chat session
    chat_session = chats_collection.find_one({"user_id": user_id})
    
    if not chat_session:
        # Create new chat session
        chat_session = {
            "user_id": user_id,
            "messages": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        chats_collection.insert_one(chat_session)
    
    # Add user message to session
    user_message = {
        "role": "user",
        "content": chat_request.message,
        "timestamp": datetime.now()
    }
    
    # Get conversation chain
    conversation = get_conversation_chain(user_id=user_id)
    
    # Get AI response
    response = conversation({"question": chat_request.message})
    ai_response = response["answer"]
    
    # Add AI message to session
    ai_message = {
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.now()
    }
    
    # Update chat session in database
    chats_collection.update_one(
        {"user_id": user_id},
        {
            "$push": {"messages": {"$each": [user_message, ai_message]}},
            "$set": {"updated_at": datetime.now()}
        }
    )
    
    # Analyze sentiment of user message
    insights = get_text_insights(chat_request.message)
    
    # Generate suggestions based on emotion
    suggestions = []
    emotion = insights["emotion"]["emotion"]
    
    if emotion == "sadness":
        suggestions = [
            "Try a quick 5-minute meditation",
            "Write down three things you're grateful for",
            "Take a short walk outside"
        ]
    elif emotion == "anger":
        suggestions = [
            "Practice deep breathing for 2 minutes",
            "Try progressive muscle relaxation",
            "Write down what's bothering you"
        ]
    elif emotion == "fear":
        suggestions = [
            "Try the 5-4-3-2-1 grounding technique",
            "Practice box breathing",
            "Challenge negative thoughts"
        ]
    
    return ChatResponse(
        response=ai_response,
        sentiment=insights["emotion"]["emotion"],
        suggestions=suggestions
    )

@router.get("/history", response_model=List[Message])
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Get chat session
    chat_session = chats_collection.find_one({"user_id": user_id})
    
    if not chat_session:
        return []
    
    return chat_session["messages"]

@router.delete("/history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Delete chat session
    result = chats_collection.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No chat history found"
        )
    
    return {"message": "Chat history cleared successfully"}