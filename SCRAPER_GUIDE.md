# 🐛 Bug Bounty Programs Database - Update Guide

## What Just Happened
✅ Successfully scraped **bugbountydirectory.com** and integrated **722 bug bounty programs** into your React website!

### New URLs Added: **27 programs**
- **Before:** 695 programs
- **After:** 722 programs

---

## 📋 Available Scripts

### Run the Scraper (Manual Update)
```bash
npm run scrape
```
This will fetch fresh data from bugbountydirectory.com and update both:
- `hunting_ons.json` (root directory)
- `public/hunting_ons.json` (for web access)

### Run Scraper + Build
```bash
npm run scrape:all
```
Scrapes data and rebuilds the React app in one command.

### Start Development Server
```bash
npm start
```
Runs the React app on http://localhost:3000

---

## 🤖 Auto-Scraper (Background Service)

To keep your database automatically updated every 6 hours:

```bash
node scraper-scheduler.js
```

This runs in the background and:
- Scrapes bugbountydirectory.com automatically
- Updates `hunting_ons.json` with new programs
- Runs every 6 hours continuously
- Press `Ctrl+C` to stop

---

## 📊 Database Stats
- **Total Programs:** 722
- **Data Format:** JSON array of URLs
- **Auto-Updates:** Yes (with scheduler)
- **Last Updated:** Just now ✅

---

## 🔧 File Structure
```
/home/boot/Desktop/external_BBP_db/
├── hunting_ons.json          ← Main database (root)
├── public/hunting_ons.json    ← Web-accessible copy
├── scraper-advanced.js         ← Advanced scraper (smart filtering)
├── scraper-scheduler.js        ← Auto-update scheduler
├── src/
│   ├── App.jsx               ← React app (already loads from JSON)
│   ├── App.css
│   ├── Auth.jsx
│   └── ...
├── package.json              ← Updated with new scripts
└── README.md
```

---

## 💡 Usage Tips

1. **Daily Scrapes:** Run `npm run scrape` daily or use the scheduler
2. **Always Sync:** Keep both `hunting_ons.json` files in sync (scraper does this automatically)
3. **Check Quality:** The scraper filters out invalid URLs automatically
4. **Monitor:** Check console output for how many new programs are added each time

---

## 🚀 Next Steps (Optional)

To further enhance your website, you could:
- [ ] Add program names/descriptions from bugbountydirectory.com (would need advanced scraping)
- [ ] Track when each program was added
- [ ] Add filtering by program type/status
- [ ] Store program metadata (bounty ranges, response times, etc.)
- [ ] Set up GitHub Actions to scrape automatically on schedule

---

**Your website is now powered by bugbountydirectory.com data! 🎉**
