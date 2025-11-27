# ai_full_service.py
import os
import io
import base64
import json
import logging
import hashlib
import traceback
from typing import List, Dict, Any, Optional
from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
import numpy as np

# auth decorator (must be provided in ai_flask_service/auth.py)
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
        self._cls = None
        self._summ = None
        self._ner = None

        self.embed_name = os.environ.get("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        self.cls_name = os.environ.get("TEXT_CLASS_MODEL", "distilbert-base-uncased-finetuned-sst-2-english")
        self.summ_name = os.environ.get("SUMMARIZER_MODEL", "sshleifer/distilbart-cnn-12-6")
        self.ner_name = os.environ.get("NER_MODEL", "dbmdz/bert-large-cased-finetuned-conll03-english")

    # embedding
    def embedder(self):
        if self._embedder is not None:
            return self._embedder
        try:
            from sentence_transformers import SentenceTransformer
            self._embedder = SentenceTransformer(self.embed_name)
            logger.info("Loaded embedder: %s", self.embed_name)
            return self._embedder
        except Exception as e:
            logger.warning("Embedder load failed: %s — using fallback", e)
            class Fallback:
                def encode(self, text):
                    h = hashlib.sha256(text.encode()).digest()
                    return np.array([b / 255.0 for b in h[:128]], dtype=float)
            self._embedder = Fallback()
            return self._embedder

    # classifier
    def classifier(self):
        if self._cls is not None:
            return self._cls
        try:
            from transformers import pipeline
            self._cls = pipeline("text-classification", model=self.cls_name, return_all_scores=False)
            logger.info("Loaded classifier: %s", self.cls_name)
            return self._cls
        except Exception as e:
            logger.warning("Classifier load failed: %s — using fallback", e)
            class Fallback:
                def __call__(self, text):
                    score = (len(text) % 10) / 10
                    label = "POSITIVE" if score > 0.5 else "NEGATIVE"
                    return [{"label": label, "score": score}]
            self._cls = Fallback()
            return self._cls

    # summarizer
    def summarizer(self):
        if self._summ is not None:
            return self._summ
        try:
            from transformers import pipeline
            self._summ = pipeline("summarization", model=self.summ_name)
            logger.info("Loaded summarizer: %s", self.summ_name)
            return self._summ
        except Exception as e:
            logger.warning("Summarizer load failed: %s — using fallback", e)
            class Fallback:
                def __call__(self, text, **kw):
                    return [{"summary_text": text[:200] + ("..." if len(text) > 200 else "")}]
            self._summ = Fallback()
            return self._summ

    # ner
    def ner(self):
        if self._ner is not None:
            return self._ner
        try:
            from transformers import pipeline
            self._ner = pipeline("ner", model=self.ner_name, aggregation_strategy="simple")
            logger.info("Loaded ner: %s", self.ner_name)
            return self._ner
        except Exception as e:
            logger.warning("NER load failed: %s — using fallback", e)
            class Fallback:
                def __call__(self, text):
                    return []
            self._ner = Fallback()
            return self._ner

MODELS = ModelManager()

# ---------------------------
# Pydantic schemas
# ---------------------------
class EmbedReq(BaseModel):
    text: str
    file_key: Optional[str] = None

class BatchEmbedReq(BaseModel):
    texts: List[str]

class AnnotateReq(BaseModel):
    file_key: str
    text: str
    do_embed: Optional[bool] = True
    do_summary: Optional[bool] = True
    do_tags: Optional[bool] = True

class ForecastReq(BaseModel):
    file_key: str
    access_series: List[Dict[str, Any]]
    horizon_days: Optional[int] = 30

class ForecastBatchReq(BaseModel):
    files: List[ForecastReq]

class AnomalyReq(BaseModel):
    entity_type: str
    entity_id: str
    features: dict

class AnomalyBatchReq(BaseModel):
    rows: List[AnomalyReq]

# ---------------------------
# In-memory vector store (dev)
# ---------------------------
VECTOR_DB: Dict[str, Dict[str, Any]] = {}

def add_vector(key: str, vec: np.ndarray, meta: Optional[Dict[str, Any]] = None):
    VECTOR_DB[key] = {"embedding": np.asarray(vec, dtype=float), "meta": meta or {}}

def batch_add_vectors(entries: List[Dict[str, Any]]):
    for e in entries:
        key = e.get("file_key") or e.get("key")
        vec = np.asarray(e["embedding"], dtype=float)
        meta = e.get("meta", {})
        VECTOR_DB[key] = {"embedding": vec, "meta": meta}

def semantic_search(vec: np.ndarray, top_k=10):
    if not VECTOR_DB:
        return []
    keys = list(VECTOR_DB.keys())
    mats = np.vstack([VECTOR_DB[k]["embedding"] for k in keys])
    q = vec / (np.linalg.norm(vec) + 1e-12)
    mats_norm = mats / (np.linalg.norm(mats, axis=1, keepdims=True) + 1e-12)
    sims = mats_norm.dot(q)
    idxs = np.argsort(-sims)[:top_k]
    return [{"file_key": keys[i], "score": float(sims[i]), "meta": VECTOR_DB[keys[i]]["meta"]} for i in idxs]

# ---------------------------
# Helpers
# ---------------------------
def ok(payload: Dict[str, Any]):
    return jsonify({"ok": True, **payload})

def bad(msg: str, code: int = 400):
    return jsonify({"ok": False, "error": msg}), code

# ---------------------------
# Routes
# ---------------------------

@app.route("/health", methods=["GET"])
def health():
    return ok({"status": "running", "models": {"embedder": MODELS.embed_name, "classifier": MODELS.cls_name}})

@app.route("/meta/models", methods=["GET"])
@require_auth(audience="ai-flask-service")
def meta_models():
    return ok({"models": {"classifier": MODELS.cls_name, "embedder": MODELS.embed_name, "summarizer": MODELS.summ_name, "ner": MODELS.ner_name}})

# embed single
@app.route("/embed", methods=["POST"])
@require_auth(audience="ai-flask-service")
def embed():
    try:
        payload = EmbedReq(**(request.json or {}))
    except ValidationError as e:
        return bad("invalid payload")
    try:
        vec = MODELS.embedder().encode(payload.text)
        arr = vec.tolist()
        if payload.file_key:
            add_vector(payload.file_key, vec)
        return ok({"embedding": arr, "embedding_len": len(arr)})
    except Exception as e:
        logger.exception("embed failed")
        return bad(str(e), 500)

# batch embed
@app.route("/vector/batch-embed", methods=["POST"])
@require_auth(audience="ai-flask-service")
def batch_embed():
    try:
        payload = BatchEmbedReq(**(request.json or {}))
    except ValidationError:
        return bad("invalid payload")
    try:
        embedder = MODELS.embedder()
        out = []
        for t in payload.texts:
            v = embedder.encode(t).tolist()
            out.append({"text": t, "embedding": v, "len": len(v)})
        return ok({"results": out})
    except Exception as e:
        logger.exception("batch embed failed")
        return bad(str(e), 500)

# annotate
@app.route("/annotate", methods=["POST"])
@require_auth(audience="ai-flask-service")
def annotate():
    try:
        payload = AnnotateReq(**(request.json or {}))
    except ValidationError:
        return bad("invalid payload")
    try:
        tags = MODELS.classifier()(payload.text) if payload.do_tags else []
        summary = MODELS.summarizer()(payload.text)[0]["summary_text"] if payload.do_summary else None
        vec = MODELS.embedder().encode(payload.text) if payload.do_embed else None
        if vec is not None:
            add_vector(payload.file_key, vec, meta={"tags": tags, "summary": summary})
        resp = {"file_key": payload.file_key, "tags": tags}
        if summary is not None:
            resp["summary"] = summary
        if vec is not None:
            resp["embedding_len"] = len(vec)
        return ok(resp)
    except Exception as e:
        logger.exception("annotate failed")
        return bad(str(e), 500)

# semantic search
@app.route("/search/semantic", methods=["POST"])
@require_auth(audience="ai-flask-service")
def search_semantic():
    body = request.json or {}
    query = body.get("query")
    top_k = int(body.get("top_k", 10))
    if not query:
        return bad("missing query")
    try:
        vec = MODELS.embedder().encode(query)
        results = semantic_search(vec, top_k=top_k)
        return ok({"results": results})
    except Exception as e:
        logger.exception("semantic search failed")
        return bad(str(e), 500)

# similarity score between two texts (cosine of embeddings)
@app.route("/similarity/score", methods=["POST"])
@require_auth(audience="ai-flask-service")
def similarity_score():
    body = request.json or {}
    a = body.get("a")
    b = body.get("b")
    if not a or not b:
        return bad("missing a or b")
    try:
        emb = MODELS.embedder()
        va = emb.encode(a)
        vb = emb.encode(b)
        ca = va / (np.linalg.norm(va) + 1e-12)
        cb = vb / (np.linalg.norm(vb) + 1e-12)
        score = float(np.dot(ca, cb))
        return ok({"score": score})
    except Exception as e:
        logger.exception("similarity failed")
        return bad(str(e), 500)

# OCR - very small fallback (use tesseract in production)
@app.route("/ocr", methods=["POST"])
@require_auth(audience="ai-flask-service")
def ocr():
    body = request.json or {}
    b64 = body.get("base64")
    if not b64:
        return bad("missing base64")
    try:
        # In simple fallback return file size and base64 length
        data = base64.b64decode(b64)
        text_len = len(data)
        # Real implementation: run Tesseract or pdfminer
        return ok({"text": f"<ocr-fallback length={text_len}>", "length": text_len})
    except Exception as e:
        logger.exception("ocr failed")
        return bad(str(e), 500)

# extract text from PDF (fallback)
@app.route("/extract/text", methods=["POST"])
@require_auth(audience="ai-flask-service")
def extract_text():
    body = request.json or {}
    presigned = body.get("presigned_url")
    b64 = body.get("base64")
    if not presigned and not b64:
        return bad("missing presigned_url or base64")
    try:
        # Fallback: if base64 provided, return first N bytes -> string
        if b64:
            data = base64.b64decode(b64)
            preview = data[:1024].decode(errors="replace")
            return ok({"text": preview})
        else:
            # For presigned_url, return placeholder (in prod fetch and run pdfminer)
            return ok({"text": "<extracted-text-placeholder-from-presigned-url>"})
    except Exception as e:
        logger.exception("extract text failed")
        return bad(str(e), 500)

# classification
@app.route("/classify", methods=["POST"])
@require_auth(audience="ai-flask-service")
def classify():
    body = request.json or {}
    text = body.get("text")
    if not text:
        return bad("missing text")
    try:
        labels = MODELS.classifier()(text)
        return ok({"labels": labels})
    except Exception as e:
        logger.exception("classify failed")
        return bad(str(e), 500)

# NER
@app.route("/ner", methods=["POST"])
@require_auth(audience="ai-flask-service")
def ner():
    body = request.json or {}
    text = body.get("text")
    if not text:
        return bad("missing text")
    try:
        ents = MODELS.ner()(text)
        return ok({"entities": ents})
    except Exception as e:
        logger.exception("ner failed")
        return bad(str(e), 500)

# compliance / PII inspect (very small heuristic)
@app.route("/compliance/inspect", methods=["POST"])
@require_auth(audience="ai-flask-service")
def compliance_inspect():
    body = request.json or {}
    text = body.get("text", "")
    if not text:
        return bad("missing text")
    try:
        found = []
        if "@" in text:
            found.append("EMAIL")
        if any(c.isdigit() for c in text) and ("+" in text or len([c for c in text if c.isdigit()]) > 8):
            found.append("PHONE")
        return ok({"contains_pii": bool(found), "pii_types": found})
    except Exception as e:
        logger.exception("compliance inspect failed")
        return bad(str(e), 500)

# summarization
@app.route("/summarize", methods=["POST"])
@require_auth(audience="ai-flask-service")
def summarize():
    body = request.json or {}
    text = body.get("text")
    max_length = body.get("max_length", 150)
    if not text:
        return bad("missing text")
    try:
        summary = MODELS.summarizer()(text)[0]["summary_text"]
        # truncate to max_length if specified
        if max_length and len(summary) > max_length:
            summary = summary[:max_length].rsplit(" ", 1)[0] + "..."
        return ok({"summary": summary})
    except Exception as e:
        logger.exception("summarize failed")
        return bad(str(e), 500)

# keywords (simple tf heuristic fallback)
@app.route("/keywords", methods=["POST"])
@require_auth(audience="ai-flask-service")
def keywords():
    body = request.json or {}
    text = body.get("text", "")
    top_k = int(body.get("top_k", 10))
    if not text:
        return bad("missing text")
    try:
        words = [w.lower().strip(".,") for w in text.split()]
        freq = {}
        for w in words:
            freq[w] = freq.get(w, 0) + 1
        sorted_words = sorted(freq.items(), key=lambda x: -x[1])
        kws = [w for w, _ in sorted_words[:top_k]]
        return ok({"keywords": kws})
    except Exception as e:
        logger.exception("keywords failed")
        return bad(str(e), 500)

# title generation (simple fallback)
@app.route("/titles/generate", methods=["POST"])
@require_auth(audience="ai-flask-service")
def generate_title():
    body = request.json or {}
    text = body.get("text", "")
    if not text:
        return bad("missing text")
    try:
        title = text.strip().split("\n")[0][:80]
        return ok({"title": title})
    except Exception as e:
        logger.exception("title generation failed")
        return bad(str(e), 500)

# forecast single
@app.route("/forecast", methods=["POST"])
@require_auth(audience="ai-flask-service")
def forecast():
    try:
        payload = ForecastReq(**(request.json or {}))
    except ValidationError:
        return bad("invalid payload")
    try:
        counts = [p.get("count", 0) for p in payload.access_series]
        lam = float(np.mean(counts)) if counts else 0.01
        expected = lam * float(payload.horizon_days)
        p_access = 1.0 - np.exp(-expected)
        recommended_tier = "GLACIER" if p_access < 0.05 else "STANDARD"
        return ok({"file_key": payload.file_key, "p_access": p_access, "expected_accesses": expected, "recommended_tier": recommended_tier})
    except Exception as e:
        logger.exception("forecast failed")
        return bad(str(e), 500)

# forecast batch
@app.route("/forecast/batch", methods=["POST"])
@require_auth(audience="ai-flask-service")
def forecast_batch():
    try:
        payload = ForecastBatchReq(**(request.json or {}))
    except ValidationError:
        return bad("invalid payload")
    try:
        out = []
        for f in payload.files:
            counts = [p.get("count", 0) for p in f.access_series]
            lam = float(np.mean(counts)) if counts else 0.01
            expected = lam * float(f.horizon_days)
            p_access = 1.0 - np.exp(-expected)
            tier = "GLACIER" if p_access < 0.05 else "STANDARD"
            out.append({"file_key": f.file_key, "p_access": p_access, "expected_accesses": expected, "recommended_tier": tier})
        return ok({"results": out})
    except Exception as e:
        logger.exception("forecast batch failed")
        return bad(str(e), 500)

# anomaly single
@app.route("/anomaly/score", methods=["POST"])
@require_auth(audience="ai-flask-service")
def anomaly_score():
    try:
        payload = AnomalyReq(**(request.json or {}))
    except ValidationError:
        return bad("invalid payload")
    try:
        dl = float(payload.features.get("last_24h_download_mb", 0))
        writes = float(payload.features.get("write_count", 0))
        score = min(1.0, dl / 1000.0 + writes / 100.0)
        return ok({"entity_type": payload.entity_type, "entity_id": payload.entity_id, "score": score, "anomalous": score > 0.7})
    except Exception as e:
        logger.exception("anomaly failed")
        return bad(str(e), 500)

# anomaly batch
@app.route("/anomaly/batch", methods=["POST"])
@require_auth(audience="ai-flask-service")
def anomaly_batch():
    try:
        payload = AnomalyBatchReq(**(request.json or {}))
    except ValidationError:
        return bad("invalid payload")
    try:
        out = []
        for r in payload.rows:
            dl = float(r.features.get("last_24h_download_mb", 0))
            writes = float(r.features.get("write_count", 0))
            score = min(1.0, dl / 1000.0 + writes / 100.0)
            out.append({"entity_type": r.entity_type, "entity_id": r.entity_id, "score": score, "anomalous": score > 0.7})
        return ok({"results": out})
    except Exception as e:
        logger.exception("anomaly batch failed")
        return bad(str(e), 500)

# audit inspect (pass-through)
@app.route("/audit/inspect", methods=["POST"])
@require_auth(audience="ai-flask-service")
def audit_inspect():
    body = request.json or {}
    # placeholder: in prod run policy checks or ML-based inspection
    return ok({"inspected": True, "summary": {"keys": list(body.keys())}})

# perceptual hash (fallback)
@app.route("/hash/perceptual", methods=["POST"])
@require_auth(audience="ai-flask-service")
def hash_perceptual():
    body = request.json or {}
    b64 = body.get("base64")
    if not b64:
        return bad("missing base64")
    try:
        data = base64.b64decode(b64)
        # simple SHA256 as placeholder for perceptual hash
        ph = hashlib.sha256(data).hexdigest()
        return ok({"phash": ph})
    except Exception as e:
        logger.exception("perceptual hash failed")
        return bad(str(e), 500)

# fingerprint text
@app.route("/fingerprint/text", methods=["POST"])
@require_auth(audience="ai-flask-service")
def fingerprint_text():
    body = request.json or {}
    text = body.get("text", "")
    if not text:
        return bad("missing text")
    fp = hashlib.sha256(text.lower().encode()).hexdigest()
    return ok({"fingerprint": fp})

# analyze thesis (reads local file path - use with caution in prod)
@app.route("/analyze/thesis", methods=["GET"])
@require_auth(audience="ai-flask-service")
def analyze_thesis():
    # developer-provided local path to thesis file
    thesis_path = "/mnt/data/UNDERGRADUATE THESIS- CHIBUIKE TIMOTHY BENEDICT-FINAL.pdf"
    # allow override via query param
    path_param = request.args.get("path")
    if path_param:
        thesis_path = path_param

    if not os.path.exists(thesis_path):
        return bad("file not found", 404)
    try:
        size = os.path.getsize(thesis_path)
        with open(thesis_path, "rb") as f:
            preview = base64.b64encode(f.read(1024)).decode()
        # produce a small analysis: hash, size, preview
        sha256 = hashlib.sha256(open(thesis_path,"rb").read()).hexdigest()
        return ok({"path": thesis_path, "size": size, "sha256": sha256, "preview_chunk_b64": preview})
    except Exception as e:
        logger.exception("analyze thesis failed")
        return bad(str(e), 500)

# ---------------------------
# Run
# ---------------------------
if __name__ == "__main__":
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    port = int(os.environ.get("FLASK_PORT", 5000))
    logger.info("Starting AI Flask service at %s:%s", host, port)
    app.run(host=host, port=port)
