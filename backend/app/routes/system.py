from fastapi import APIRouter

from ..db import get_db
from ..llm import parse_profile
from ..models import ParseRequest, Profile
from ..ranking import model_info

router = APIRouter()


@router.post("/parse-profile")
def parse_profile_endpoint(req: ParseRequest):
    # The transcript is parsed and returned, never logged or stored.
    result = parse_profile(req.text, req.lang)
    prof = Profile(**result["profile"])
    return {"profile": prof.model_dump(), "parsed_by": result["parsed_by"]}


@router.get("/model-info")
def model_info_endpoint():
    return model_info()


@router.get("/health")
def health():
    try:
        get_db().command("ping")
        db_status = "ok"
    except Exception:
        db_status = "unreachable"
    return {"status": "ok", "db": db_status}
