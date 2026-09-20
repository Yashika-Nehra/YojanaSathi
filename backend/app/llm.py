# Provider-agnostic LLM wrapper (any OpenAI-compatible chat endpoint) plus a
# keyword fallback parser so the app works with no LLM key. The LLM only
# converts text into structured JSON, it never decides eligibility.

import json
import logging
import re

import requests

from .config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
from .models import normalize_profile
from .states import state_slug

log = logging.getLogger("llm")

ALLOWED_VALUES = """gender: female, male, transgender or null
category: sc, st, obc, ews, general or null
education: none, below_10th, 10th, 12th, diploma, graduate, postgraduate or null
occupation: student, farmer, agricultural_labour, daily_wage, self_employed, salaried, govt_employee, unemployed, homemaker or null
area: rural, urban or null
state: a state name in any language, or null
income: annual family income in rupees as an integer, or null
age: integer or null
goal_text: what the person wants, in English, max 200 characters, or null"""

SYSTEM_PROMPT = f"""You extract an applicant profile for government scheme matching from one sentence.
Reply with JSON only, no markdown, using exactly these keys: age, gender, category, education, occupation, area, state, income, goal_text.
Allowed values:
{ALLOWED_VALUES}
The text may be in any Indian language. Fill only what is clearly stated or clearly implied. Leave everything else null. Never invent values."""


def llm_available():
    return bool(LLM_API_KEY and LLM_MODEL)


def _strip_fence(s):
    s = s.strip()
    if s.startswith("```"):
        s = re.sub(r"^```[a-zA-Z]*\n?", "", s)
        s = re.sub(r"\n?```$", "", s)
    return s


