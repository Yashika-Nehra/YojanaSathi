# Loads the trained TF-IDF artifact produced by ml/train.py and re-ranks
# eligible schemes by similarity to the user's goal text. If the model file is
# missing or the user gave no goal text, rule order is kept.

import logging
import os

from .config import MODEL_PATH

log = logging.getLogger("ranking")
_model = None
_tried = False


def load_model():
    global _model, _tried
    if not _tried:
        _tried = True
        try:
            if MODEL_PATH and os.path.exists(MODEL_PATH):
                import joblib
                _model = joblib.load(MODEL_PATH)
                log.info("Ranking model loaded from %s", MODEL_PATH)
            else:
                log.info("No ranking model at %s, search runs on rules only", MODEL_PATH)
        except Exception as e:
            log.warning("Could not load ranking model: %s", e)
    return _model


def model_info():
    m = load_model()
    if not m:
        return {"trained": False, "note": "Model file not found. Run ml/train.py to create ml/model.joblib."}
    return {
        "trained": True,
        "train_size": m.get("train_size"),
        "accuracy": round(m.get("accuracy", 0.0), 4),
        "classes": m.get("classes", []),
    }


def rank_schemes(profile, docs):
    m = load_model()
    query = (profile.goal_text or "").strip()
    if not m or not query or not docs:
        return docs, False
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        vec = m["vectorizer"]
        qv = vec.transform([query])
        texts = [
            f'{d.get("name", "")} {d.get("benefits", "")} {" ".join(d.get("tags", []) or [])}'
            for d in docs
        ]
        scores = cosine_similarity(qv, vec.transform(texts))[0]
        for d, s in zip(docs, scores):
            d["_score"] = float(s)
        docs.sort(key=lambda d: d["_score"], reverse=True)
        for d in docs:
            d.pop("_score", None)
        return docs, True
    except Exception as e:
        log.warning("Ranking failed, returning rule order: %s", e)
        return docs, False
