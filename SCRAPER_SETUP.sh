#!/bin/bash

# 🤖 BUG BOUNTY PROGRAMS - AUTOMATED DAILY SCRAPER SETUP
# This script sets up automatic daily scraping using cron jobs

echo "╔════════════════════════════════════════╗"
echo "║  🤖 SCRAPER SETUP                     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Define paths
PROJECT_DIR="/home/boot/Desktop/external_BBP_db"
SCRAPER_SCRIPT="$PROJECT_DIR/scraper-master.js"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/scraper-$(date +%Y-%m-%d).log"

# Create logs directory
mkdir -p "$LOG_DIR"

echo "✅ Project directory: $PROJECT_DIR"
echo "✅ Scraper script: $SCRAPER_SCRIPT"
echo "✅ Logs directory: $LOG_DIR"
echo ""

# Install dependencies if needed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install node-schedule if not already installed
if ! npm list node-schedule &> /dev/null; then
    echo "📦 Installing node-schedule..."
    npm install node-schedule
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  INSTALLATION OPTIONS                 ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "1️⃣  RUN NOW (manual test)"
echo "    $ node scraper-master.js"
echo ""
echo "2️⃣  SET UP DAILY CRON (Linux/Mac)"
echo "    Add to crontab: crontab -e"
echo "    # Run at 2:00 AM every day"
echo "    0 2 * * * cd $PROJECT_DIR && node scraper-master.js >> $LOG_DIR/scraper-\$(date +\\%Y-\\%m-\\%d).log 2>&1"
echo ""
echo "3️⃣  RUN SCHEDULER DAEMON"
echo "    $ npm run scheduler"
echo "    (Runs every day at 2:00 AM, auto-starts on boot)"
echo ""
echo "4️⃣  RUN IMMEDIATE TEST"
echo "    $ npm run scheduler:run-now"
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  RECOMMENDED: OPTION 2 (Cron)         ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "To set up cron job, run:"
echo "  crontab -e"
echo ""
echo "Then add this line:"
echo "  0 2 * * * cd $PROJECT_DIR && node $SCRAPER_SCRIPT >> $LOG_DIR/scraper-\$(date +\\%Y-\\%m-\\%d).log 2>&1"
echo ""
echo "This will:"
echo "  ✅ Run scraper at 2:00 AM every day"
echo "  ✅ Scrape all 5 platforms automatically"
echo "  ✅ Mark new programs with NEW badge (shown for 7 days)"
echo "  ✅ Fetch icons for all programs"
echo "  ✅ Save daily logs in logs/ directory"
echo ""
echo "To verify cron job was added:"
echo "  crontab -l"
echo ""
