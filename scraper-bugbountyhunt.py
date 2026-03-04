#!/usr/bin/env python3

"""
Fetch bug bounty programs from BugBountyHunt API
Saves to bugbountyhunt_programs.json
"""

import requests
import json
from urllib.parse import urlparse


def fetch_bugbountyhunt_programs():
    """Fetch programs from BugBountyHunt API"""
    
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }
    
    try:
        print("[*] Fetching programs from BugBountyHunt API...")
        res = requests.get("https://bugbountyhunt.com/api/programs", headers=headers)
        res.raise_for_status()
        
        data = res.json()
        programs = data.get("programs", [])
        
        print(f"[*] Retrieved {len(programs)} programs from API")
        
        result = []
        for p in programs:
            try:
                domain = urlparse(p.get("policy_url", "")).netloc
                result.append({
                    "name": p.get("program_name"),
                    "url": p.get("policy_url"),
                    "email": p.get("contact_email"),
                    "bounty": p.get("offers_bounty") == "yes",
                    "safe_harbor": p.get("safe_harbor"),
                    "icon": f"https://www.google.com/s2/favicons?domain={domain}&sz=64" if domain else "",
                })
            except Exception as e:
                print(f"[!] Error processing program: {e}")
                continue
        
        # Save to file
        with open("bugbountyhunt_programs.json", "w") as f:
            json.dump(result, f, indent=2)
        
        print(f"[✓] Total: {len(result)} programs saved")
        print("\n[*] Sample programs:")
        for p in result[:5]:
            bounty_status = "yes" if p['bounty'] else "no"
            print(f"  {p['name'][:30]:30} | bounty:{bounty_status} | {p['url']}")
        
    except requests.exceptions.RequestException as e:
        print(f"[✗] Network error: {e}")
    except json.JSONDecodeError as e:
        print(f"[✗] JSON parse error: {e}")
    except Exception as e:
        print(f"[✗] Error: {e}")


if __name__ == "__main__":
    fetch_bugbountyhunt_programs()
