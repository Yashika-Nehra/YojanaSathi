# YojanaSathi

YojanaSathi is a multilingual government-benefit discovery platform for people in India who are unsure which scholarships, internships, government jobs, and welfare programmes may fit their profile.

Users can fill a short profile or speak their details aloud. YojanaSathi converts the information into a structured profile, applies rule-based eligibility checks, optionally ranks eligible results with an ML model, and presents the result with reasons, benefits, documents, verification dates, deadlines when known, and official government links.

## Problem

Government opportunities are spread across many portals and often have eligibility rules that are difficult to compare. Finding the right opportunity can require repeated browsing, reading, and checking of different criteria.

## Solution

YojanaSathi brings the discovery step into one interface:

- Profile-based matching
- Scholarships, internships, government jobs, and welfare programmes
- English, Hindi, Bengali, Tamil, Telugu, Marathi, and Gujarati
- Voice input through the browser Web Speech API
- Read-aloud support through browser speech synthesis
- Rule-based eligibility as the decision layer
- ML ranking as a relevance layer
- MongoDB Atlas storage
- Optional provider-agnostic LLM support for parsing and language tasks
- Guest search plus optional account-based saved profiles

## User Flow

```text
Choose language
      ↓
Fill profile or speak details
      ↓
Review and correct profile
      ↓
Find matches
      ↓
Rule-based eligibility filtering
      ↓
Optional ML ranking
      ↓
Scholarships / Internships / Government Jobs / Schemes
      ↓
Open official portal
```

Registered users can additionally save their profile:

```text
Sign up → Save profile → Log out → Log in → Profile restored → Search
```

## Supported Languages

| Code | Language | Speech locale |
|---|---|---|
| en | English | en-IN |
| hi | Hindi | hi-IN |
| bn | Bengali | bn-IN |
| ta | Tamil | ta-IN |
| te | Telugu | te-IN |
| mr | Marathi | mr-IN |
| gu | Gujarati | gu-IN |

The selected language is persisted locally and the document language is updated when the selection changes. Script-specific font fallbacks are used for Indian writing systems.

## Main Features

### Profile matching

The profile can include:

- Age
- Gender
- State or Union Territory
- Rural or urban area
- Annual family income
- Social category
- Highest education
- Occupation
- Optional goal text

Results are grouped into four types:

- Scholarships
- Internships
- Government Jobs
- Schemes

Each result can show:

- Name
- Central or state level
- State
- Area
- Why the profile matched
- Benefits
- Required documents
- Deadline when known
- Last verified date
- Official application or information link
- Read-aloud action

### Voice input

The browser Web Speech API is used for speech recognition. The selected language determines the recognition locale. When speech recognition is unsupported or parsing fails, users can continue manually.

### Saved accounts

Registered users can create an account and save an eligibility profile in MongoDB. Passwords are stored as secure hashes, not plain text.

### Multilingual content

UI strings are stored in one JSON locale file per language. Scheme translations are designed to use a cached MongoDB `translations` collection, with English as the fallback when a translation is unavailable.

## How Matching Works

YojanaSathi intentionally separates eligibility, ranking, and language tasks.

```text
User profile
    ↓
Rule-based eligibility engine
    ↓
Eligible schemes only
    ↓
Optional ML relevance ranking
    ↓
Translated presentation
```

### Rule engine

The rule engine is the only eligibility decision layer. It evaluates age, gender, income, category, education, occupation, state, and area. Missing or unrestricted fields are handled as no restriction where appropriate.

The API also returns matched-reason codes and readable explanations.

### ML ranking

The ML pipeline uses scikit-learn and joblib. The training script cleans scheme text, creates TF-IDF features, trains a classifier, reports computed metrics, and saves the model artifact.

At request time, the trained vectorizer can rank already-eligible schemes against the user's goal text.

The ML model does not decide eligibility.

### LLM

The optional provider-agnostic LLM wrapper is used only for language tasks such as turning a sentence into structured profile data and generating cached translations. It never decides eligibility.

