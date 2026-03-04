const https = require('https');
const fs = require('fs');

// Function to fetch bugbountydirectory.com and extract programs
async function scrapeBugBountyDirectory() {
    return new Promise((resolve) => {
        // API endpoint for bugbountydirectory.com programs
        const options = {
            hostname: 'www.bugbountydirectory.com',
            path: '/programs',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        let htmlData = '';

        const req = https.request(options, (res) => {
            res.on('data', (chunk) => {
                htmlData += chunk;
            });

            res.on('end', () => {
                try {
                    // Extract program URLs from HTML
                    const urlRegex = /href="([^"]*\/programs\/[^"]*[^/])"/gi;
                    const matches = [];
                    let match;

                    while ((match = urlRegex.exec(htmlData)) !== null) {
                        const url = match[1];
                        if (!matches.includes(url) && !url.includes('#')) {
                            matches.push(url);
                        }
                    }

                    // Also try to find direct URLs in the page
                    const directUrlRegex = /https:\/\/[^\s"<>]+/gi;
                    const directMatches = htmlData.match(directUrlRegex) || [];
                    const filteredDirect = directMatches
                        .filter(url => url.includes('bugbounty') || url.includes('security') || url.includes('bounty'))
                        .slice(0, 100);

                    const allUrls = [...new Set([...matches, ...filteredDirect])];
                    resolve(allUrls.filter(url => url.length > 10));
                } catch (e) {
                    console.error('Error parsing:', e.message);
                    resolve([]);
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e.message);
            resolve([]);
        });

        req.end();
    });
}

// Alternative: Use a direct approach with API or known structure
async function scrapeProgramsAlternative() {
    return new Promise((resolve) => {
        const urls = [
            'https://www.bugbountydirectory.com/programs/setu',
            'https://www.bugbountydirectory.com/programs/zerodha',
            'https://www.bugbountydirectory.com/programs/quickreel'
        ];

        // Make requests to get more data
        const programs = [];
        let completed = 0;

        urls.forEach(url => {
            const options = new URL(url);
            const protocol = options.protocol === 'https:' ? https : require('http');

            const req = protocol.request(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        programs.push(url);
                    }
                    completed++;
                    if (completed === urls.length) {
                        resolve(programs);
                    }
                });
            });

            req.on('error', () => {
                completed++;
                if (completed === urls.length) {
                    resolve(programs);
                }
            });

            req.end();
        });
    });
}

// Main scraping function
async function main() {
    console.log('🔍 Scraping bugbountydirectory.com...');

    try {
        // Load existing URLs
        const existingData = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        console.log(`📊 Existing programs: ${existingData.length}`);

        // Scrape new programs
        const newPrograms = await scrapeBugBountyDirectory();
        console.log(`🆕 New programs found: ${newPrograms.length}`);

        // Merge and deduplicate
        const allPrograms = [...new Set([...existingData, ...newPrograms])];
        console.log(`✅ Total unique programs: ${allPrograms.length}`);

        // Save to file
        fs.writeFileSync('./hunting_ons.json', JSON.stringify(allPrograms, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(allPrograms, null, 0));

        console.log('💾 Data saved successfully!');
        console.log(`Added ${allPrograms.length - existingData.length} new programs`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();