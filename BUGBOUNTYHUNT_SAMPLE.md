# BugBountyHunt Sample Data

This file shows the expected data structure when BugBountyHunt API returns programs.

## Example Structure

When the API returns data, each program will have this structure:

```json
[
  {
    "name": "Company Name",
    "url": "https://company.com/bug-bounty-page",
    "email": "security@company.com",
    "bounty": true,
    "safe_harbor": true,
    "icon": "https://www.google.com/s2/favicons?domain=company.com&sz=64"
  },
  {
    "name": "Another Company",
    "url": "https://another.com/vulnerability-disclosure",
    "email": "bugs@another.com",
    "bounty": false,
    "safe_harbor": false,
    "icon": "https://www.google.com/s2/favicons?domain=another.com&sz=64"
  }
]
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Official company/program name |
| `url` | string | Direct link to bug bounty/VDP policy page |
| `email` | string | Security contact email |
| `bounty` | boolean | Whether program offers monetary rewards |
| `safe_harbor` | boolean | Whether program has safe harbor clause |
| `icon` | string | Google favicon URL for the domain |

## Bounty vs VDP

- **Bounty = true**: Program offers cash rewards
- **Bounty = false**: VDP (Vulnerability Disclosure Policy) - no rewards

## How It's Used

After fetching from API:

1. **Filter** → Creates `bugbountyhunt_bounty_only.json` (bounty=true only)
2. **Merge** → Adds to `hunting_ons.json` with:
   - `source`: "bugbountyhunt"
   - `tags`: ["BugBountyHunt", "Bug Bounty"] or ["BugBountyHunt", "VDP"]
   - `addedDate`: Timestamp

3. **Display** → Shows in React app with icon and badges

## Current Status

Currently, the BugBountyHunt API returns 0 programs. This could be due to:
- API endpoint changes
- API access restrictions
- Network connectivity issues

To check API status, run:
```bash
node scraper-bugbountyhunt.js
# or
npm run scrape:bugbountyhunt
```

Check console output for detailed error messages.
