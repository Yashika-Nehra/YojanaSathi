"""Offline translation-cache builder. Runtime requests never translate live."""
import json, os, re
from pathlib import Path
import requests
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parents[1]; load_dotenv(ROOT/"backend"/".env")
KEY=os.environ.get("LLM_API_KEY",""); MODEL=os.environ.get("LLM_MODEL",""); BASE=os.environ.get("LLM_BASE_URL","https://api.openai.com/v1").rstrip("/")
LANGS={"hi":"Hindi","bn":"Bengali","ta":"Tamil","te":"Telugu","mr":"Marathi","gu":"Gujarati"}
SCHEMES=ROOT/"data/manual/schemes.json"; OUT=ROOT/"data/processed/translations.json"
PROMPT="""Translate this scheme JSON into {language}. Return JSON only with name, benefits, documents. Preserve factual meaning, numbers, scheme names and URLs. Do not add claims."""
def translate(s,language):
  body={"model":MODEL,"temperature":0,"messages":[{"role":"system","content":PROMPT.format(language=LANGS[language])},{"role":"user","content":json.dumps({"name":s["name"],"benefits":s["benefits"],"documents":s["documents"]},ensure_ascii=False)}]}
  r=requests.post(f"{BASE}/chat/completions",headers={"Authorization":f"Bearer {KEY}"},json={**body,"response_format":{"type":"json_object"}},timeout=60)
  if r.status_code>=400:r=requests.post(f"{BASE}/chat/completions",headers={"Authorization":f"Bearer {KEY}"},json=body,timeout=60)
  r.raise_for_status(); c=r.json()["choices"][0]["message"]["content"].strip(); c=re.sub(r"^```[a-zA-Z]*\n?","",c); c=re.sub(r"\n?```$","",c); return json.loads(c)
def main():
  if not(KEY and MODEL): print("LLM key/model missing. Existing English seed remains usable; no cache generated."); return
  rows=[]
  for s in json.loads(SCHEMES.read_text(encoding="utf-8")):
    for lang in LANGS:
      try: rows.append({"scheme_id":s["id"],"lang":lang,**translate(s,lang)})
      except Exception as e: print(f"failed {s['id']} {lang}: {e}")
  OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8"); print(f"Wrote {len(rows)} translation rows to {OUT}")
if __name__=="__main__": main()
