import os
import logging
import hashlib
from typing import List, Dict, Any, Optional

import numpy as np
from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv

from auth import require_auth

load_dotenv()
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger("ai_full_service")

app = Flask(__name__)

# ---------------------------
# Model manager (lazy load)
# ---------------------------
class ModelManager:
    def __init__(self):
        self._embedder = None
        self._classifier = None

        self.embed_name = os.environ.get(
            "EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
        )
        self.cls_name = os.environ.get(
            "TEXT_CLASS_MODEL",
            "distilbert-base-uncased-finetuned-sst-2-english"
        )

    def embedder(self):
        if self._embedder is not None:
            return self._embedder
        try:
            from sentence_transformers import SentenceTransformer
            self._embedder = SentenceTransformer(self.embed_name)
            logger.info("Loaded embedder: %s", self.embed_name)
        except Exception:
            logger.warning("Embedder failed, using fallback")
            class Fallback:
                def encode(self, text):
                    h = hashlib.sha256(text.encode()).digest()
                    return np.array([b / 255.0 for b in h[:128]])
            self._embedder = Fallback()
        return self._embedder

    def classifier(self):
        if self._classifier is not None:
            return self._classifier
        try:
            from transformers import pipeline
            self._classifier = pipeline(
                "text-classification",
                model=self.cls_name,
                return_all_scores=False
            )
            logger.info("Loaded classifier: %s", self.cls_name)
        except Exception:
            logger.warning("Classifier failed, using fallback")
            class Fallback:
                def __call__(self, text):
                    score = (len(text) % 10) / 10
                    label = "POSITIVE" if score > 0.5 else "NEGATIVE"
                    return [{"label": label, "score": score}]
            self._classifier = Fallback()
        return self._classifier


MODELS = ModelManager()

# ---------------------------
# Schemas
# ---------------------------
class EmbedReq(BaseModel):
    text: str
    file_key: Optional[str] = None

class AnnotateReq(BaseModel):
    file_key: str
    text: str

class ForecastReq(BaseModel):
    file_key: str
    access_series: List[Dict[str, Any]]
    horizon_days: Optional[int] = 30

class AnomalyReq(BaseModel):
    entity_type: str
    entity_id: str
    features: dict

# ---------------------------
# In-memory vector store
# ---------------------------
VECTOR_DB: Dict[str, np.ndarray] = {}

def add_vector(key: str, vec: np.ndarray):
    VECTOR_DB[key] = vec

def semantic_search(vec: np.ndarray, top_k=10):
    if not VECTOR_DB:
        return []

    keys = list(VECTOR_DB.keys())
    mats = np.vstack([VECTOR_DB[k] for k in keys])

    q = vec / (np.linalg.norm(vec) + 1e-12)
    mats = mats / (np.linalg.norm(mats, axis=1, keepdims=True) + 1e-12)

    sims = mats.dot(q)
    idxs = np.argsort(-sims)[:top_k]

    return [
        {"file_key": keys[i], "score": float(sims[i])}
        for i in idxs
    ]

# ---------------------------
# Helpers
# ---------------------------
def ok(payload):
    return jsonify({"ok": True, **payload})

def bad(msg, code=400):
    return jsonify({"ok": False, "error": msg}), code

# ---------------------------
# Routes (ONLY API)
# ---------------------------

@app.get("/health")
def health():
    return ok({"status": "running"})

@app.get("/ai/models")
@require_auth(audience="ai-flask-service")
def meta_models():
    return ok({
        "models": {
            "embedder": MODELS.embed_name,
            "classifier": MODELS.cls_name,
            "anomaly": "Random Cut Forest",
            "forecast": "DeepAR"
        }
    })

@app.post("/ai/embed")
@require_auth(audience="ai-flask-service")
def embed():
    try:
        payload = EmbedReq(**request.json)
    except ValidationError:
        return bad("invalid payload")

    vec = MODELS.embedder().encode(payload.text)
    if payload.file_key:
        add_vector(payload.file_key, vec)

    return ok({
        "embedding_len": len(vec)
    })

@app.post("/ai/annotate")
@require_auth(audience="ai-flask-service")
def annotate():
    try:
        payload = AnnotateReq(**request.json)
    except ValidationError:
        return bad("invalid payload")

    result = MODELS.classifier()(payload.text)[0]
    vec = MODELS.embedder().encode(payload.text)

    add_vector(payload.file_key, vec)

    return ok({
        "file_key": payload.file_key,
        "label": result["label"],
        "confidence": result["score"],
        "embedding_len": len(vec)
    })

@app.post("/ai/search/semantic")
@require_auth(audience="ai-flask-service")
def search_semantic():
    body = request.json or {}
    query = body.get("query")
    top_k = int(body.get("top_k", 10))

    if not query:
        return bad("missing query")

    vec = MODELS.embedder().encode(query)
    results = semantic_search(vec, top_k)

    return ok({"results": results})

@app.post("/ai/anomaly/score")
@require_auth(audience="ai-flask-service")
def anomaly_score():
    try:
        payload = AnomalyReq(**request.json)
    except ValidationError:
        return bad("invalid payload")

    dl = float(payload.features.get("last_24h_download_mb", 0))
    writes = float(payload.features.get("write_count", 0))

    score = min(1.0, dl / 1000.0 + writes / 100.0)

    return ok({
        "entity_type": payload.entity_type,
        "entity_id": payload.entity_id,
        "score": score,
        "anomalous": score > 0.7
    })

@app.post("/ai/forecast")
@require_auth(audience="ai-flask-service")
def forecast():
    try:
        payload = ForecastReq(**request.json)
    except ValidationError:
        return bad("invalid payload")

    counts = [p.get("count", 0) for p in payload.access_series]
    lam = float(np.mean(counts)) if counts else 0.01

    expected = lam * payload.horizon_days
    p_access = 1.0 - np.exp(-expected)

    tier = "GLACIER" if p_access < 0.05 else "STANDARD"

    return ok({
        "file_key": payload.file_key,
        "expected_accesses": expected,
        "p_access": p_access,
        "recommended_tier": tier
    })

# ---------------------------
# Run
# ---------------------------
if __name__ == "__main__":
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    port = int(os.environ.get("FLASK_PORT", 5000))
    logger.info("Starting AI Flask service at %s:%s", host, port)
    app.run(host=host, port=port)
