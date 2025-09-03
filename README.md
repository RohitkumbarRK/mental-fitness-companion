<<<<<<< HEAD
# mental-fitness-companion
=======
# AI-Powered Mental Fitness Companion

A personal AI coach that helps users build emotional resilience, focus, and productivity through daily text-based micro-interactions.

## Features

- Conversational AI trained on CBT and mindfulness
- Text-based journaling and coaching sessions
- Daily mood, focus, and energy check-ins
- Smart, personalized habit recommendations
- Gamified progress tracking (streaks, badges, progress charts)
- Persistent memory using LangChain
- Emotion detection from text input (sentiment analysis)

## Tech Stack

- **AI Model**: Mistral 7B Instruct
- **Frontend**: React/Next.js
- **Backend**: FastAPI
- **Database**: MongoDB
- **Personalization**: LangChain + FAISS (local memory store)
- **Emotion Analysis**: Hugging Face distilbert-base-uncased-emotion

## Project Structure

```
mental-fitness-companion/
├── backend/               # FastAPI backend
│   ├── api/               # API routes
│   ├── config/            # Configuration files
│   ├── models/            # Pydantic models
│   ├── utils/             # Utility functions
│   └── main.py            # Main application file
├── frontend/              # Next.js frontend
│   ├── components/        # React components
│   ├── pages/             # Next.js pages
│   ├── styles/            # CSS styles
│   └── utils/             # Utility functions
└── README.md              # Project documentation
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Download the Mistral model:
   ```
   python download_model.py
   ```

6. Create a `.env` file in the backend directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=mental_fitness_app
   JWT_SECRET=your_jwt_secret_key_here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   MODEL_PATH=./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf
   ```

7. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with the following content:
   ```
   API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Register a new account or log in with an existing account
2. Navigate to the dashboard to see an overview of your mental fitness journey
3. Use the chat feature to talk with your AI coach
4. Create journal entries to process your thoughts and emotions
5. Track your mood, energy, and focus levels with daily check-ins
6. View your progress over time in the progress section

## License

This project is licensed under the MIT License - see the LICENSE file for details.
>>>>>>> 0436dbe8e (Initial commit)
