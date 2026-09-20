from datetime import datetime, timezone
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from ..auth import get_current_user, hash_password, new_session, public_user, verify_password
from ..db import get_db
from ..models import Profile

router = APIRouter(prefix="/auth", tags=["auth"])
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def _email(value: str) -> str:
    value = value.strip().lower()
    if not EMAIL_RE.match(value):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    return value


def _empty_profile() -> dict:
    return {
        "age": None, "gender": None, "state": None, "area": None, "income": None,
        "category": None, "education": None, "occupation": None, "goal_text": None, "lang": "en",
    }


def _auth_response(user: dict) -> dict:
    return {"token": new_session(user["id"]), "user": public_user(user)}


@router.post("/signup")
def signup(req: SignupRequest):
    db = get_db()
    email = _email(req.email)
    name = req.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Enter your name")
    if db.users.find_one({"email": email}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    now = datetime.now(timezone.utc)
    user = {
        "id": uuid.uuid4().hex,
        "name": name,
        "email": email,
        "password_hash": hash_password(req.password),
        "profile": _empty_profile(),
        "created_at": now,
        "updated_at": now,
    }
    try:
        db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    return _auth_response(user)


@router.post("/login")
def login(req: LoginRequest):
    db = get_db()
    email = _email(req.email)
    user = db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    return _auth_response(user)


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}


@router.put("/profile")
def update_profile(profile: Profile, user: dict = Depends(get_current_user)):
    db = get_db()
    now = datetime.now(timezone.utc)
    db.users.update_one(
        {"id": user["id"]},
        {"$set": {"profile": profile.model_dump(), "updated_at": now}},
    )
    updated = db.users.find_one({"id": user["id"]})
    return {"user": public_user(updated)}


@router.post("/logout")
def logout(user: dict = Depends(get_current_user)):
    # The frontend keeps the bearer token locally, so the server invalidates
    # every active session for this user. This is convenient for a simple app.
    get_db().sessions.delete_many({"user_id": user["id"]})
    return {"ok": True}
