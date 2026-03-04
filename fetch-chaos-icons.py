#!/usr/bin/env python3

"""
Fetch and update icons for Chaos Selfhosted programs
Adds Google favicon icons to all programs in chaos_selfhosted.json
"""

import json
from urllib.parse import urlparse


def update_chaos_icons():
    """Update icons for all programs in chaos_selfhosted.json"""
    
    program_file = "chaos_selfhosted.json"
    
    try:
        # Load programs
        with open(program_file, "r") as f:
            programs = json.load(f)
        
        print(f"[*] Loaded {len(programs)} programs from {program_file}")
        
        updated = 0
        
        # Add icons to each program
        for p in programs:
            try:
                if "program_url" in p and p["program_url"]:
                    domain = urlparse(p["program_url"]).netloc
                    if domain:
                        p["icon"] = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
                        updated += 1
            except Exception as e:
                print(f"[!] Error processing {p.get('name', 'Unknown')}: {e}")
                p["icon"] = ""
        
        # Save updated programs
        with open(program_file, "w") as f:
            json.dump(programs, f, indent=2)
        
        print(f"[✓] Icons added to {updated} programs")
        print("\n[*] Sample programs:")
        for p in programs[:5]:
            print(f"  {p['name']:30} | {p['icon']}")
    
    except FileNotFoundError:
        print(f"[✗] File not found: {program_file}")
    except json.JSONDecodeError:
        print(f"[✗] Invalid JSON in {program_file}")
    except Exception as e:
        print(f"[✗] Error: {e}")


if __name__ == "__main__":
    update_chaos_icons()