def chat_json(system, user):
    """One chat completion parsed as JSON. Works with any OpenAI-compatible API."""
    if not llm_available():
        raise RuntimeError("LLM not configured")
    headers = {"Authorization": f"Bearer {LLM_API_KEY}"}
    body = {
        "model": LLM_MODEL,
        "temperature": 0,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    try:
        r = requests.post(
            f"{LLM_BASE_URL}/chat/completions", headers=headers,
            json={**body, "response_format": {"type": "json_object"}}, timeout=30,
        )
        r.raise_for_status()
    except requests.HTTPError:
        # Some providers reject response_format, retry without it
        r = requests.post(f"{LLM_BASE_URL}/chat/completions", headers=headers, json=body, timeout=30)
        r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    return json.loads(_strip_fence(content))


def parse_profile(text, lang):
    if llm_available():
        try:
            data = chat_json(SYSTEM_PROMPT, f"Language code: {lang}\nText: {text}")
            return {"profile": normalize_profile(data), "parsed_by": "llm"}
        except Exception as e:
            log.warning("LLM parse failed, using keyword parser: %s", e)
    return {"profile": normalize_profile(fallback_parse(text)), "parsed_by": "fallback"}


# Fallback keyword parser. Multilingual keyword lists, checked in order.

_FEMALE = ["female", "woman", "महिला", "स्त्री", "বোন", "মহিলা", "பெண்", "మహిళ", "ఆడ", "સ્ત્રી", "મહિલા"]
_MALE = ["male", "man ", "पुरुष", "পুরুষ", "ছেলে", "ஆண்", "పురుషుడు", "మగ", "પુરુષ"]
_TRANS = ["transgender", "ट्रांसजेंडर", "ট্রান্সজেন্ডার", "ట్రాన్స్", "திருநங்கை", "ટ્રાન્સજેન્ડર"]

_EDU_ORDER = [
    ("postgraduate", r"post\s?graduate|पोस्ट\s?ग्रैजुएट|स्नातकोत्तर|முதுகலை|పోస్ట్\s?గ్రాడ్|মাস্টার্স|અનુસ્નાતક"),
    ("graduate", r"graduate|graduation|स्नातक|ग्रैजुएट|பட்டதாரி|గ్రాడ్యుయేట్|স্নাতক|સ્નાતક"),
    ("diploma", r"diploma|\biti\b|polytechnic|डिप्लोमा|டிப்ளமோ|డిప్లమో|ডিপ্লোমা|ડિપ્લોમા"),
    ("12th", r"12th|twelfth|intermediate|higher\s?secondary|बारहवीं|12\s?वीं|பன்னிரண்டாம்|ఇంటర్|দ্বাদশ|૧૨\s?મી"),
    ("10th", r"10th|tenth|matric|दसवीं|10\s?वीं|பத்தாம்|పదవ\s?తరగతి|দশম|૧૦\s?મી"),
    ("below_10th", r"below\s?10|अशिक्षित|प्राथमिक|தொடக்க|প্রাথমিক"),
]

_OCC_ORDER = [
    ("agricultural_labour", r"farm\s?labour|खेत\s?मजदूर|कृषि\s?मजदूर"),
    ("govt_employee", r"government\s?(job|employee)|govt\s?job|सरकारी\s?(नौकरी|कर्मचारी)"),
    ("student", r"student|छात्र|विद्यार्थी|மாணவர்|విద్యార్థి|ছাত্র|વિદ્યાર્થી"),
    ("farmer", r"farmer|farming|किसान|खेती|விவசாயி|రైతు|কৃষক|ખેડૂત"),
    ("daily_wage", r"daily\s?wage|labour|labor|मजदूर|मजदुर|কুলি"),
    ("self_employed", r"shop|business|दुकान|व्यापार|கடை|દુકાન"),
    ("homemaker", r"homemaker|housewife|गृहिणी|গৃহিণী"),
    ("unemployed", r"unemployed|बेरोजगार|बेरोज़गार|নিবনু"),
    ("salaried", r"salaried|private\s?job|नौकरी"),
]

_AREA_RURAL = r"rural|village|गांव|गाँव|ग्रामीण|গ্রাম|கிராம|గ్రామం|ગામડું"
_AREA_URBAN = r"urban|city|town|शहर|नगर|শহর|நகர|నగరం|શહેર"

_CAT_ORDER = [
    ("sc", r"\bsc\b|अनुसूचित\s?जाति|தாழ்த்தப்பட்ட"),
    ("st", r"\bst\b|अनुसूचित\s?जनजाति|आदिवासी"),
    ("obc", r"\bobc\b|पिछड़ा|பிற்படுத்தப்பட்ட|వెనుకబడిన"),
    ("ews", r"\bews\b|आर्थिक\s?रूप\s?से"),
    ("general", r"\bgeneral\b|सामान्य"),
]

_AGE_RE = [
    re.compile(r"(?:age|उम्र|आयु|वय|வயது|వయస్సు|বয়স|ઉંમર)\D{0,8}(\d{1,3})"),
    re.compile(r"(\d{1,3})\s*(?:years\s?old|साल|वर्ष|বছর|வயது|ఏళ్లు)"),
]
_INCOME_RE = [
    re.compile(r"(?:income|आय|कमाई|salary|वार्षिक)\D{0,25}(\d+(?:\.\d+)?)\s*(crore|करोड़|lakh|lac|लाख|thousand|हज़ार)?", re.I),
    re.compile(r"(\d+(?:\.\d+)?)\s*(lakh|lac|लाख|crore|करोड़)", re.I),
]


def fallback_parse(text):
    t = " " + text.lower() + " "
    p = {"lang": "en"}

    for rx in _AGE_RE:
        m = rx.search(t)
        if m:
            p["age"] = m.group(1)
            break

    for rx in _INCOME_RE:
        m = rx.search(t)
        if m:
            val = float(m.group(1))
            unit = (m.group(2) or "").lower()
            if "crore" in unit or "करोड़" in unit:
                val *= 10000000
            elif "lakh" in unit or "lac" in unit or "लाख" in unit:
                val *= 100000
            elif "thousand" in unit or "हज़ार" in unit:
                val *= 1000
            p["income"] = val
            break

    if any(w in t for w in _TRANS):
        p["gender"] = "transgender"
    elif any(w in t for w in _FEMALE):
        p["gender"] = "female"
    elif any(w in t for w in _MALE):
        p["gender"] = "male"

    for value, rx in _CAT_ORDER:
        if re.search(rx, t):
            p["category"] = value
            break

    for value, rx in _EDU_ORDER:
        if re.search(rx, t):
            p["education"] = value
            break

    for value, rx in _OCC_ORDER:
        if re.search(rx, t):
            p["occupation"] = value
            break

    if re.search(_AREA_RURAL, t):
        p["area"] = "rural"
    elif re.search(_AREA_URBAN, t):
        p["area"] = "urban"

    # State: try every known alias as a substring
    from .states import STATE_SLUGS
    for alias, slug in STATE_SLUGS.items():
        if alias in t:
            p["state"] = slug
            break

    p["goal_text"] = text.strip()[:500]
    return p
