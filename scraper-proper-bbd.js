const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve) => {
        console.log(`   Fetching: ${url}`);
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   Status: ${res.statusCode}, Size: ${data.length} chars`);
                resolve({ status: res.statusCode, body: data });
            });
        }).on('error', (err) => {
            console.log(`   Error: ${err.message}`);
            resolve({ status: 0, body: '' });
        });
    });
}

async function scrapeBBD() {
    console.log('\n🔍 Scraping bugbountydirectory.com...\n');

    const allPrograms = new Set();

    for (let page = 1; page <= 5; page++) {
        console.log(`📄 Page ${page}:`);
        const url = `https://www.bugbountydirectory.com/programs?page=${page}`;
        const { body } = await fetchUrl(url);

        if (body.length < 1000) {
            console.log(`   ❌ Page too small, stopping\n`);
            break;
        }

        // Method 1: Extract from escaped JSON strings in the HTML
        // Look for patterns like \"https://example.com\"
        const jsonUrls = body.match(/\\\"(https?:\/\/[^\\"]+)\\\"/g) || [];
        const cleanedUrls = jsonUrls.map(u => u.replace(/\\"/g, '"').trim());

        console.log(`   Found ${cleanedUrls.length} URL patterns in JSON`);

        // Method 2: Extract from href attributes
        const hrefUrls = body.match(/href=["\']([^"\']+)["\']/g) || [];
        console.log(`   Found ${hrefUrls.length} href attributes`);

        // Method 3: Look for domain patterns directly
        const domainRegex = /https?:\/\/(?:www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\/?[^\s"'<>){}]*/g;
        const domains = body.match(domainRegex) || [];
        console.log(`   Found ${domains.length} domain URLs via regex`);

        // Filter out known junk
        const filtered = domains.filter(u => {
            const lower = u.toLowerCase();
            return !lower.includes('bugbountydirectory.com') &&
                !lower.includes('_next') &&
                !lower.includes('cloud.umami') &&
                !lower.includes('cloudflare') &&
                !lower.includes('google') &&
                !lower.includes('facebook') &&
                !lower.includes('twitter') &&
                !lower.includes('cdn.') &&
                !lower.includes('.woff') &&
                !lower.includes('.css') &&
                !lower.includes('.js') &&
                u.length > 15;
        });

        console.log(`   After filtering: ${filtered.length} unique domains\n`);

        if (filtered.length > 0) {
            filtered.forEach(url => allPrograms.add(url));
        }

        // Stop if we find a page with very few results
        if (filtered.length < 3) {
            console.log(`   ⚠️  Few results found, stopping scrape\n`);
            break;
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 1000));
    }

    return Array.from(allPrograms);
}

async function main() {
    console.log('🌐 BugBountyDirectory Raw Scraper\n');
    console.log('================================\n');

    let existing = [];
    if (fs.existsSync('./hunting_ons.json')) {
        existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
    }

    const existingUrls = new Set(existing.map(p => typeof p === 'string' ? p : p.url));
    console.log(`📊 Current database: ${existing.length} programs\n`);

    const scrapedUrls = await scrapeBBD();
    console.log(`\n📊 Scraping Results:`);
    console.log(`   Total scraped: ${scrapedUrls.length}`);

    const newUrls = scrapedUrls.filter(url => !existingUrls.has(url));
    console.log(`   Already in DB: ${scrapedUrls.length - newUrls.length}`);
    console.log(`   NEW programs: ${newUrls.length}\n`);

    if (newUrls.length > 0) {
        console.log('✅ NEW PROGRAMS FOUND:\n');
        newUrls.slice(0, 20).forEach(url => console.log(`   ${url}`));
        if (newUrls.length > 20) console.log(`   ... and ${newUrls.length - 20} more`);

        // Format and add to database
        const newPrograms = newUrls.map(url => ({
            url,
            source: 'bugbountydirectory',
            addedDate: new Date().toISOString()
        }));

        const merged = [...existing, ...newPrograms];
        fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));

        // Show stats
        const stats = {};
        merged.forEach(p => {
            const s = typeof p === 'string' ? 'other' : (p.source || 'other');
            stats[s] = (stats[s] || 0) + 1;
        });

        console.log(`\n✅ Database updated: ${merged.length} total programs`);
        console.log('\n📊 Source breakdown:');
        Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([source, count]) => {
                console.log(`   ${source.padEnd(22)}: ${count}`);
            });
    } else {
        console.log('ℹ️  No new programs found.');
        console.log('🤔 If bugbountydirectory.com shows programs but none were scraped,');
        console.log('   it might be that the page is fully client-side rendered.');
        console.log('   Consider using Puppeteer/Playwright for headless browser scraping.');
    }
}

main().catch(e => console.error('Fatal error:', e.message));