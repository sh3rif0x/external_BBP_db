const schedule = require('node-schedule');
const { runScraper } = require('./scraper-master');
const fs = require('fs');

const LOG_FILE = './scraper-logs.json';

// Load log history
function loadLogs() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Error loading logs:', e.message);
    }
    return [];
}

// Save log
function saveLogs(logs) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

// Run scheduled scraper
async function scheduledRun() {
    console.log('\n📅 Scheduled scraper run started...');
    const result = await runScraper();

    // Log the result
    const logs = loadLogs();
    logs.push({
        timestamp: new Date().toISOString(),
        success: result.success,
        total: result.total || 0,
        newCount: result.newCount || 0,
        error: result.error || null
    });

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = logs.filter(l => new Date(l.timestamp) > thirtyDaysAgo);

    saveLogs(filtered);

    console.log(`📊 Log saved. Total logs: ${filtered.length}`);
}

// Start scheduler
function startScheduler() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  🤖 BUG BOUNTY DAILY SCHEDULER 🤖    ║');
    console.log('║  Status: 🟢 RUNNING                   ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Run every day at 2:00 AM
    const job = schedule.scheduleJob('0 2 * * *', async() => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⏰ SCHEDULED RUN TRIGGERED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        await scheduledRun();
    });

    // Also run on startup (with 5 second delay)
    setTimeout(async() => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 FIRST RUN ON STARTUP');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        await scheduledRun();
    }, 5000);

    // Print next runs
    function printNextRun() {
        console.log(`\n⏱️  Next scheduled run: ${job.nextInvocation()}`);
        console.log('📝 Logs saved to: scraper-logs.json');
        console.log('💾 Database: hunting_ons.json\n');
    }

    printNextRun();
    setInterval(printNextRun, 3600000); // Update every hour

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🛑 SCHEDULER STOPPED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(0);
    });
}

// Manual run option
if (process.argv[2] === 'now') {
    console.log('🔄 Running scraper NOW...\n');
    scheduledRun();
} else {
    startScheduler();
}

module.exports = { startScheduler, scheduledRun };