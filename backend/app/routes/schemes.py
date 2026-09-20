from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from ..db import get_db
from ..models import VALID_LANGS, Profile, SearchRequest
from ..ranking import rank_schemes
from ..rules import build_query, matched_reasons
from ..states import STATE_LABELS

router = APIRouter()
TYPES = ["scholarship", "internship", "job", "welfare"]


def _translations(db, ids, lang):
    if lang == "en" or not ids:
        return {}
    rows = db.translations.find(
        {"scheme_id": {"$in": ids}, "lang": lang}, {"_id": 0}
    )
    return {t["scheme_id"]: t for t in rows}


def _serialize(doc, reasons, codes, t):
    docs = t.get("documents")
    return {
        "id": doc["id"],
        "name": t.get("name") or doc["name"],
        "type": doc["type"],
        "level": doc.get("level"),
        "state": doc.get("state"),
        "area": doc.get("area"),
        "benefits": t.get("benefits") or doc.get("benefits"),
        "documents": docs if docs is not None else doc.get("documents", []),
        "apply_url": doc.get("apply_url"),
        "deadline": doc.get("deadline"),
        "last_verified": doc.get("last_verified"),
        "matched_reasons": reasons,
        "reason_codes": codes,
    }


@router.post("/search")
def search(req: SearchRequest):
    db = get_db()
    p = req.profile
    types = [t for t in (req.types or []) if t in TYPES] or None
    query = build_query(p, types)
    docs = list(db.schemes.find(query, {"_id": 0, "embedding": 0}))

    for d in docs:
        d["matched_reasons"], d["reason_codes"] = matched_reasons(p, d)
    docs, ranked = rank_schemes(p, docs)

    tmap = _translations(db, [d["id"] for d in docs], p.lang)
    groups = {t: [] for t in TYPES}
    for d in docs:
        reasons = d.pop("matched_reasons")
        codes = d.pop("reason_codes")
        groups.setdefault(d["type"], []).append(
            _serialize(d, reasons, codes, tmap.get(d["id"], {}))
        )

    counts = {t: len(v) for t, v in groups.items()}

    # Anonymous analytics: structured fields only, no goal text, no identifiers.
    try:
        db.queries.insert_one({
            "age": p.age, "gender": p.gender, "state": p.state, "area": p.area,
            "income": p.income, "category": p.category, "education": p.education,
            "occupation": p.occupation, "lang": p.lang,
            "result_count": len(docs), "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass

    return {
        "total": len(docs),
        "ranked_by_model": ranked,
        "counts": counts,
        "groups": groups,
    }


@router.get("/schemes/{scheme_id}")
def get_scheme(scheme_id: str, lang: str = Query("en", pattern=r"^(en|hi|bn|ta|te|mr|gu)$")):
    db = get_db()
    doc = db.schemes.find_one({"id": scheme_id}, {"_id": 0, "embedding": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Scheme not found")
    t = _translations(db, [scheme_id], lang).get(scheme_id, {})
    out = _serialize(doc, [], [], t)
    out.update({
        "tags": doc.get("tags", []),
        "min_age": doc.get("min_age"), "max_age": doc.get("max_age"),
        "max_income": doc.get("max_income"), "gender": doc.get("gender"),
        "categories": doc.get("categories", []),
        "education": doc.get("education", []),
        "occupation": doc.get("occupation", []),
        "state_label": STATE_LABELS.get(doc.get("state"), doc.get("state")),
    })
    return out
