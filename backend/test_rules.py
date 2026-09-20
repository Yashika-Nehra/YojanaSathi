from app.models import Profile
from app.rules import build_query, profile_matches_scheme


def test_query_builder():
    p = Profile(age=20, income=200000, category="sc", education="12th", occupation="student", state="bihar", area="rural", lang="en")
    q = build_query(p)
    assert "$and" in q
    assert any("max_age" in item.get("$or", [{}])[0] for item in q["$and"])


def test_open_fields_match():
    p = Profile(age=20, income=200000, category="sc", education="12th", occupation="student", state="bihar", area="rural", lang="en")
    s = {
        "min_age": None, "max_age": None, "gender": "any", "max_income": None,
        "categories": [], "education": [], "occupation": [], "state": "all", "area": "both",
    }
    assert profile_matches_scheme(p, s)


def test_student_scholarship_matches():
    p = Profile(age=20, income=200000, category="sc", education="12th", occupation="student", state="bihar", area="rural", lang="en")
    s = {
        "min_age": None, "max_age": None, "gender": "any", "max_income": None,
        "categories": ["sc"], "education": ["12th"], "occupation": [], "state": "all", "area": "both",
    }
    assert profile_matches_scheme(p, s)


if __name__ == "__main__":
    test_query_builder()
    test_open_fields_match()
    test_student_scholarship_matches()
    print("test_rules: OK")
