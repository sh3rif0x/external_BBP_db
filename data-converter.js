const fs = require('fs');
const https = require('https');

const SOURCES = {
    BUGBOUNTYDIRECTORY: 'bugbountydirectory',
    BUGCROWD: 'bugcrowd',
    HACKERONE: 'hackerone',
    INTIGRITI: 'intigriti',
    YESWEHACK: 'yeswehack',
    IMMUNEFI: 'immunefi',
    OTHER: 'other'
};

// Convert old format to new format with source tracking
function convertOldData(oldUrls) {
    return oldUrls.map(url => ({
        url,
        source: 'other',
        addedDate: new Date().toISOString()
    }));
}

// Fetch and parse bugbountydirectory programs
async function fetchUrl(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

async function scrapeBugBountyDirectoryPrograms() {
    console.log('📋 Scraping bugbountydirectory.com programs...');

    const { body } = await fetchUrl('https://www.bugbountydirectory.com/programs');

    // Extract all URLs from the page
    const urlPattern = /https?:\/\/[^\s"<>)]+/gi;
    const allUrls = body.match(urlPattern) || [];

    // Filter for actual program URLs
    const programUrls = [...new Set(allUrls.filter(url =>
        !url.includes('bugbountydirectory.com') &&
        !url.includes('cdn') &&
        !url.includes('google') &&
        !url.includes('analytics') &&
        !url.includes('facebook') &&
        url.length > 15
    ))];

    return programUrls.map(url => ({
        url,
        source: SOURCES.BUGBOUNTYDIRECTORY,
        addedDate: new Date().toISOString()
    }));
}

// Main migration function
async function main() {
    console.log('🔄 Converting to new data format with source tracking\n');

    try {
        // Load old data
        let oldUrls = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        console.log(`📊 Old format: ${oldUrls.length} URLs (simple strings)`);

        // Convert to new format
        let newData = convertOldData(oldUrls);
        console.log(`✓ Converted to new format with metadata`);

        // Scrape bugbountydirectory
        console.log(`\nScraping bugbountydirectory.com...`);
        const bbd_programs = await scrapeBugBountyDirectoryPrograms();
        console.log(`✓ Found ${bbd_programs.length} programs from bugbountydirectory.com`);

        // Mark existing bugbountydirectory URLs
        newData = newData.map(item => {
            // Check if URL is known to be from bugbountydirectory
            if (item.url.includes('bugbountydirectory.com') ||
                bbd_programs.some(p => p.url === item.url)) {
                return {...item, source: SOURCES.BUGBOUNTYDIRECTORY };
            }
            return item;
        });

        // Add new bugbountydirectory programs
        const existingUrls = new Set(newData.map(p => p.url));
        const newPrograms = bbd_programs.filter(p => !existingUrls.has(p.url));
        newData = [...newData, ...newPrograms];

        console.log(`\n📈 Statistics:`);
        console.log(`   Total programs: ${newData.length}`);
        console.log(`   From bugbountydirectory: ${newData.filter(p => p.source === SOURCES.BUGBOUNTYDIRECTORY).length}`);
        console.log(`   New from bugbountydirectory: ${newPrograms.length}`);
        console.log(`   Other sources: ${newData.filter(p => p.source !== SOURCES.BUGBOUNTYDIRECTORY).length}`);

        // Save new format
        fs.writeFileSync('./hunting_ons.json', JSON.stringify(newData, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(newData, null, 0));

        console.log('\n✅ Data converted and saved!');
        console.log('📁 Files updated with source tracking');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();