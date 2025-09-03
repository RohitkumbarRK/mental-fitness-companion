from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import mock database instead of real one
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'config'))

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

# Import routers after setting up mock database
from api.routes import user_router

# Include routers (only user router for now)
app.include_router(user_router.router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Welcome to Mental Fitness Companion API (Test Mode)"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "test"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_test:app", host="0.0.0.0", port=8000, reload=True)