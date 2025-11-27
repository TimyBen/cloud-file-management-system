import os
import logging
from typing import Optional
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Lazy imports for heavy libraries
def _safe_import_transformers():
    try:
        from transformers import pipeline
        return pipeline
    except Exception as e:
        logger.error('transformers import failed: %s', e)
        raise

def _safe_import_sentence_transformers():
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer
    except Exception as e:
        logger.warning('sentence-transformers not available: %s', e)
        return None

_text_classifier = None
_embedder = None

def get_text_classifier():
    global _text_classifier
    if _text_classifier is None:
        model_name = os.environ.get('TEXT_CLASS_MODEL', 'distilbert-base-uncased-finetuned-sst-2-english')
        pipeline = _safe_import_transformers()
        logger.info('Loading text classification model: %s', model_name)
        _text_classifier = pipeline('text-classification', model=model_name, return_all_scores=False)
    return _text_classifier

def get_embedder():
    global _embedder
    if _embedder is None:
        model_name = os.environ.get('EMBED_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
        SentenceTransformer = _safe_import_sentence_transformers()
        if SentenceTransformer is None:
            logger.info('No embedding model available (sentence-transformers not installed)')
            return None
        logger.info('Loading embedder model: %s', model_name)
        _embedder = SentenceTransformer(model_name)
    return _embedder
