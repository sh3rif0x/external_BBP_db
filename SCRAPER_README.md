# 🤖 DAILY BUG BOUNTY SCRAPER SETUP

## What Was Set Up

Your bug bounty programs will now automatically update every single day with new targets and mark them as "NEW" (with a pulsing 🆕 badge on the card for 7 days).

### Features:
- ✅ **Automatic Daily Scraping** - Runs every day at 2:00 AM
- ✅ **5 Platforms** - HackerOne, Bugcrowd, YesWeHack, IssueHunt, BugBountyDirectory
- ✅ **NEW Badge** - Programs added in the last 7 days show a pulsing 🆕 badge
- ✅ **Icon Fetching** - Automatically fetches program logos from each platform
- ✅ **Merge Detection** - Only NEW programs are marked as new, existing ones stay as-is
- ✅ **Daily Logs** - Keeps track of each scrape run with timestamps
- ✅ **Backups** - Backs up previous database before saving new one

### Current Status:
```
📊 Total Programs: 1,623
🆕 New Programs Detected: 29
⏰ Last Update: March 4, 2026 @ 6:30 AM
🎯 Platforms: HackerOne (651), Bugcrowd (205), IssueHunt (18), BugBountyDirectory (277), Other (472)
```

---

## How to Run

### OPTION 1: Run Scraper NOW (Test)
```bash
npm run scrape
```
This runs the master scraper immediately and shows progress.

### OPTION 2: Set Up Daily Cron Job (RECOMMENDED)
```bash
crontab -e
```

Add this line at the end:
```
0 2 * * * cd /home/boot/Desktop/external_BBP_db && node scraper-master.js >> logs/scraper-$(date +\%Y-\%m-\%d).log 2>&1
```

This runs every day at **2:00 AM** and logs all output to `logs/` folder.

Verify it was added:
```bash
crontab -l
```

### OPTION 3: Run Scheduler Daemon (Node-based)
```bash
npm run scheduler
```

This starts a Node.js scheduler that runs every day at 2:00 AM and logs to `scraper-logs.json`.

---

## How It Works

### 1️⃣ Master Scraper (`scraper-master.js`)
Runs all 5 scrapers:
- 🔴 **HackerOne** - 651 programs via official API
- 🎯 **Bugcrowd** - 205 programs from `/engagements.json`
- ✨ **YesWeHack** - Programs with `type === 'bug-bounty'`
- 🎪 **IssueHunt** - 18 programs with `type === 'bounty'` (filters out VDPs)
- 📋 **BugBountyDirectory** - 277 programs from Next.js chunks

### 2️⃣ Merge & Detect New
- Loads existing database (`hunting_ons.json`)
- Compares new scraped programs against existing ones
- Marks only TRUE NEW programs with:
  - `isNew: true`
  - `newDate: "2026-03-04T04:30:05.380Z"`

### 3️⃣ Icon Fetching
Automatically fetches missing program logos:
- **HackerOne**: From `profile-photos.hackerone-user-content.com`
- **Bugcrowd**: Already included in API (`logoUrl`)
- **YesWeHack**: From `thumbnail.url`
- **IssueHunt**: From `organization.icon`

### 4️⃣ Save & Backup
- Backs up old database → `hunting_ons.json.backup`
- Saves new merged data → `hunting_ons.json`
- Copies to public folder → `public/hunting_ons.json` (served to React)

---

## NEW Badge Display

Programs added within the **last 7 days** show a pulsing 🆕 badge:

```
┌─────────────────────────┐
│ 🆕 New  📋 bugbountydirectory │
│                         │
│ [Logo]  https://example.com │
│ example.com             │
│                         │
│ ⭐ ❤️ 🔥 👎             │
└─────────────────────────┘
```

The badge disappears after 7 days automatically.

---

## View Logs

### Recent Scraper Runs:
```bash
ls -lh logs/
tail -20 logs/scraper-2026-03-04.log
```

### Check Scheduled Cron Jobs:
```bash
crontab -l
```

### Monitor Node Scheduler:
```bash
# View logs while running
tail -f scraper-scheduler.log

# Check if process is running
ps aux | grep scraper-scheduler
```

---

## Database Structure

Each program has these fields:
```json
{
  "url": "https://hackerone.com/...",
  "name": "Company Name",
  "source": "hackerone",
  "icon": "https://...",
  "bounty": true,
  "addedDate": "2026-03-04T00:59:32.087Z",
  "isNew": true,
  "newDate": "2026-03-04T04:30:05.380Z"
}
```

---

## Troubleshooting

### Scraper not running?
1. Check if Node is installed: `node --version`
2. Check if dependencies installed: `npm list node-schedule`
3. Test manually: `npm run scrape`

### Cron not working?
1. Check if cron service running: `ps aux | grep cron`
2. Verify cron syntax: `crontab -e` (should highlight errors)
3. Check system logs: `grep CRON /var/log/syslog`

### Database not updating?
1. Check logs: `tail scraper-scheduler.log`
2. Run manually: `npm run scrape`
3. Verify database path: `ls -l hunting_ons.json public/hunting_ons.json`

### NEW badge not showing?
1. Make sure database has `newDate` field
2. Check if program added in last 7 days
3. Refresh browser (Ctrl+F5 hard refresh)

---

## Next Steps

1. ✅ **Test the scraper**: `npm run scrape`
2. ✅ **Set up cron job**: `crontab -e` (add the line above)
3. ✅ **Go to http://localhost:3000** to see the NEW badges
4. ✅ **Monitor logs** to confirm daily runs are happening

---

## Questions?

### What if I want to change the schedule?
Edit crontab (`crontab -e`):
- `0 2 * * *` = Every day at 2:00 AM
- `0 * * * *` = Every hour
- `*/30 * * * *` = Every 30 minutes
- `0 0 * * 0` = Every Sunday at midnight

[Cron schedule reference](https://crontab.guru/)

### What if I want to run multiple times per day?
```bash
# Run at 8 AM, 2 PM, and 8 PM
0 8,14,20 * * * cd /home/boot/Desktop/external_BBP_db && node scraper-master.js >> logs/scraper-$(date +\%Y-\%m-\%d).log 2>&1
```

### How do I disable the auto-scraper?
```bash
crontab -e
# Delete or comment out the scraper line
```

---

**Last Updated**: March 4, 2026  
**Database Size**: 1,623 programs  
**Next Scheduled Run**: Tomorrow at 2:00 AM (or whenever you set up cron)
