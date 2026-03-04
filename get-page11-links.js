const { chromium } = require('playwright');
const fs = require('fs');

async function scrapePage11Links() {
    console.log('🌐 Page 11: Extract Program Detail Links\n');
    console.log('========================================\n');

    let browser;
    const programLinks = [];

    try {
        browser = await chromium.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        console.log('📄 Loading page 11...\n');
        await page.goto('https://www.bugbountydirectory.com/programs?page=11', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Extract all program links
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href*="/programs/"]'))
                .map(a => a.getAttribute('href'))
                .filter(href => {
                    // Filter for /programs/xxx pattern (not /programs?page=)
                    return href &&
                        href.includes('/programs/') &&
                        !href.includes('?page=') &&
                        href.split('/').length === 3; // /programs/name
                });
        });

        const unique = [...new Set(links)];
        console.log(`📊 Found ${unique.length} program pages:\n`);

        unique.slice(0, 20).forEach((link, i) => {
            const name = link.replace('/programs/', '').replace('/', '');
            console.log(`${i + 1}. ${link}`);
        });

        if (unique.length > 20) {
            console.log(`... and ${unique.length - 20} more`);
        }

        await context.close();
        return unique;

    } finally {
        if (browser) await browser.close();
    }
}

async function main() {
    try {
        const links = await scrapePage11Links();
        console.log(`\n✅ Found ${links.length} program pages ready to process`);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();