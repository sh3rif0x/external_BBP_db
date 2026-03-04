const { chromium } = require('playwright');

(async() => {
    try {
        const browser = await chromium.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });

        const page = await (await browser.newContext()).newPage();

        console.log('📋 Loading first program page...\n');
        await page.goto('https://www.bugbountydirectory.com/programs?page=1', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Get first program link
        const firstProgramLink = await page.getAttribute('a[href*="/programs/mrd"]', 'href');
        console.log(`Opening: ${firstProgramLink}\n`);

        await page.goto(firstProgramLink, { waitUntil: 'networkidle', timeout: 30000 });

        // Get all links on program detail page
        const allLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]')).map(a => ({
                href: a.href,
                text: a.textContent.trim().substring(0, 50)
            })).filter(link => link.href.startsWith('http'));
        });

        console.log(`Found ${allLinks.length} total links on detail page\n`);
        console.log('Non-bugbountydirectory links (actual programs):');

        const programs = allLinks.filter(link => !link.href.includes('bugbountydirectory'));
        programs.forEach((link, i) => {
            console.log(`${i + 1}. ${link.href}`);
            console.log(`   Text: ${link.text}\n`);
        });

        if (programs.length === 0) {
            console.log('❌ No actual program URLs found on detail page');
            console.log('\nAll links found:');
            allLinks.forEach((link, i) => {
                console.log(`${i + 1}. ${link.href}`);
            });
        }

        await browser.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();