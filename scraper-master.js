const https = require('https');
const fs = require('fs');
const path = require('path');

const DB_PATH = './hunting_ons.json';
const BACKUP_PATH = './hunting_ons.backup.json';

// Load existing database
function loadDatabase() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('❌ Error loading database:', e.message);
    }
    return [];
}

// Save database
function saveDatabase(data) {
    // Backup old database
    if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, BACKUP_PATH);
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    fs.copyFileSync(DB_PATH, './public/hunting_ons.json');
}

// Fetch URL with retry
function fetchUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
        const timeout = options.timeout || 15000;
        const headers = options.headers || { 'User-Agent': 'Mozilla/5.0' };

        https.get(url, { headers, timeout }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (err) {
                    resolve({ status: res.statusCode, data: null });
                }
            });
        }).on('error', reject);
    });
}

// Individual Scrapers
async function scrapeHackerOne() {
    console.log('\n🔴 HackerOne...');
    const programs = [];
    let page = 1;

    while (page <= 7) {
        try {
            const url = `https://api.hackerone.com/v1/hackers/programs?page[number]=${page}&page[size]=100`;
            const { data } = await fetchUrl(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Basic ${Buffer.from('sh3rif0x:b/Xslk7xWmFcp4HJoH1j+4MusYzoZ9JRYgRAnOJkAUA=').toString('base64')}`,
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            if (!data || !data.data) break;
            data.data.forEach(p => {
                programs.push({
                    url: p.url,
                    name: p.name,
                    source: 'hackerone',
                    bounty: p.offers_bounties,
                    private: p.requires_approval,
                    addedDate: new Date().toISOString()
                });
            });
            page++;
        } catch (e) {
            console.log('  ⚠️ Error:', e.message);
            break;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    console.log(`  ✅ ${programs.length} programs`);
    return programs;
}

async function scrapeBugcrowd() {
    console.log('🎯 Bugcrowd...');
    const programs = [];
    let page = 1;

    while (page <= 20) {
        try {
            const url = `https://bugcrowd.com/engagements.json?page=${page}`;
            const { data } = await fetchUrl(url);

            if (!data || !data.engagements || data.engagements.length === 0) break;
            data.engagements.forEach(p => {
                programs.push({
                    url: p.url,
                    name: p.name,
                    source: 'bugcrowd',
                    icon: p.logoUrl,
                    bounty: !!p.bounty_awarded_amount,
                    addedDate: new Date().toISOString()
                });
            });
            page++;
        } catch (e) {
            console.log('  ⚠️ Error:', e.message);
            break;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    console.log(`  ✅ ${programs.length} programs`);
    return programs;
}

async function scrapeYesWeHack() {
    console.log('✨ YesWeHack...');
    const programs = [];
    let page = 1;

    while (page <= 10) {
        try {
            const url = `https://api.yeswehack.com/programs?page=${page}`;
            const { data } = await fetchUrl(url);

            if (!data || !data.data || data.data.length === 0) break;
            data.data.forEach(p => {
                if (p.type === 'bug-bounty') {
                    programs.push({
                        url: `https://yeswehack.com/programs/${p.slug}`,
                        name: p.name,
                        source: 'yeswehack',
                        icon: p.thumbnail ? .url,
                        bounty: true,
                        addedDate: new Date().toISOString()
                    });
                }
            });
            if (page >= 10) break;
            page++;
        } catch (e) {
            console.log('  ⚠️ Error:', e.message);
            break;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    console.log(`  ✅ ${programs.length} programs`);
    return programs;
}

async function scrapeIssueHunt() {
    console.log('🎪 IssueHunt...');
    const programs = [];
    let page = 1;

    while (page <= 5) {
        try {
            const url = `https://api.issuehunt.io/programs?page=${page}&perPage=100`;
            const { data } = await fetchUrl(url);

            if (!data || !data.data || data.data.length === 0) break;
            data.data.forEach(p => {
                if (p.type === 'bounty') {
                    programs.push({
                        url: p.url,
                        name: p.name,
                        source: 'issuehunt',
                        icon: p.organization ? .icon,
                        bounty: true,
                        addedDate: new Date().toISOString()
                    });
                }
            });
            if (page >= 5) break;
            page++;
        } catch (e) {
            console.log('  ⚠️ Error:', e.message);
            break;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    console.log(`  ✅ ${programs.length} programs`);
    return programs;
}

async function scrapeBugBountyDirectory() {
    console.log('📋 BugBountyDirectory...');
    const programs = [];

    try {
        const url = 'https://www.bugbountydirectory.com/_next/static/chunks/d62b1434f561f626.js';
        const response = await new Promise((resolve, reject) => {
            https.get(url, { timeout: 15000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });

        const regex = /company:"([^"]+)"|url:"(https?:\/\/[^"]+)"|overview:"([^"]*?)(?:",|\\n)/g;
        let match;
        let current = {};

        while ((match = regex.exec(response)) !== null) {
            if (match[1]) current.name = match[1];
            if (match[2]) current.url = match[2];
            if (match[3]) current.overview = match[3];

            if (current.name && current.url) {
                programs.push({
                    url: current.url,
                    name: current.name,
                    source: 'bugbountydirectory',
                    addedDate: new Date().toISOString()
                });
                current = {};
            }
        }
    } catch (e) {
        console.log('  ⚠️ Error:', e.message);
    }

    console.log(`  ✅ ${programs.length} programs`);
    return programs;
}

// Merge and detect new programs
async function mergeAndDetectNew(allScrapes) {
    console.log('\n📊 Merging data...');
    const oldDb = loadDatabase();
    const oldUrls = new Set(oldDb.map(p => p.url));

    let newCount = 0;
    const merged = {};

    // Keep old data
    oldDb.forEach(p => {
        merged[p.url] = p;
    });

    // Add new/updated data
    allScrapes.forEach(p => {
        if (!oldUrls.has(p.url)) {
            newCount++;
            p.isNew = true;
            p.newDate = new Date().toISOString();
        }
        merged[p.url] = {...merged[p.url], ...p };
    });

    const result = Object.values(merged);
    console.log(`  ✅ Total: ${result.length} | New: ${newCount}`);
    return { programs: result, newCount };
}

// Fetch missing icons
async function fetchMissingIcons(programs) {
    console.log('\n🖼️  Fetching missing icons...');
    let iconCount = 0;

    for (let i = 0; i < programs.length; i++) {
        const p = programs[i];
        if (p.icon) {
            iconCount++;
            continue;
        }

        if (p.source === 'hackerone' && p.name) {
            try {
                const code = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const iconUrl = `https://profile-photos.hackerone-user-content.com/variants/000/000/000/69d36b3c5e6f2d0f9c8b7a6d5e4f3a2b1c0d9e8f/original/profile.jpg`;
                p.icon = `https://profile-photos.hackerone-user-content.com/variants/${code}/original/avatar.jpg`;
                iconCount++;
            } catch (e) {
                // skip
            }
        }

        if (i % 10 === 0) {
            process.stdout.write(`\r  ✓ ${i}/${programs.length}`);
            await new Promise(r => setTimeout(r, 200));
        }
    }

    console.log(`\n  ✅ ${iconCount}/${programs.length} have icons`);
    return programs;
}

// Main function
async function runScraper() {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   🤖 DAILY BUG BOUNTY SCRAPER 🤖     ║');
    console.log('║     ' + new Date().toLocaleString() + '     ║');
    console.log('╚═══════════════════════════════════════╝');

    try {
        // Run all scrapers
        const hacker1 = await scrapeHackerOne();
        const bugcrowd = await scrapeBugcrowd();
        const yeswehack = await scrapeYesWeHack();
        const issuehunt = await scrapeIssueHunt();
        const bbd = await scrapeBugBountyDirectory();

        const allScrapes = [...hacker1, ...bugcrowd, ...yeswehack, ...issuehunt, ...bbd];

        // Merge and detect new
        const { programs, newCount } = await mergeAndDetectNew(allScrapes);

        // Fetch icons
        const withIcons = await fetchMissingIcons(programs);

        // Save
        saveDatabase(withIcons);

        console.log('\n✅ SCRAPING COMPLETE!');
        console.log(`   Total Programs: ${withIcons.length}`);
        console.log(`   New Programs: ${newCount}`);
        console.log(`   Last Run: ${new Date().toLocaleString()}`);
        console.log('\n');

        return { success: true, total: withIcons.length, newCount };
    } catch (err) {
        console.error('\n❌ SCRAPING FAILED:', err);
        return { success: false, error: err.message };
    }
}

// Run if called directly
if (require.main === module) {
    runScraper().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = { runScraper };