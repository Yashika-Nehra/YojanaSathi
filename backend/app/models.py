from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from .states import state_slug

VALID_GENDERS = {"female", "male", "transgender"}
VALID_CATEGORIES = {"sc", "st", "obc", "ews", "general"}
VALID_EDUCATION = {"none", "below_10th", "10th", "12th", "diploma", "graduate", "postgraduate"}
VALID_OCCUPATION = {
    "student", "farmer", "agricultural_labour", "daily_wage", "self_employed",
    "salaried", "govt_employee", "unemployed", "homemaker",
}
VALID_AREA = {"rural", "urban"}
VALID_TYPES = {"scholarship", "internship", "job", "welfare"}
VALID_LANGS = {"en", "hi", "bn", "ta", "te", "mr", "gu"}


def _clean(value, allowed):
    if not value:
        return None
    v = str(value).strip().lower().replace(" ", "_")
    return v if v in allowed else None


def normalize_profile(d: dict) -> dict:
    """Coerce any dict into a clean profile dict. Unknown values become None."""
    out = {
        "age": None, "gender": None, "state": None, "area": None, "income": None,
        "category": None, "education": None, "occupation": None, "goal_text": None,
        "lang": d.get("lang") if d.get("lang") in VALID_LANGS else "en",
    }
    try:
        a = d.get("age")
        if a is not None:
            a = int(float(a))
            out["age"] = a if 1 <= a <= 120 else None
    except (TypeError, ValueError):
        pass
    try:
        i = d.get("income")
        if i is not None:
            i = float(i)
            out["income"] = i if i >= 0 else None
    except (TypeError, ValueError):
        pass
    out["gender"] = _clean(d.get("gender"), VALID_GENDERS)
    out["category"] = _clean(d.get("category"), VALID_CATEGORIES)
    out["education"] = _clean(d.get("education"), VALID_EDUCATION)
    out["occupation"] = _clean(d.get("occupation"), VALID_OCCUPATION)
    out["area"] = _clean(d.get("area"), VALID_AREA)
    out["state"] = state_slug(d.get("state"))
    g = d.get("goal_text")
    if g:
        out["goal_text"] = str(g).strip()[:500]
    return out


class Profile(BaseModel):
    age: Optional[int] = Field(default=None, ge=1, le=120)
    gender: Optional[str] = None
    state: Optional[str] = None
    area: Optional[str] = None
    income: Optional[float] = Field(default=None, ge=0)
    category: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    goal_text: Optional[str] = Field(default=None, max_length=500)
    lang: str = Field(default="en", pattern=r"^(en|hi|bn|ta|te|mr|gu)$")

    @field_validator("gender", "category", "education", "occupation", "area", "state", mode="before")
    @classmethod
    def _lower(cls, v):
        if v is None:
            return None
        s = str(v).strip().lower().replace(" ", "_")
        return s or None


class ParseRequest(BaseModel):
    text: str = Field(min_length=2, max_length=1000)
    lang: str = Field(default="en", pattern=r"^(en|hi|bn|ta|te|mr|gu)$")


class SearchRequest(BaseModel):
    profile: Profile
    types: Optional[List[str]] = None
