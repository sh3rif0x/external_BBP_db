const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

async function scrapeBBD() {
    console.log('🔍 Scraping bugbountydirectory.com/programs?page=1...\n');

    const programs = [];

    for (let page = 1; page <= 3; page++) {
        console.log(`📄 Page ${page}...`);
        const url = `https://www.bugbountydirectory.com/programs?page=${page}`;
        const { body } = await fetchUrl(url);

        // Extract all URLs from the page
        const urlMatch = body.match(/(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"<>)]*)/gi) || [];
        const filtered = urlMatch.filter(u =>
            !u.includes('bugbountydirectory') &&
            !u.includes('nextjs') &&
            !u.includes('_next') &&
            !u.includes('google') &&
            !u.includes('facebook') &&
            !u.includes('twitter') &&
            u.length > 20
        );

        const unique = [...new Set(filtered)];
        console.log(`  ✓ Found ${unique.length} URLs`);

        unique.forEach(url => {
            programs.push({ url, source: 'bugbountydirectory', addedDate: new Date().toISOString() });
        });

        if (unique.length < 5) break;
        await new Promise(r => setTimeout(r, 800));
    }

    return programs;
}

async function main() {
    console.log('🌐 BugBountyDirectory Scraper\n');

    let existing = [];
    if (fs.existsSync('./hunting_ons.json')) {
        existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
    }

    const existingUrls = new Set(existing.map(p => p.url || p));
    console.log(`📊 Current: ${existing.length} programs\n`);

    const newPrograms = await scrapeBBD();
    const unique = newPrograms.filter(p => !existingUrls.has(p.url));

    console.log(`\n📈 Scraped: ${newPrograms.length} | New: ${unique.length}`);

    if (unique.length > 0) {
        const merged = [...existing, ...unique];
        fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));

        const stats = {};
        merged.forEach(p => {
            const s = p.source || 'other';
            stats[s] = (stats[s] || 0) + 1;
        });

        console.log(`\n✅ Database updated to ${merged.length} programs`);
        console.log('\n📊 Source breakdown:');
        Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => {
            console.log(`   ${s.padEnd(22)}: ${c}`);
        });
    } else {
        console.log('\nℹ️  No new programs found.');
    }
}

main().catch(e => console.error('Error:', e.message));