If no LLM key is configured, the app falls back to a multilingual keyword parser.

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- react-i18next
- Lucide React
- Web Speech API
- speechSynthesis

### Backend

- Python
- FastAPI
- Pydantic
- PyMongo
- Requests
- python-dotenv

### Data and ML

- MongoDB Atlas
- scikit-learn
- joblib
- TF-IDF
- Offline data-loading and eligibility extraction scripts

### Deployment

- Vercel or Render for the frontend
- Render for the FastAPI backend
- MongoDB Atlas for the database

## Repository Structure

```text
YojanaSathi/
├── backend/
│   ├── app/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── llm.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── ranking.py
│   │   ├── rules.py
│   │   ├── states.py
│   │   └── routes/
│   │       ├── auth.py
│   │       └── schemes.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── locales/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── auth.jsx
│   │   ├── i18n.js
│   │   └── ...
│   ├── package.json
│   └── .env.example
│
├── data/
│   └── manual/
│       ├── schemes.json
│       └── README.md
│
├── ml/
│   ├── train.py
│   └── model.joblib
│
├── scripts/
│   ├── seed.py
│   ├── load_dataset.py
│   ├── extract_eligibility.py
│   └── translate_cache.py
│
├── render.yaml
├── vercel.json
└── README.md
```

## Database

YojanaSathi uses MongoDB Atlas only. No SQL database is required.

### `schemes`

Stores normalized scheme records including:

```text
id
name
type
level
state
area
min_age
max_age
gender
max_income
categories
education
occupation
benefits
documents
apply_url
deadline
last_verified
tags
embedding
```

### `translations`

```text
scheme_id
lang
name
benefits
documents
```

A unique index is used on `(scheme_id, lang)`.

### `queries`

Stores anonymous structured search analytics where enabled. The search analytics path does not need a user's name or other direct identifier.

### `users` and `sessions`

Used for optional authentication and saved profiles.

## Current Demo Data

The current demonstration dataset contains **380 curated records**:

| Type | Records |
|---|---:|
| Scholarships | 59 |
| Internships | 18 |
| Government jobs | 22 |
| Welfare / programmes | 281 |
| **Total** | **380** |

This is a curated starter catalogue for the project demo, not a claim that every current government opportunity in India is included.

Users should always verify eligibility, deadlines, documents, and application details on the official government portal before applying.

## Local Setup

### Requirements

- Python 3.10 or newer
- Node.js 20 or newer
- npm
- MongoDB Atlas account and cluster
- Git

### 1. Clone

```bash
git clone https://github.com/Yashika-Nehra/YojanaSathi.git
cd YojanaSathi
```

### 2. Backend environment

Create:

```text
backend/.env
```

Example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=yojanasathi
FRONTEND_ORIGIN=http://localhost:5173

LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=https://api.openai.com/v1

CONTACT_EMAIL=your-email@example.com
MODEL_PATH=
```

Never commit `backend/.env`.

### 3. Backend install and run

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Health check:

```text
http://localhost:8000/api/health
```

FastAPI docs:

```text
http://localhost:8000/docs
```

### 4. Seed the database

From the repository root, with the backend virtual environment activated:

```powershell
python scripts\seed.py
```

### 5. Frontend environment

Create:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:8000
VITE_SITE_URL=http://localhost:5173
VITE_CONTACT_EMAIL=your-email@example.com
```

Never put `MONGODB_URI` or other server secrets in `VITE_*` variables.

### 6. Frontend install and run

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend and database health |
| POST | `/api/parse-profile` | Parse user text into a profile |
| POST | `/api/search` | Apply eligibility rules and rank results |
| GET | `/api/schemes/{id}` | Get a scheme and its translation |
| GET | `/api/model-info` | Report model information |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the current account |
| PUT | `/api/auth/profile` | Save the profile |
| POST | `/api/auth/logout` | Log out |

## ML Training

Activate the backend virtual environment and run:

