# 💰 Bug Bounty Programs (Bounty Paying Only)

## Summary

**Total Programs Paying Bounties: 696**

### By Platform:
- 🔴 **HackerOne**: 350 programs
- 📋 **BugBountyDirectory**: 247 programs  
- ✨ **YesWeHack**: 85 programs
- 🎱 **BugBountyHunt**: 12 programs
- 🔗 **Chaos**: 1 program
- 🎪 **IssueHunt**: 1 program

## Files

### Main Database
- **bounty_only_all.json** - All 696 bounty-paying programs consolidated
- **public/bounty_only_all.json** - Public version served to React app

### Platform-Specific Bounty Lists
- **bugbountyhunt_bounty_only.json** - 9 BugBountyHunt bounty programs
- **chaos_bounty_only.json** - 1 Chaos bounty program

## How to Use

### Generate/Update Bounty-Only Database
```bash
npm run create:bounty-only
```

This will:
1. Filter all programs by `bounty: true`
2. Create `bounty_only_all.json`
3. Copy to `public/bounty_only_all.json`
4. Rebuild React app

### Access via Code
```javascript
// In your React component
import bountyPrograms from '../public/bounty_only_all.json';

// Use the bounty programs
const [programs, setPrograms] = useState(bountyPrograms);
```

### Access Bounty Programs in React App
The bounty-only data is now in `public/bounty_only_all.json` and ready for use!

## Commands

```bash
# Create/update bounty-only database
npm run create:bounty-only

# Get latest BugBountyHunt data
npm run scrape:bugbountyhunt

# Update everything and show bounty only
npm run update:bugbountyhunt && npm run create:bounty-only
```

## Data Structure

Each program in `bounty_only_all.json`:
```json
{
  "url": "https://example.com/bug-bounty",
  "source": "hackerone",
  "name": "Example Corp",
  "bounty": true,
  "addedDate": "2026-03-04T...",
  "tags": ["Bug Bounty", "Web"],
  "icon": "https://www.google.com/s2/favicons?domain=example.com&sz=64"
}
```

## Top 10 Bounty Programs

1. ACT Fibernet - bugbountydirectory
2. Kagi - bugbountydirectory
3. Dune - bugbountydirectory
4. Pacifica - bugbountydirectory
5. SetPoint Medical - bugbountydirectory
(... and 691 more)

## Tips

✅ **Filter on frontend:**
```javascript
const bountyOnly = allPrograms.filter(p => p.bounty === true);
```

✅ **Filter by multiple sources:**
```javascript
const hackeroneOnly = bountyPrograms.filter(p => p.source === 'hackerone');
const bugcrowdOnly = bountyPrograms.filter(p => p.source === 'bugcrowd');
```

✅ **Get bounty count by source:**
```javascript
const bySource = {};
bountyPrograms.forEach(p => {
  bySource[p.source] = (bySource[p.source] || 0) + 1;
});
```

## Stats

| Metric | Count |
|--------|-------|
| Total Programs | 1,656 |
| Bounty Programs | 696 |
| VDP Only | 960 |
| **Bounty %** | **42%** |

---

**Last Updated:** March 4, 2026  
**Total Bounty Programs:** 696
