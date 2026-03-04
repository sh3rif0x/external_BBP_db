# Chaos Selfhosted Programs Integration Guide

This guide explains the new Chaos programs data integration added to your project.

## Files Added

### 1. **chaos_selfhosted.json**
Main database containing all Chaos selfhosted programs with:
- Program name and URL
- Bounty status (true/false)
- Subdomain count
- Download URL for scope data
- Favicon icons

### 2. **fetch-chaos-icons.js** (Node.js)
Updates Google favicon icons for all programs in `chaos_selfhosted.json`

**Usage:**
```bash
node fetch-chaos-icons.js
```

**What it does:**
- Reads chaos_selfhosted.json
- Extracts domain from each program_url
- Generates Google favicon URLs
- Updates the icon field
- Displays sample results

### 3. **fetch-chaos-icons.py** (Python)
Python version of the icon fetcher

**Usage:**
```bash
python3 fetch-chaos-icons.py
```

### 4. **filter-chaos-bounty.js**
Filters programs and creates `chaos_bounty_only.json` with only bounty-paying programs

**Usage:**
```bash
node filter-chaos-bounty.js
```

**Output:**
- Creates `chaos_bounty_only.json`
- Lists all bounty programs found
- Shows subdomain counts

## Workflow Examples

### Update Icons (JavaScript)
```bash
node fetch-chaos-icons.js
```

### Update Icons (Python)
```bash
python3 fetch-chaos-icons.py
```

### Filter for Bounty Programs
```bash
node filter-chaos-bounty.js
```

### Run All Updates
```bash
npm run update-chaos
```

Add this to `package.json` scripts:
```json
"scripts": {
  "update-chaos": "node fetch-chaos-icons.js && node filter-chaos-bounty.js"
}
```

## Data Structure Example

```json
{
  "name": "Agicap",
  "program_url": "https://agicap.com/en/bug-bounty/",
  "platform": "",
  "bounty": true,
  "subdomains_count": 35,
  "download_url": "https://chaos-data.projectdiscovery.io/agicap.zip",
  "icon": "https://www.google.com/s2/favicons?domain=agicap.com&sz=64"
}
```

## Integration with Existing Project

The Chaos programs integrate with:
- **HackerOne programs** (h1_programs.json, h1_bounty_programs.json)
- **Bugcrowd programs** (bugcrowd_programs.json)
- **BugBounty.jp programs** (bugbounty_programs.json, bugbounty_programs_bounty_only.json)
- **IssueHunt programs** (issuehunt_programs.json)
- **YesWeHack programs** (yeswehack_programs.json)

All programs can be merged into a unified database or displayed separately in the React frontend.

## Frontend Usage

To use Chaos programs in your React app:

```javascript
import chaosPrograms from '../chaos_selfhosted.json';
import chaosBountyPrograms from '../chaos_bounty_only.json';

// Use in component
const [programs, setPrograms] = useState(chaosPrograms);
```

## Notes

- Icons are fetched from Google's favicon service
- Network connection required to fetch live icons
- Bounty status is pre-determined in the data
- Subdomain counts vary by program scope
- Download URLs point to ProjectDiscovery's Chaos datasets
