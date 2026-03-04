#!/usr/bin/env python3

"""
Fetch self-hosted Chaos programs that pay bounties
Fetches from Chaos index and filters for non-known-platform bounty programs
"""

import requests
import json


def fetch_chaos_selfhosted_bounty():
    """Fetch self-hosted Chaos programs paying bounties"""
    
    headers = {"User-Agent": "Mozilla/5.0"}
    
    known_platforms = {
        "hackerone",
        "bugcrowd",
        "intigriti",
        "yeswehack",
        "hackenproof",
        "issuehunt",
        "bugbountydirectory"
    }
    
    try:
        print("[*] Fetching Chaos index from projectdiscovery.io...")
        res = requests.get("https://chaos-data.projectdiscovery.io/index.json", headers=headers)
        res.raise_for_status()
        
        data = res.json()
        print(f"[*] Retrieved {len(data)} total programs from Chaos")
        
        self_hosted = []
        for p in data:
            platform = p.get("platform", "").lower().strip()
            bounty = p.get("bounty", False)
            
            # Filter: not in known platforms AND has bounty
            if platform not in known_platforms and bounty is True:
                self_hosted.append({
                    "name": p.get("name"),
                    "program_url": p.get("program_url"),
                    "platform": platform,
                    "bounty": bounty,
                    "subdomains_count": p.get("count"),
                    "download_url": p.get("URL"),
                })
        
        # Confirm filter
        self_hosted = [p for p in self_hosted if p["bounty"] is True]
        
        # Save to file
        with open("chaos_selfhosted.json", "w") as f:
            json.dump(self_hosted, f, indent=2)
        
        print(f"[✓] Total bounty=True only: {len(self_hosted)}")
        print("\n[*] Sample self-hosted bounty programs:")
        for p in self_hosted[:10]:
            print(f"  {p['name'][:30]:30} | {p['program_url']}")
        
    except requests.exceptions.RequestException as e:
        print(f"[✗] Network error: {e}")
    except json.JSONDecodeError as e:
        print(f"[✗] JSON parse error: {e}")
    except Exception as e:
        print(f"[✗] Error: {e}")


if __name__ == "__main__":
    fetch_chaos_selfhosted_bounty()
