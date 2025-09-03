# Hybrid sentiment/emotion: uses transformers if available, otherwise a lightweight heuristic fallback
try:
    from transformers import pipeline
    import torch
    HAS_TRANSFORMERS = True
except Exception:
    pipeline = None  # type: ignore
    torch = None  # type: ignore
    HAS_TRANSFORMERS = False

# Setup pipelines if available
if HAS_TRANSFORMERS:
    device = 0 if torch.cuda.is_available() else -1
    sentiment_analyzer = pipeline(
        "text-classification",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        device=device,
    )
    emotion_detector = pipeline(
        "text-classification",
        model="bhadresh-savani/distilbert-base-uncased-emotion",
        device=device,
    )

# Keyword sets for heuristic fallback
POSITIVE_WORDS = {
    "good", "great", "happy", "love", "calm", "okay", "fine", "grateful", "hopeful", "relaxed"
}
NEGATIVE_WORDS = {
    "bad", "sad", "depressed", "angry", "upset", "stressed", "anxious", "worried", "afraid", "tired"
}
EMOTION_KEYWORDS = {
    "sadness": {"sad", "down", "depressed", "lonely", "cry", "empty"},
    "anger": {"angry", "mad", "furious", "annoyed", "irritated", "rage"},
    "fear": {"fear", "afraid", "scared", "anxious", "worried", "panic"},
    "joy": {"happy", "joy", "excited", "grateful", "content", "proud"},
}


def analyze_sentiment(text: str):
    text = (text or "").strip()
    if HAS_TRANSFORMERS:
        result = sentiment_analyzer(text)[0]
        return {"label": result["label"], "score": float(result["score"]) }
    # Heuristic fallback
    lower = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in lower)
    label = "POSITIVE" if pos > neg else ("NEGATIVE" if neg > pos else "NEUTRAL")
    score = 0.5 + 0.1 * abs(pos - neg)
    return {"label": label, "score": min(score, 0.99)}


def detect_emotion(text: str):
    text = (text or "").strip()
    if HAS_TRANSFORMERS:
        result = emotion_detector(text)[0]
        return {"emotion": result["label"], "score": float(result["score"]) }
    # Heuristic fallback: choose the emotion with most keyword hits
    lower = text.lower()
    best_emotion = "joy"
    best_hits = -1
    for emotion, words in EMOTION_KEYWORDS.items():
        hits = sum(1 for w in words if w in lower)
        if hits > best_hits:
            best_emotion, best_hits = emotion, hits
    score = 0.5 + 0.1 * max(best_hits, 0)
    return {"emotion": best_emotion, "score": min(score, 0.95)}


def get_text_insights(text: str):
    sentiment = analyze_sentiment(text)
    emotion = detect_emotion(text)
    return {"sentiment": sentiment, "emotion": emotion}