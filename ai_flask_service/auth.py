import os, logging
from functools import wraps
from flask import request, jsonify
import jwt

logger = logging.getLogger("ai_flask_auth")
PUBLIC_KEY_PATH = os.environ.get("SERVICE_ACCOUNT_PUB_KEY_PATH", "certs/service_account.pub.pem")
EXPECTED_ISS = os.environ.get("SERVICE_ACCOUNT_ISS", "nest-api")

def load_public_key():
    if os.path.exists(PUBLIC_KEY_PATH):
        with open(PUBLIC_KEY_PATH, "r") as f:
            return f.read()
    raise RuntimeError("public key missing")

_PUBLIC_KEY = None
def verify_jwt_token(token: str, audience: str = None):
    global _PUBLIC_KEY
    if _PUBLIC_KEY is None:
        _PUBLIC_KEY = load_public_key()
    options = {"require": ["exp", "iat", "iss", "sub"]}
    decoded = jwt.decode(token, _PUBLIC_KEY, algorithms=["RS256"], audience=audience, options=options)
    if decoded.get("iss") != EXPECTED_ISS:
        raise jwt.InvalidIssuerError("invalid issuer")
    return decoded

def require_auth(audience: str = None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"ok": False, "error": "missing_auth"}), 401
            token = auth.split(" ",1)[1].strip()
            try:
                payload = verify_jwt_token(token, audience)
                request.service_jwt = payload
                return fn(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"ok": False, "error": "token_expired"}), 401
            except Exception as e:
                logger.exception("jwt verify failed: %s", e)
                return jsonify({"ok": False, "error": "invalid_token"}), 401
        return wrapper
    return decorator
