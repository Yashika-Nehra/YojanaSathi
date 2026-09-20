import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'data' / 'manual' / 'schemes.json'
data = json.loads(path.read_text(encoding='utf-8'))
required = {
    'id','name','type','level','state','area','min_age','max_age','gender',
    'max_income','categories','education','occupation','benefits','documents',
    'apply_url','deadline','last_verified','tags'
}
assert data, 'empty catalogue'
assert len({x['id'] for x in data}) == len(data), 'duplicate ids'
for i, x in enumerate(data, 1):
    missing = required - set(x)
    assert not missing, f'{i} {x.get("id")}: missing {sorted(missing)}'
    assert x['type'] in {'scholarship','internship','job','welfare'}
    assert x['apply_url'].startswith('http'), f'{x["id"]}: invalid URL'
print('CATALOGUE:', len(data))
print('COUNTS:', dict(Counter(x['type'] for x in data)))
print('CHECK: OK')
