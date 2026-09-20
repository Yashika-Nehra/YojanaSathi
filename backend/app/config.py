import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "")
DB_NAME = os.environ.get("DB_NAME", "yojanasathi")
FRONTEND_ORIGINS = [
    o.strip() for o in os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173").split(",") if o.strip()
]
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "")
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "")
MODEL_PATH = os.environ.get("MODEL_PATH") or os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "ml", "model.joblib")
)
