"""Normalize a Kaggle CSV before the offline eligibility extraction pass."""
import csv, json, os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATASET_PATH=os.environ.get("DATASET_PATH",str(ROOT/"data/kaggle/schemes.csv"))
COLUMN_MAPPING={
  "id":["id","scheme_id","scheme code"],"name":["name","scheme name","scheme"],
  "eligibility_text":["eligibility","eligibility criteria","eligibility_text","who can apply"],
  "benefits":["benefits","benefit","scheme benefits"],"documents":["documents","required documents","documents required"],
  "apply_url":["apply_url","application url","official url","apply link"],"state":["state","states"],"type":["type","scheme type","category"]}
OUT=ROOT/"data/processed/kaggle_normalized.json"
def detect(headers):
  low={h.strip().lower():h for h in headers}; out={}
  for target,candidates in COLUMN_MAPPING.items():
    for c in candidates:
      if c.lower() in low: out[target]=low[c.lower()]; break
  return out
def main():
  p=Path(DATASET_PATH)
  if not p.exists(): raise SystemExit(f"Dataset not found at {p}. Set DATASET_PATH or place the CSV there.")
  with p.open(newline="",encoding="utf-8-sig") as fh:
    reader=csv.DictReader(fh); print("Detected columns:"); print(reader.fieldnames); mapping=detect(reader.fieldnames or []); print(json.dumps(mapping,indent=2))
    rows=[]
    for n,row in enumerate(reader,1):
      get=lambda k:(row.get(mapping.get(k,""),"") or "").strip()
      rows.append({"source_row":n,"id":get("id") or f"kaggle-{n}","name":get("name"),"eligibility_text":get("eligibility_text"),"benefits":get("benefits"),"documents_raw":get("documents"),"apply_url":get("apply_url"),"state_raw":get("state"),"type_raw":get("type")})
  OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8"); print(f"Wrote {len(rows)} normalized rows to {OUT}")
if __name__=="__main__": main()
