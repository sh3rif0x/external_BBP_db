const https = require('https');
const fs = require('fs');

const SOURCES = {
    BUGBOUNTYDIRECTORY: 'bugbountydirectory',
    BUGCROWD: 'bugcrowd',
    HACKERONE: 'hackerone',
    INTIGRITI: 'intigriti',
    YESWEHACK: 'yeswehack',
    IMMUNEFI: 'immunefi',
    OTHER: 'other'
};

async function fetchUrl(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 8000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

// Bugcrowd programs
async function scrapeBugcrowd() {
    console.log('🔍 Scraping Bugcrowd...');
    try {
        const { body } = await fetchUrl('https://bugcrowd.com/bug-bounty-list');
        const urlPattern = /https?:\/\/[^\s"<>)]+/gi;
        const allUrls = body.match(urlPattern) || [];

        const filtered = [...new Set(allUrls.filter(url =>
            !url.includes('bugcrowd.com/cdn') &&
            !url.includes('analytics') &&
            !url.includes('google') &&
            url.length > 15
        ))].slice(0, 50);

        return filtered.map(url => ({
            url,
            source: SOURCES.BUGCROWD,
            addedDate: new Date().toISOString()
        }));
    } catch (e) {
        console.log('  ✗ Failed to scrape Bugcrowd');
        return [];
    }
}

// HackerOne programs
async function scrapeHackerOne() {
    console.log('🔍 Scraping HackerOne...');
    try {
        const { body } = await fetchUrl('https://hackerone.com/bug-bounty-programs');
        const urlPattern = /https:\/\/hackerone\.com\/[\w-]+/gi;
        const urls = body.match(urlPattern) || [];

        return [...new Set(urls)].slice(0, 50).map(url => ({
            url,
            source: SOURCES.HACKERONE,
            addedDate: new Date().toISOString()
        }));
    } catch (e) {
        console.log('  ✗ Failed to scrape HackerOne');
        return [];
    }
}

// Intigriti programs
async function scrapeIntigriti() {
    console.log('🔍 Scraping Intigriti...');
    try {
        const { body } = await fetchUrl('https://app.intigriti.com/programs');
        const urlPattern = /https?:\/\/[^\s"<>)]+/gi;
        const allUrls = body.match(urlPattern) || [];

        const filtered = [...new Set(allUrls.filter(url =>
            !url.includes('intigriti.com/cdn') &&
            !url.includes('analytics') &&
            url.length > 15
        ))].slice(0, 50);

        return filtered.map(url => ({
            url,
            source: SOURCES.INTIGRITI,
            addedDate: new Date().toISOString()
        }));
    } catch (e) {
        console.log('  ✗ Failed to scrape Intigriti');
        return [];
    }
}

// Immunefi programs (DeFi focused)
async function scrapeImmunefi() {
    console.log('🔍 Scraping Immunefi (DeFi)...');
    try {
        const { body } = await fetchUrl('https://immunefi.com/bug-bounty');
        const urlPattern = /https?:\/\/[^\s"<>)]+/gi;
        const allUrls = body.match(urlPattern) || [];

        const filtered = [...new Set(allUrls.filter(url =>
            !url.includes('immunefi.com/cdn') &&
            !url.includes('analytics') &&
            !url.includes('google') &&
            url.length > 15
        ))].slice(0, 50);

        return filtered.map(url => ({
            url,
            source: SOURCES.IMMUNEFI,
            addedDate: new Date().toISOString()
        }));
    } catch (e) {
        console.log('  ✗ Failed to scrape Immunefi');
        return [];
    }
}

// Yes We Hack programs
async function scrapeYesWeHack() {
    console.log('🔍 Scraping Yes We Hack...');
    try {
        const { body } = await fetchUrl('https://yeswehack.com/programs');
        const urlPattern = /https?:\/\/[^\s"<>)]+/gi;
        const allUrls = body.match(urlPattern) || [];

        const filtered = [...new Set(allUrls.filter(url =>
            !url.includes('yeswehack.com/cdn') &&
            !url.includes('analytics') &&
            url.length > 15
        ))].slice(0, 50);

        return filtered.map(url => ({
            url,
            source: SOURCES.YESWEHACK,
            addedDate: new Date().toISOString()
        }));
    } catch (e) {
        console.log('  ✗ Failed to scrape Yes We Hack');
        return [];
    }
}

async function main() {
    console.log('🌐 Multi-Platform Bug Bounty Scraper\n');

    try {
        // Load existing data
        let existingData = [];
        if (fs.existsSync('./hunting_ons.json')) {
            existingData = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        }

        const existingUrls = new Set(existingData.map(p => p.url || p));
        console.log(`📊 Starting with ${existingData.length} programs\n`);

        // Scrape all platforms
        console.log('🚀 Starting scrapes (this may take a minute)...\n');

        const bugcrowd = await scrapeBugcrowd();
        const hackerone = await scrapeHackerOne();
        const intigriti = await scrapeIntigriti();
        const immunefi = await scrapeImmunefi();
        const yeswehack = await scrapeYesWeHack();

        // Combine all
        const allSources = [bugcrowd, hackerone, intigriti, immunefi, yeswehack];
        let newPrograms = [];

        allSources.forEach(source => {
            source.forEach(program => {
                if (!existingUrls.has(program.url)) {
                    newPrograms.push(program);
                    existingUrls.add(program.url);
                }
            });
        });

        console.log(`\n📈 Scraping Results:`);
        console.log(`   Bugcrowd:           +${bugcrowd.length}`);
        console.log(`   HackerOne:          +${hackerone.length}`);
        console.log(`   Intigriti:          +${intigriti.length}`);
        console.log(`   Immunefi:           +${immunefi.length}`);
        console.log(`   Yes We Hack:        +${yeswehack.length}`);
        console.log(`   Total new:          +${newPrograms.length}`);

        // Merge and save
        const mergedData = [...existingData, ...newPrograms];

        fs.writeFileSync('./hunting_ons.json', JSON.stringify(mergedData, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(mergedData, null, 0));

        // Statistics
        const stats = {};
        mergedData.forEach(p => {
            const source = p.source || 'other';
            stats[source] = (stats[source] || 0) + 1;
        });

        console.log(`\n✅ Complete! Database updated.`);
        console.log(`\n📊 Final Statistics:`);
        console.log(`   Total programs: ${mergedData.length}`);
        console.log(`   Programs by source:`);
        Object.entries(stats).forEach(([source, count]) => {
            console.log(`     - ${source.padEnd(20)}: ${count}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();