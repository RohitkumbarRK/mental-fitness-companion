import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB connection string from environment variables
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mental_fitness_app")

# Create MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
chats_collection = db["chats"]
journals_collection = db["journals"]
moods_collection = db["moods"]
habits_collection = db["habits"]

# Create indexes
users_collection.create_index("email", unique=True)
users_collection.create_index("username", unique=True)