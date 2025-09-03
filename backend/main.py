from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import user_router, chat_router, journal_router, mood_router

app = FastAPI(
    title="Mental Fitness Companion API",
    description="API for AI-powered mental fitness companion",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router.router, prefix="/api/users", tags=["users"])
app.include_router(chat_router.router, prefix="/api/chat", tags=["chat"])
app.include_router(journal_router.router, prefix="/api/journal", tags=["journal"])
app.include_router(mood_router.router, prefix="/api/mood", tags=["mood"])

@app.get("/")
async def root():
    return {"message": "Welcome to Mental Fitness Companion API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)