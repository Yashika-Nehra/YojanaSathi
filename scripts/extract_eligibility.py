"""Offline LLM extraction of structured eligibility from normalized scheme text."""
import json, os, re
from pathlib import Path
import requests
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parents[1]; load_dotenv(ROOT/"backend"/".env")
KEY=os.environ.get("LLM_API_KEY",""); MODEL=os.environ.get("LLM_MODEL",""); BASE=os.environ.get("LLM_BASE_URL","https://api.openai.com/v1").rstrip("/")
SRC=ROOT/"data/processed/kaggle_normalized.json"; OUT=ROOT/"data/processed/eligibility_extracted.json"; FAIL=ROOT/"data/processed/eligibility_failed.json"
SYSTEM="""Extract scheme eligibility from the supplied text. Return JSON only with min_age, max_age, max_income, gender, categories, education, occupation, area, state. Use null for no stated numeric limit. gender: any/female/male/transgender. area: rural/urban/both. categories: sc/st/obc/ews/general. education: none/below_10th/10th/12th/diploma/graduate/postgraduate. occupation: student/farmer/agricultural_labour/daily_wage/self_employed/salaried/govt_employee/unemployed/homemaker. Never invent a requirement."""
VALID={"gender":{"any","female","male","transgender"},"area":{"rural","urban","both"},"categories":{"sc","st","obc","ews","general"},"education":{"none","below_10th","10th","12th","diploma","graduate","postgraduate"},"occupation":{"student","farmer","agricultural_labour","daily_wage","self_employed","salaried","govt_employee","unemployed","homemaker"}}
def call(text):
  if not(KEY and MODEL): raise RuntimeError("LLM_API_KEY and LLM_MODEL are required for offline extraction")
  body={"model":MODEL,"temperature":0,"messages":[{"role":"system","content":SYSTEM},{"role":"user","content":text}]}
  r=requests.post(f"{BASE}/chat/completions",headers={"Authorization":f"Bearer {KEY}"},json={**body,"response_format":{"type":"json_object"}},timeout=60)
  if r.status_code>=400: r=requests.post(f"{BASE}/chat/completions",headers={"Authorization":f"Bearer {KEY}"},json=body,timeout=60)
  r.raise_for_status(); s=r.json()["choices"][0]["message"]["content"].strip(); s=re.sub(r"^```[a-zA-Z]*\n?","",s); s=re.sub(r"\n?```$","",s); return json.loads(s)
def validate(d):
  out={"min_age":d.get("min_age"),"max_age":d.get("max_age"),"max_income":d.get("max_income"),"gender":d.get("gender") or "any","categories":d.get("categories") or [],"education":d.get("education") or [],"occupation":d.get("occupation") or [],"area":d.get("area") or "both","state":d.get("state") or "all"}
  if out["gender"] not in VALID["gender"] or out["area"] not in VALID["area"]: raise ValueError("invalid gender or area")
  for k in ("categories","education","occupation"):
    if any(v not in VALID[k] for v in out[k]): raise ValueError(f"invalid {k}")
  return out
def main():
  rows=json.loads(SRC.read_text(encoding="utf-8")); good=[]; bad=[]
  for row in rows:
    try:
      if not row.get("eligibility_text"): raise ValueError("missing eligibility text")
      good.append({**row,**validate(call(row["eligibility_text"]))})
    except Exception as e: bad.append({"source_row":row.get("source_row"),"id":row.get("id"),"error":str(e)})
  OUT.write_text(json.dumps(good,ensure_ascii=False,indent=2),encoding="utf-8"); FAIL.write_text(json.dumps(bad,ensure_ascii=False,indent=2),encoding="utf-8"); print(f"Extracted: {len(good)} | Failed: {len(bad)}")
if __name__=="__main__": main()
