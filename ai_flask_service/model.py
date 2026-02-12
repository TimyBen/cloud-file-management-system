# model.py
import logging
from typing import Optional
from app import MODELS  # import the global model manager from app.py

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def get_text_classifier():
    """
    Wrapper so other modules import from model.py instead of app.MODELS.
    """
    try:
        return MODELS.classifier()
    except Exception as e:
        logger.error("Failed to load text classifier: %s", e)
        raise

def get_embedder():
    """
    Wrapper to use the embedder from ModelManager.
    If unavailable, returns None.
    """
    try:
        emb = MODELS.embedder()
        return emb
    except Exception as e:
        logger.error("Failed to load embedder: %s", e)
        return None
