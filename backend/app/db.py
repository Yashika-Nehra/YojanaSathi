from pymongo import ASCENDING, TEXT, MongoClient

from .config import DB_NAME, MONGODB_URI

_client = None


def get_client():
    global _client
    if _client is None:
        if not MONGODB_URI:
            raise RuntimeError("MONGODB_URI is not set")
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=8000)
    return _client


def get_db():
    return get_client()[DB_NAME]


def ensure_indexes():
    db = get_db()
    db.schemes.create_index([("type", ASCENDING), ("state", ASCENDING), ("area", ASCENDING)])
    db.schemes.create_index([("name", TEXT), ("benefits", TEXT)], default_language="english")
    db.translations.create_index([("scheme_id", ASCENDING), ("lang", ASCENDING)], unique=True)
    db.queries.create_index([("created_at", ASCENDING)])

    # Authentication indexes. Email is unique. Session expiry is handled by
    # MongoDB's TTL index so old bearer sessions are automatically removed.
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.sessions.create_index([("token_hash", ASCENDING)], unique=True)
    db.sessions.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
