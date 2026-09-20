"""Drop and reseed the curated YojanaSathi catalogue and English translation cache."""
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import ASCENDING, TEXT, MongoClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")

URI = os.environ.get("MONGODB_URI", "")
DB_NAME = os.environ.get("DB_NAME", "yojanasathi")

if not URI:
    raise SystemExit("MONGODB_URI is not set.")

scheme_path = ROOT / "data" / "manual" / "schemes.json"
schemes = json.loads(scheme_path.read_text(encoding="utf-8"))

required = {
    "id", "name", "type", "level", "state", "area", "min_age", "max_age",
    "gender", "max_income", "categories", "education", "occupation",
    "benefits", "documents", "apply_url", "deadline", "last_verified", "tags",
}
ids = set()
for i, scheme in enumerate(schemes, start=1):
    missing = required - scheme.keys()
    if missing:
        raise SystemExit(f"Record {i} ({scheme.get('id')}) is missing: {sorted(missing)}")
    if scheme["id"] in ids:
        raise SystemExit(f"Duplicate scheme id: {scheme['id']}")
    ids.add(scheme["id"])
    if not scheme["apply_url"].startswith("https://"):
        raise SystemExit(f"Non-HTTPS apply URL: {scheme['id']}")

translations = [
    {
        "scheme_id": s["id"],
        "lang": "en",
        "name": s["name"],
        "benefits": s["benefits"],
        "documents": s["documents"],
    }
    for s in schemes
]

client = MongoClient(URI, serverSelectionTimeoutMS=8000)
db = client[DB_NAME]

db.schemes.drop()
db.translations.drop()
db.schemes.insert_many(schemes)
db.translations.insert_many(translations)

db.schemes.create_index([("type", ASCENDING), ("state", ASCENDING), ("area", ASCENDING)])
db.schemes.create_index([("name", TEXT), ("benefits", TEXT)], default_language="english")
db.translations.create_index([("scheme_id", ASCENDING), ("lang", ASCENDING)], unique=True)
db.queries.create_index([("created_at", ASCENDING)])

counts = {t: db.schemes.count_documents({"type": t}) for t in ["scholarship", "internship", "job", "welfare"]}
print(f"Seeded {len(schemes)} schemes and {len(translations)} English translations into {DB_NAME}.")
print("By type:", counts)