```powershell
cd C:\Users\nsart\codes\YojanaSathi
backend\.venv\Scripts\Activate.ps1
python ml\train.py
```

The model artifact is saved to:

```text
ml/model.joblib
```

Model metrics exposed through `/api/model-info` come from the trained artifact. Do not manually invent or edit model statistics.

## Data Pipeline

The intended offline pipeline is:

```text
Official government source
        ↓
Raw dataset
        ↓
Column mapping
        ↓
Eligibility extraction
        ↓
Validation
        ↓
Normalized records
        ↓
MongoDB seed
        ↓
Cached translations
```

Important scripts:

```text
scripts/load_dataset.py
scripts/extract_eligibility.py
scripts/seed.py
scripts/translate_cache.py
```

Data quality rules:

- Prefer official government sources.
- Do not invent application URLs.
- Do not invent deadlines.
- Use `null` when a value is unknown.
- Store `last_verified`.
- Keep translation out of request-time matching.
- Review records before treating them as current.

## Deployment

### Backend on Render

Use the repository's `backend` directory as the service root.

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
MONGODB_URI=...
DB_NAME=yojanasathi
FRONTEND_ORIGIN=https://YOUR-FRONTEND-DOMAIN
LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=https://api.openai.com/v1
CONTACT_EMAIL=your-email@example.com
MODEL_PATH=
```

### Frontend on Vercel

Set the Root Directory to:

```text
frontend
```

Use:

```text
Build Command: npm run build
Output Directory: dist
```

Environment variables:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
VITE_SITE_URL=https://YOUR-FRONTEND-DOMAIN
VITE_CONTACT_EMAIL=your-email@example.com
```

Do not use `localhost` in production.

If the repository's Vercel settings already select `frontend` as the Root Directory, the build command must be `npm run build`, not `cd frontend && npm run build`.

### One-service Render option

The full repository can also be deployed as one Render Web Service if FastAPI is configured to serve the built Vite `frontend/dist` directory and handle SPA fallback routes. In that setup, the build command must build both Python dependencies and the frontend, and frontend API calls can use relative `/api` URLs.

## SEO and Site Essentials

The frontend build generates `robots.txt` and `sitemap.xml` from `VITE_SITE_URL`.

The public folder contains the custom favicon assets and web manifest. Production deployments should set the real production site URL before building so canonical and sitemap URLs do not point to localhost.

## Accessibility

The interface is designed with:

- Keyboard-visible focus
- Labels tied to form controls
- Minimum 44px interactive targets
- Reduced-motion support
- `aria-live` messaging for voice status
- Responsive layouts
- Script-specific font fallbacks

Test the final deployment at small mobile widths and in every supported language.

## Privacy and Security

YojanaSathi is an informational service and is not an official government website.

Important points:

- Eligibility results are indicative and must be verified on official portals.
- The service does not guarantee approval.
- Voice recognition is handled by the browser speech service. The transcript is sent to the backend for parsing.
- Registered accounts store account information and saved eligibility profiles.
- Passwords are hashed before storage.
- MongoDB connection strings and API keys must remain server-side.
- Third-party links take users to external government sites.
- Government rules, deadlines, documents, and URLs can change after a record was last verified.

## Limitations

- The included 380-record catalogue is not a complete national catalogue.
- Internship and job opportunities can change quickly.
- Some entries use an official discovery or recruitment portal rather than a single permanent application page.
- The fallback parser is simpler than an LLM and may miss uncommon phrasing.
- ML ranking depends on the training data and does not decide eligibility.
- Cached translations may be incomplete for newly added records.
- Users should verify the official portal before applying.

## Responsible Use

YojanaSathi should help users discover opportunities, not promise eligibility or approval.

Before applying, users should confirm:

1. Current eligibility rules
2. Required documents
3. Application deadline
4. Official application portal
5. Responsible government department or agency

## License

Choose a license appropriate for your hackathon, college, or public release before publishing the repository.