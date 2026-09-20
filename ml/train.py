"""Train the demo TF-IDF scheme-category classifier and save a ranking artifact."""
import csv
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score,classification_report
from sklearn.model_selection import train_test_split
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/"data/ml_training.csv"; OUT=ROOT/"ml/model.joblib"
rows=[]
with DATA.open(encoding="utf-8") as f:
  for r in csv.DictReader(f): rows.append((r["text"],r["label"]))
texts=[x[0] for x in rows]; labels=[x[1] for x in rows]
xtr,xte,ytr,yte=train_test_split(texts,labels,test_size=.25,random_state=42,stratify=labels)
vec=TfidfVectorizer(ngram_range=(1,2)); Xtr=vec.fit_transform(xtr); Xte=vec.transform(xte)
clf=LogisticRegression(max_iter=1000); clf.fit(Xtr,ytr); pred=clf.predict(Xte); acc=accuracy_score(yte,pred)
print(f"Training rows: {len(rows)}\nAccuracy: {acc:.4f}\nClassification report:\n{classification_report(yte,pred,zero_division=0)}")
joblib.dump({"vectorizer":vec,"classifier":clf,"train_size":len(rows),"accuracy":float(acc),"classes":list(clf.classes_)},OUT); print(f"Saved model to {OUT}")
