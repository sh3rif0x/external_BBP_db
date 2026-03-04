const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

async function scrapeBugBountyDirectory() {
    console.log('🌐 Fetching bugbountydirectory.com...');

    const { body } = await fetchUrl('https://www.bugbountydirectory.com/');

    // Extract all URLs from the page
    const urlPattern = /https?:\/\/[^\s"<>)]+/gi;
    const allUrls = body.match(urlPattern) || [];

    // Filter for bug bounty related URLs
    const bugBountyUrls = [...new Set(allUrls.filter(url =>
        !url.includes('bugbountydirectory.com') &&
        !url.includes('cdn') &&
        !url.includes('google') &&
        !url.includes('jquery') &&
        !url.includes('analytics') &&
        !url.includes('fonts') &&
        url.length > 15
    ))];

    return bugBountyUrls;
}

async function scrapeProgramsPage() {
    console.log('📋 Scraping programs page...');

    const { body } = await fetchUrl('https://www.bugbountydirectory.com/programs');

    // Extract hrefs
    const hrefPattern = /href=["']([^"']*programs[^"']*)["']/gi;
    const programLinks = [];
    let match;

    while ((match = hrefPattern.exec(body)) !== null) {
        const link = match[1];
        if (link.startsWith('/')) {
            programLinks.push('https://www.bugbountydirectory.com' + link);
        } else if (link.startsWith('http')) {
            programLinks.push(link);
        }
    }

    // Also extract direct URLs
    const directionUrlPattern = /https?:\/\/[^\s"<>)]+/gi;
    const directUrls = body.match(directionUrlPattern) || [];

    return [...new Set([...programLinks, ...directUrls])];
}

async function main() {
    console.log('🚀 Advanced Bug Bounty Directory Scraper\n');

    try {
        // Load existing data
        let existingUrls = [];
        if (fs.existsSync('./hunting_ons.json')) {
            existingUrls = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        }
        console.log(`📊 Current programs: ${existingUrls.length}\n`);

        // Scrape main page
        console.log('Scraping main page...');
        const mainPageUrls = await scrapeBugBountyDirectory();
        console.log(`✓ Found ${mainPageUrls.length} URLs on main page`);

        // Scrape programs page
        console.log('Scraping programs page...');
        const programPageUrls = await scrapeProgramsPage();
        console.log(`✓ Found ${programPageUrls.length} URLs on programs page\n`);

        // Combine and deduplicate
        const allUrls = [...new Set([...existingUrls, ...mainPageUrls, ...programPageUrls])];

        // Filter out non-useful URLs
        const validUrls = allUrls.filter(url => {
            return url &&
                url.length > 15 &&
                !url.includes('bugbountydirectory.com') &&
                !url.includes('/cdn/') &&
                !url.includes('analytics') &&
                !url.includes('google.com/search') &&
                !url.includes('accounts.google') &&
                !url.includes('apis.google');
        });

        console.log(`📈 Statistics:`);
        console.log(`   Before: ${existingUrls.length} URLs`);
        console.log(`   After: ${validUrls.length} URLs`);
        console.log(`   Added: ${validUrls.length - existingUrls.length} new URLs\n`);

        // Save to both locations
        fs.writeFileSync('./hunting_ons.json', JSON.stringify(validUrls, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(validUrls, null, 0));

        console.log('✅ Data synchronized successfully!');
        console.log('📁 Files updated:');
        console.log('   - hunting_ons.json');
        console.log('   - public/hunting_ons.json');

    } catch (error) {
        console.error('❌ Scraping error:', error.message);
    }
}

main();