import json
from pathlib import Path
p = Path(r"c:\Users\PC\desktop\real\koookie-docs\static\data\grammer\topik1.json")
arr = json.loads(p.read_text(encoding='utf-8'))
for i,obj in enumerate(arr, start=1):
    obj['number'] = i
    obj['source'] = 1
p.write_text(json.dumps(arr, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"Updated {len(arr)} objects in {p}")
