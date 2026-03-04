const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', () => resolve(''));
    });
}

async function scrapePage11() {
    console.log('🔍 BugBountyDirectory Page 11 Scraper\n');
    console.log('=====================================\n');

    const url = 'https://www.bugbountydirectory.com/programs?page=11';
    console.log(`📄 Fetching: ${url}\n`);

    const html = await fetchUrl(url);
    console.log(`Page size: ${html.length} bytes\n`);

    // Extract program links in format: /programs/xxx
    const programLinks = [];
    const regex = /href="(\/programs\/[^"]+)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        programLinks.push(match[1]);
    }

    console.log(`📊 Found ${programLinks.length} program links:\n`);
    programLinks.slice(0, 15).forEach((link, i) => {
        const programName = link.replace('/programs/', '');
        console.log(`${i + 1}. ${programName}`);
    });

    if (programLinks.length > 15) {
        console.log(`... and ${programLinks.length - 15} more`);
    }

    return programLinks;
}

async function main() {
    try {
        const links = await scrapePage11();
        console.log(`\n✅ Ready to extract URLs from ${links.length} program pages`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();