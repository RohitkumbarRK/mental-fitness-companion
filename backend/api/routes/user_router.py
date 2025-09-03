from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List

from models.user import UserCreate, UserResponse, Token, UserInDB
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from config.database import users_collection

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    now = datetime.now()
    
    user_data = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": now,
        "updated_at": now,
        "streak": 0,
        "badges": [],
        "settings": {}
    }
    
    result = users_collection.insert_one(user_data)
    
    # Return the created user
    created_user = users_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    
    return UserResponse(
        id=created_user["id"],
        username=created_user["username"],
        email=created_user["email"],
        created_at=created_user["created_at"],
        streak=created_user["streak"],
        badges=created_user["badges"]
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user = users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        created_at=current_user["created_at"],
        streak=current_user["streak"],
        badges=current_user["badges"]
    )

@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    # Get user streak and badges
    user = users_collection.find_one({"_id": user_id})
    
    # Get counts of journal entries and mood check-ins
    from config.database import journals_collection, moods_collection
    
    journal_count = journals_collection.count_documents({"user_id": str(user_id)})
    mood_count = moods_collection.count_documents({"user_id": str(user_id)})
    
    return {
        "streak": user["streak"],
        "badges": user["badges"],
        "journal_entries": journal_count,
        "mood_checkins": mood_count
    }