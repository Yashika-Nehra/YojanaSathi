"""Password hashing and MongoDB-backed session helpers for YojanaSathi."""
from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import secrets
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .db import get_db

SESSION_DAYS = 30
PBKDF2_ITERATIONS = 310_000
_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, iterations, salt_b64, digest_b64 = encoded.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_b64.encode())
        expected = base64.urlsafe_b64decode(digest_b64.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def new_session(user_id: str) -> str:
    token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    get_db().sessions.insert_one({
        "token_hash": token_hash,
        "user_id": user_id,
        "created_at": now,
        "expires_at": now + timedelta(days=SESSION_DAYS),
    })
    return token


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer)):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required", headers={"WWW-Authenticate": "Bearer"})

    db = get_db()
    session = db.sessions.find_one({"token_hash": _token_hash(credentials.credentials)})
    now = datetime.now(timezone.utc)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session", headers={"WWW-Authenticate": "Bearer"})
    expires = session.get("expires_at")
    if expires and expires <= now:
        db.sessions.delete_one({"_id": session["_id"]})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired", headers={"WWW-Authenticate": "Bearer"})

    user = db.users.find_one({"id": session.get("user_id")})
    if not user:
        db.sessions.delete_one({"_id": session["_id"]})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found", headers={"WWW-Authenticate": "Bearer"})
    return user


def public_user(user: dict) -> dict:
    return {
        "id": user.get("id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "profile": user.get("profile") or {},
        "created_at": user.get("created_at"),
    }
