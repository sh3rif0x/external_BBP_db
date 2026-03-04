import requests
import json
from urllib.parse import urlparse

headers = {"User-Agent": "Mozilla/5.0"}

res = requests.get("https://raw.githubusercontent.com/disclose/diodb/master/program-list.json", headers=headers)
data = res.json()

programs = []
for p in data:
    if p.get("offers_bounty") == "yes":
        domain = urlparse(p.get("policy_url", "")).netloc
        programs.append({
            "name": p.get("program_name"),
            "url": p.get("policy_url"),
            "bounty": True,
            "swag": p.get("offers_swag"),
            "safe_harbor": p.get("safe_harbor"),
            "icon": f"https://www.google.com/s2/favicons?domain={domain}&sz=64" if domain else "",
        })

with open("disclose_programs.json", "w") as f:
    json.dump(programs, f, indent=2)

print(f"[✓] Total bounty programs: {len(programs)}")
for p in programs[:5]:
    print(f"  {p['name']:30} | {p['url']}")
