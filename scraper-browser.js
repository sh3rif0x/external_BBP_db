const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeBBDWithBrowser() {
    console.log('🌐 BugBountyDirectory Improved Scraper\n');
    console.log('=====================================\n');

    let browser;
    const allPrograms = new Set();

    try {
        console.log('📱 Launching Chromium...\n');
        browser = await chromium.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        // Scrape multiple pages
        for (let pageNum = 1; pageNum <= 5; pageNum++) {
            const url = `https://www.bugbountydirectory.com/programs?page=${pageNum}`;
            console.log(`📄 Page ${pageNum}`);

            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

                // Debug: save screenshot to see what's rendered
                if (pageNum === 1) {
                    await page.screenshot({ path: '/tmp/bbd-page1.png' });
                    console.log('  📸 Screenshot saved to /tmp/bbd-page1.png');
                }

                // Try to find programs with improved filtering
                const programs = await page.evaluate(() => {
                    const urls = new Set();

                    // Find all links
                    document.querySelectorAll('a[href]').forEach(link => {
                        const href = link.href;
                        const text = link.textContent.trim();

                        if (href.startsWith('http') &&
                            !href.includes('bugbountydirectory') &&
                            !href.includes('_next') &&
                            !href.includes('x.com') &&
                            !href.includes('twitter.com') &&
                            !href.includes('github.com') &&
                            !href.includes('cloud.umami') &&
                            !href.includes('linkedin') &&
                            !href.includes('facebook') &&
                            !href.includes('youtube') &&
                            !href.includes('.js') &&
                            !href.includes('.css') &&
                            href.length > 20 &&
                            text.length > 0) {
                            urls.add(href);
                        }
                    });

                    return Array.from(urls);
                });

                console.log(`  ✓ Found ${programs.length} links`);

                if (programs.length > 0) {
                    programs.forEach(p => allPrograms.add(p));
                    console.log('');
                } else {
                    // Debug info
                    const pageTitle = await page.title();
                    console.log(`  ⚠️  No programs found (title: ${pageTitle})`);

                    const content = await page.content();
                    console.log(`  Page size: ${content.length} chars`);

                    const allLinks = await page.evaluate(() => document.querySelectorAll('a').length);
                    console.log(`  Total links on page: ${allLinks}\n`);
                    break;
                }

            } catch (err) {
                console.log(`  ❌ Error: ${err.message}\n`);
                break;
            }
        }

        await context.close();

    } finally {
        if (browser) await browser.close();
    }

    return Array.from(allPrograms);
}

async function main() {
    try {
        const scrapedUrls = await scrapeBBDWithBrowser();

        console.log('📊 Scraping Results:\n');
        console.log(`Total unique URLs found: ${scrapedUrls.length}\n`);

        if (scrapedUrls.length > 0) {
            console.log('Sample URLs:');
            scrapedUrls.slice(0, 10).forEach(url => console.log(`  ${url}`));
            if (scrapedUrls.length > 10) {
                console.log(`  ... and ${scrapedUrls.length - 10} more`);
            }

            // Load existing database
            let existing = [];
            if (fs.existsSync('./hunting_ons.json')) {
                existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
            }

            const existingUrls = new Set(existing.map(p => typeof p === 'string' ? p : p.url));
            const newUrls = scrapedUrls.filter(url => !existingUrls.has(url));

            console.log(`\n✅ NEW programs found: ${newUrls.length}`);
            console.log(`   Already in DB: ${scrapedUrls.length - newUrls.length}`);

            if (newUrls.length > 0) {
                console.log(`\n🎉 Adding ${newUrls.length} new programs to database...\n`);

                const newPrograms = newUrls.map(url => ({
                    url,
                    source: 'bugbountydirectory',
                    addedDate: new Date().toISOString()
                }));

                const merged = [...existing, ...newPrograms];
                fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
                fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));

                const stats = {};
                merged.forEach(p => {
                    const s = typeof p === 'string' ? 'other' : (p.source || 'other');
                    stats[s] = (stats[s] || 0) + 1;
                });

                console.log(`✅ Database updated: ${merged.length} total programs\n`);
                console.log('📊 Source breakdown:');
                Object.entries(stats)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([source, count]) => {
                        console.log(`   ${source.padEnd(22)}: ${count}`);
                    });
            } else {
                console.log('\nℹ️  All programs already in database.');
            }
        } else {
            console.log('❌ No programs found!');
            console.log('\n⚠️  Diagnosis:');
            console.log('   The page may use dynamic loading or obfuscation.');
            console.log('   Check /tmp/bbd-page1.png to see what was rendered.');
            console.log('\n💡 Next steps:');
            console.log('   - View bugbountydirectory.com in a browser');
            console.log('   - Right-click → Inspect → Network tab');
            console.log('   - Filter for HTTP/XHR requests to find the data endpoint');
            console.log('   - Update the scraper with the correct API endpoint');
        }
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

main();