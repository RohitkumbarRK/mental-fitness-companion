import os
from typing import Optional, List, Any
from dotenv import load_dotenv

# LangChain components
from langchain.llms.base import LLM
try:
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.vectorstores import FAISS
    HAS_RETRIEVAL = True
except Exception:
    HuggingFaceEmbeddings = None  # type: ignore
    FAISS = None  # type: ignore
    HAS_RETRIEVAL = False
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

# Gemini SDK
import google.generativeai as genai
from pydantic.v1 import PrivateAttr

# Load environment variables
load_dotenv()
USE_RETRIEVAL_ENV = os.getenv("USE_RETRIEVAL", "auto").lower()

# System prompt for mental health coaching
MENTAL_HEALTH_SYSTEM_PROMPT = """
You are a supportive and empathetic mental fitness coach. Your goal is to help users build emotional resilience, 
focus, and productivity through thoughtful conversations. You use principles from Cognitive Behavioral Therapy (CBT) 
and mindfulness practices.

Guidelines:
1. Be empathetic and supportive, but not clinical or overly formal
2. Ask open-ended questions to encourage reflection
3. Provide practical, actionable advice when appropriate
4. Recognize emotional states from user's text
5. Suggest relevant mindfulness or CBT techniques when helpful
6. Maintain a positive and encouraging tone
7. Never provide medical advice or attempt to diagnose conditions
8. If a user appears to be in crisis, gently suggest professional help

Remember that your purpose is to be a supportive companion for daily mental wellness, 
not to replace professional mental health care.
"""

# Config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


class GeminiLLM(LLM):
    """LangChain-compatible wrapper over the Gemini API."""

    # Private attributes to avoid Pydantic validation errors
    _model: Any = PrivateAttr()
    _system_prompt: str = PrivateAttr()

    def __init__(self, model_name: str = GEMINI_MODEL, system_prompt: str = MENTAL_HEALTH_SYSTEM_PROMPT):
        super().__init__()
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        genai.configure(api_key=GEMINI_API_KEY)
        self._model = genai.GenerativeModel(model_name)
        self._system_prompt = system_prompt

    @property
    def _llm_type(self) -> str:
        return "gemini"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        # Prepend the system prompt to enforce tone/safety each call
        combined_prompt = f"{self._system_prompt.strip()}\n\nUser message and context:\n{prompt}"
        try:
            response = self._model.generate_content(combined_prompt)
            text = response.text or ""
        except Exception:
            text = "I'm sorry, I had trouble generating a response. Could you please try again?"
        # Respect stop tokens if provided
        if stop:
            for s in stop:
                if s in text:
                    text = text.split(s)[0]
        return text.strip()


# Initialize the LLM
def get_llm():
    return GeminiLLM()


# Initialize embeddings
def get_embeddings():
    if not HAS_RETRIEVAL or HuggingFaceEmbeddings is None:
        return None
    try:
        return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    except Exception:
        return None


# Create or load vector store
def get_vector_store(documents=None, user_id=None):
    # Decide whether retrieval is enabled
    if USE_RETRIEVAL_ENV == "false":
        return None
    if USE_RETRIEVAL_ENV == "true" and (FAISS is None or not HAS_RETRIEVAL):
        # Explicitly requested but unavailable
        return None
    if USE_RETRIEVAL_ENV in ("auto", "true") and (FAISS is None or not HAS_RETRIEVAL):
        return None

    embeddings = get_embeddings()
    if embeddings is None:
        return None

    if documents and user_id:
        vector_store = FAISS.from_documents(documents, embeddings)
        os.makedirs("./vector_stores", exist_ok=True)
        vector_store.save_local(f"./vector_stores/{user_id}")
        return vector_store
    elif user_id and os.path.exists(f"./vector_stores/{user_id}"):
        return FAISS.load_local(f"./vector_stores/{user_id}", embeddings)
    else:
        return FAISS.from_texts(["Hello, I'm your mental fitness companion."], embeddings)


# Simple chain used when retrieval stack is unavailable
class SimpleConversationChain:
    def __init__(self, llm: LLM, memory: ConversationBufferMemory):
        self.llm = llm
        self.memory = memory

    def __call__(self, inputs: dict):
        question = inputs.get("question", "").strip()
        # Build lightweight context from memory
        history_msgs = []
        if hasattr(self.memory, "chat_memory") and getattr(self.memory.chat_memory, "messages", None):
            for m in self.memory.chat_memory.messages[-6:]:  # last few messages
                role = getattr(m, "type", getattr(m, "role", "user"))
                content = getattr(m, "content", "")
                history_msgs.append(f"{role}: {content}")
        history_text = "\n".join(history_msgs)
        prompt = (f"Conversation so far (may be empty):\n{history_text}\n\n"
                  f"User: {question}\nAssistant:")
        answer = self.llm._call(prompt)
        # Save to memory for continuity
        try:
            self.memory.save_context({"question": question}, {"answer": answer})
        except Exception:
            pass
        return {"answer": answer}


# Create conversation chain
def get_conversation_chain(user_id=None):
    llm = get_llm()
    vector_store = get_vector_store(user_id=user_id)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    if vector_store is not None and HAS_RETRIEVAL:
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_store.as_retriever(),
            memory=memory,
            verbose=False
        )
        return conversation_chain

    # Fallback: simple conversation without retrieval
    return SimpleConversationChain(llm=llm, memory=memory)