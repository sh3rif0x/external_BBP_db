const { chromium } = require('playwright');
const fs = require('fs');

const PAGE_11_LINKS = [
    '/programs/marvia',
    '/programs/ocoya',
    '/programs/potato-vpn',
    '/programs/private-packagist',
    '/programs/pubnub',
    '/programs/pullpo',
    '/programs/safe',
    '/programs/setu',
    '/programs/simpleshow',
    '/programs/spectro-cloud',
    '/programs/spike',
    '/programs/survicate',
    '/programs/sweap',
    '/programs/syncezy',
    '/programs/teamup',
    '/programs/vultr',
    '/programs/wordfence'
];

async function extractProgramUrl(page, detailPageUrl) {
    try {
        await page.goto(`https://www.bugbountydirectory.com${detailPageUrl}`, {
            waitUntil: 'networkidle',
            timeout: 20000
        });

        // Find the main program URL (usually the first external link)
        const urls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.getAttribute('href'))
                .filter(href => {
                    if (!href) return false;
                    const lower = href.toLowerCase();
                    return href.startsWith('http') &&
                        !lower.includes('bugbountydirectory') &&
                        !lower.includes('twitter') &&
                        !lower.includes('facebook') &&
                        !lower.includes('linkedin') &&
                        !lower.includes('github.com/');
                });
        });

        // Return the first external URL found (should be the program)
        return urls.length > 0 ? urls[0] : null;
    } catch (err) {
        return null;
    }
}

async function scrapeAllPrograms() {
    console.log('🌐 Extract URLs from Page 11 Programs\n');
    console.log('=====================================\n');

    let browser;
    const foundPrograms = [];

    try {
        browser = await chromium.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        console.log(`📋 Processing ${PAGE_11_LINKS.length} programs:\n`);

        for (let i = 0; i < PAGE_11_LINKS.length; i++) {
            const link = PAGE_11_LINKS[i];
            const name = link.replace('/programs/', '');
            process.stdout.write(`  ${i + 1}. ${name.padEnd(20)}: `);

            const url = await extractProgramUrl(page, link);

            if (url) {
                console.log(`✓ ${url}`);
                foundPrograms.push({ name, url, source: 'bugbountydirectory', date: new Date().toISOString() });
            } else {
                console.log('❌ No URL found');
            }
        }

        await context.close();

    } finally {
        if (browser) await browser.close();
    }

    return foundPrograms;
}

async function main() {
    try {
        const programs = await scrapeAllPrograms();

        console.log(`\n📊 Results:\n`);
        console.log(`Successfully extracted: ${programs.length}/${PAGE_11_LINKS.length} URLs\n`);

        if (programs.length > 0) {
            // Load existing database
            let existing = [];
            if (fs.existsSync('./hunting_ons.json')) {
                existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
            }

            const existingUrls = new Set(existing.map(p => typeof p === 'string' ? p : p.url));
            const newPrograms = programs.filter(p => !existingUrls.has(p.url));

            console.log(`New programs: ${newPrograms.length}/${programs.length}`);
            console.log(`Already in DB: ${programs.length - newPrograms.length}\n`);

            if (newPrograms.length > 0) {
                console.log('✅ Adding to database:\n');
                newPrograms.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.name.padEnd(20)} → ${p.url}`);
                });

                const formatted = newPrograms.map(p => ({
                    url: p.url,
                    source: 'bugbountydirectory',
                    addedDate: p.date
                }));

                const merged = [...existing, ...formatted];
                fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
                fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));

                console.log(`\n✅ Database updated: ${merged.length} total programs`);

                // Show stats
                const stats = {};
                merged.forEach(p => {
                    const s = typeof p === 'string' ? 'other' : (p.source || 'other');
                    stats[s] = (stats[s] || 0) + 1;
                });

                console.log('\n📊 Source breakdown:');
                Object.entries(stats)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([source, count]) => {
                        console.log(`   ${source.padEnd(22)}: ${count}`);
                    });
            } else {
                console.log('ℹ️  All programs already in database.');
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();