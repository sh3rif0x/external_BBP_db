# BugBountyHunt Scraper Integration Guide

This guide explains the new BugBountyHunt API scraper added to your project.

## Files Added

### 1. **scraper-bugbountyhunt.js** (Node.js)
Fetches bug bounty programs from BugBountyHunt API and saves to `bugbountyhunt_programs.json`

**Usage:**
```bash
node scraper-bugbountyhunt.js
# or via npm
npm run scrape:bugbountyhunt
```

### 2. **scraper-bugbountyhunt.py** (Python)
Python version of the BugBountyHunt scraper

**Usage:**
```bash
python3 scraper-bugbountyhunt.py
```

### 3. **filter-bugbountyhunt-bounty.js**
Filters programs and creates `bugbountyhunt_bounty_only.json` with only bounty-paying programs

**Usage:**
```bash
npm run filter:bugbountyhunt
```

### 4. **merge-bugbountyhunt-programs.js**
Merges BugBountyHunt programs into `hunting_ons.json` for integration with your main app

**Usage:**
```bash
npm run merge:bugbountyhunt
```

## Complete Workflow

### One-Command Update
```bash
npm run update:bugbountyhunt
```

This runs:
1. ✅ Scrape: `node scraper-bugbountyhunt.js`
2. ✅ Filter: `node filter-bugbountyhunt-bounty.js`
3. ✅ Merge: `node merge-bugbountyhunt-programs.js`

### Individual Steps
```bash
# 1. Fetch from API
npm run scrape:bugbountyhunt

# 2. Filter for bounties
npm run filter:bugbountyhunt

# 3. Merge into hunting_ons.json
npm run merge:bugbountyhunt

# 4. Rebuild app
npm run build
```

## Data Structure

Programs are normalized to this format:
```json
{
  "name": "Company Name",
  "url": "https://example.com/bug-bounty",
  "email": "security@example.com",
  "bounty": true,
  "safe_harbor": true,
  "icon": "https://www.google.com/s2/favicons?domain=example.com&sz=64"
}
```

When merged into `hunting_ons.json`, adds:
- `source`: "bugbountyhunt"
- `tags`: ["BugBountyHunt", "Bug Bounty"] or ["BugBountyHunt", "VDP"]
- `addedDate`: ISO timestamp

## API Notes

**Current Status:** API currently returns 0 programs

**If API returns 0 programs:**
1. The BugBountyHunt API endpoint may have changed
2. API might require authentication headers
3. Response format might have changed

**To troubleshoot:**
```bash
# Check API response directly
curl -H "User-Agent: Mozilla/5.0" \
     -H "Accept: application/json" \
     https://bugbountyhunt.com/api/programs | python3 -m json.tool
```

**To update API endpoint:**
Edit `scraper-bugbountyhunt.js` or `scraper-bugbountyhunt.py` and update:
```javascript
const data = await fetchFromApi('https://bugbountyhunt.com/api/programs');
```

## Integration with Other Scrapers

Run all scrapers together:
```bash
npm run scrape:all
npm run build
```

Supported platforms:
- ✅ Chaos (chaos_selfhosted.json)
- ✅ HackerOne (h1_programs.json)
- ✅ Bugcrowd (bugcrowd_programs.json)
- ✅ BugBountyHunt (bugbountyhunt_programs.json) - NEW
- ✅ BugBounty.jp (bugbounty_programs.json)
- ✅ IssueHunt (issuehunt_programs.json)
- ✅ YesWeHack (yeswehack_programs.json)

## NPM Scripts Reference

```json
{
  "scrape:bugbountyhunt": "Fetch from BugBountyHunt API",
  "filter:bugbountyhunt": "Filter for bounty-only programs",
  "merge:bugbountyhunt": "Merge into hunting_ons.json",
  "update:bugbountyhunt": "Run all 3 steps above"
}
```

## Frontend Usage

Programs automatically appear in your React app after merging:
```javascript
// They're loaded from hunting_ons.json
const bugBountyUrls = [...]; // includes bugbountyhunt programs

// Filter by source
const bbhPrograms = bugBountyUrls.filter(p => p.source === 'bugbountyhunt');
```

## Troubleshooting

**No programs showing up:**
- Run: `npm run scrape:bugbountyhunt` (check for errors)
- Check `bugbountyhunt_programs.json` file exists
- Run: `npm run merge:bugbountyhunt`
- Rebuild: `npm run build`

**API request fails:**
- Check internet connection
- Verify API endpoint is accessible
- Check User-Agent header is set
- Try: `curl https://bugbountyhunt.com/api/programs`

**Merge fails:**
- Verify `hunting_ons.json` exists
- Check JSON syntax in both files
- Run: `node merge-bugbountyhunt-programs.js` for detailed error
