const { chromium } = require('playwright');
const fs = require('fs');

async function debugLinks() {
    console.log('🔍 Debugging: Showing ALL links on bugbountydirectory.com/programs?page=1\n');

    let browser;

    try {
        browser = await chromium.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto('https://www.bugbountydirectory.com/programs?page=1', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Get ALL links
        const allLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]')).map(a => ({
                href: a.href,
                text: a.textContent.trim().substring(0, 50),
                classList: Array.from(a.classList).join(' ')
            }));
        });

        console.log(`📊 Found ${allLinks.length} total links:\n`);
        allLinks.forEach((link, i) => {
            console.log(`${i + 1}. ${link.href}`);
            console.log(`   Text: ${link.text || '(no text)'}`);
            console.log(`   Class: ${link.classList || '(no class)'}\n`);
        });

        // Count which ones pass the filter
        const filtered = allLinks.filter(link => {
            const href = link.href;
            const text = link.text;

            return href.startsWith('http') &&
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
                text.length > 0;
        });

        console.log(`\n🎯 After filtering: ${filtered.length} would pass\n`);
        if (filtered.length === 0 && allLinks.length > 0) {
            console.log('❌ ALL links were filtered out! Need to adjust filters.');
            console.log('\nAnalyzing why links are being removed:\n');

            allLinks.slice(0, 10).forEach(link => {
                const reasons = [];
                if (!link.href.startsWith('http')) reasons.push('not HTTP');
                if (link.href.includes('bugbountydirectory')) reasons.push('has bugbountydirectory');
                if (link.href.includes('_next')) reasons.push('has _next');
                if (link.href.length <= 20) reasons.push('too short');
                if (link.text.length === 0) reasons.push('no text');

                console.log(`${link.href.substring(0, 60)}${link.href.length > 60 ? '...' : ''}`);
                console.log(`  ❌ Filtered because: ${reasons.join(', ') || 'unknown'}\n`);
            });
        }

        await context.close();

    } finally {
        if (browser) await browser.close();
    }
}

debugLinks().catch(console.error);