# Rule-based eligibility engine. This is the only component that decides
# eligibility. Null in the database means "no limit", so every condition is
# written as "field is null OR profile fits".

from .models import Profile
from .states import STATE_LABELS

EDU_LABELS = {
    "none": "no formal schooling", "below_10th": "below 10th", "10th": "10th pass",
    "12th": "12th pass", "diploma": "diploma or ITI", "graduate": "graduate",
    "postgraduate": "postgraduate",
}
OCC_LABELS = {
    "student": "student", "farmer": "farmer", "agricultural_labour": "agricultural labour",
    "daily_wage": "daily wage worker", "self_employed": "self employed",
    "salaried": "salaried", "govt_employee": "government employee",
    "unemployed": "unemployed", "homemaker": "homemaker",
}


def format_income(v):
    if v is None:
        return None
    if v >= 10000000:
        return f"₹{v / 10000000:g} crore"
    if v >= 100000:
        return f"₹{v / 100000:g} lakh"
    return f"₹{int(v):,}"


def build_query(p: Profile, types=None) -> dict:
    conds = []
    if p.age is not None:
        conds.append({"$or": [{"min_age": None}, {"min_age": {"$lte": p.age}}]})
        conds.append({"$or": [{"max_age": None}, {"max_age": {"$gte": p.age}}]})
    if p.gender in ("female", "male", "transgender"):
        conds.append({"$or": [{"gender": "any"}, {"gender": p.gender}]})
    if p.income is not None:
        conds.append({"$or": [{"max_income": None}, {"max_income": {"$gte": p.income}}]})
    if p.category:
        conds.append({"$or": [{"categories": {"$size": 0}}, {"categories": p.category}]})
    if p.education:
        conds.append({"$or": [{"education": {"$size": 0}}, {"education": p.education}]})
    if p.occupation:
        conds.append({"$or": [{"occupation": {"$size": 0}}, {"occupation": p.occupation}]})
    if p.state:
        conds.append({"$or": [{"state": "all"}, {"state": p.state}]})
    if p.area in ("rural", "urban"):
        conds.append({"$or": [{"area": "both"}, {"area": p.area}]})
    if types:
        conds.append({"type": {"$in": list(types)}})
    return {"$and": conds} if conds else {}


def _add(texts, codes, code, params, text):
    texts.append(text)
    codes.append({"code": code, "params": params})


def matched_reasons(p: Profile, s: dict):
    """Return (english strings, i18n codes) explaining why this scheme matched."""
    texts, codes = [], []

    age, mn, mx = p.age, s.get("min_age"), s.get("max_age")
    if age is not None:
        if mn is None and mx is None:
            _add(texts, codes, "age_no_limit", {"age": age}, f"No age limit, age {age} qualifies")
        elif mn is not None and mx is not None and mn <= age <= mx:
            _add(texts, codes, "age_within", {"age": age, "min": mn, "max": mx},
                 f"Age {age} is within {mn} to {mx}")
        elif mx is None and mn is not None and age >= mn:
            _add(texts, codes, "age_min_only", {"age": age, "min": mn},
                 f"Age {age} meets the minimum age of {mn}")
        elif mn is None and mx is not None and age <= mx:
            _add(texts, codes, "age_max_only", {"age": age, "max": mx},
                 f"Age {age} is within the maximum age of {mx}")

    if p.gender:
        sg = s.get("gender", "any")
        if sg == "any":
            _add(texts, codes, "gender_open", {}, "Open to all genders")
        elif sg == p.gender:
            _add(texts, codes, "gender_match", {"gender": p.gender},
                 f"Meant for {p.gender} applicants, you match")

    if p.income is not None:
        lim = s.get("max_income")
        if lim is None:
            _add(texts, codes, "income_no_limit", {}, "No income limit")
        elif p.income <= lim:
            _add(texts, codes, "income_under",
                 {"income": format_income(p.income), "limit": format_income(lim)},
                 f"Income {format_income(p.income)} is below the {format_income(lim)} limit")

    if p.category:
        cats = s.get("categories") or []
        if not cats:
            _add(texts, codes, "category_open", {}, "Open to all categories")
        elif p.category in cats:
            _add(texts, codes, "category_match", {"category": p.category},
                 f"Your category {p.category.upper()} is eligible")

    if p.education:
        edus = s.get("education") or []
        if not edus:
            _add(texts, codes, "education_open", {}, "Open to all education levels")
        elif p.education in edus:
            _add(texts, codes, "education_match", {"education": p.education},
                 f"Your education ({EDU_LABELS.get(p.education, p.education)}) is eligible")

    if p.occupation:
        occs = s.get("occupation") or []
        if not occs:
            _add(texts, codes, "occupation_open", {}, "Open to all occupations")
        elif p.occupation in occs:
            _add(texts, codes, "occupation_match", {"occupation": p.occupation},
                 f"Your occupation ({OCC_LABELS.get(p.occupation, p.occupation)}) is eligible")

    if p.state:
        sst = s.get("state", "all")
        if sst == "all":
            _add(texts, codes, "state_all", {}, "Available across India")
        elif sst == p.state:
            _add(texts, codes, "state_match", {"state": p.state},
                 f"Available in {STATE_LABELS.get(p.state, p.state)}")

    if p.area:
        sar = s.get("area", "both")
        if sar == "both":
            _add(texts, codes, "area_both", {}, "Available in rural and urban areas")
        elif sar == p.area:
            _add(texts, codes, "area_match", {"area": p.area}, f"Available in {p.area} areas")

    return texts, codes
