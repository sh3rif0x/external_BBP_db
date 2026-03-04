const https = require('https');
const fs = require('fs');

function fetchIssueHuntPage(page) {
    return new Promise((resolve, reject) => {
        const url = `https://api.issuehunt.io/programs?page=${page}&perPage=100`;

        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (err) {
                    resolve({ status: res.statusCode, data: null });
                }
            });
        }).on('error', reject);
    });
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function scrapeIssueHunt() {
    console.log('🐛 IssueHunt Programs Scraper\n');
    console.log('============================\n');

    const programs = [];
    let page = 1;
    let totalErrors = 0;

    while (true) {
        process.stdout.write(`[Page ${page}] Fetching... `);

        try {
            const { status, data } = await fetchIssueHuntPage(page);

            if (status !== 200 || !data) {
                console.log(`❌ Status ${status}`);
                break;
            }

            const results = data.data || [];

            if (!results || results.length === 0) {
                console.log('✓ No more results');
                break;
            }

            for (const p of results) {
                // Only include bug bounty programs, skip VDPs
                if (p.type !== 'bounty') {
                    continue;
                }

                const org = p.organization || {};
                const icon = org.icon;

                programs.push({
                    name: p.name,
                    slug: p.slug,
                    url: `https://issuehunt.io/programs/${p.slug}`,
                    icon: icon,
                    type: p.type,
                    visibility: p.visibility,
                    id: p.id,
                    source: 'issuehunt'
                });
            }

            console.log(`✓ ${results.length} programs | Total: ${programs.length}`);

            // Stop if less than 100 results
            if (results.length < 100) {
                console.log('✓ Reached last page');
                break;
            }

            page++;

            // Rate limit
            await sleep(500);

        } catch (err) {
            console.log(`❌ ${err.message}`);
            totalErrors++;
            if (totalErrors >= 3) break;
            await sleep(1000);
        }
    }

    // Save to file
    fs.writeFileSync('./issuehunt_programs.json', JSON.stringify(programs, null, 2));

    console.log(`\n✅ Total: ${programs.length} programs saved to issuehunt_programs.json`);

    // Merge into hunting_ons.json
    console.log('\n📝 Merging into hunting_ons.json...\n');

    const hunting = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
    const existingUrls = new Set(hunting.map(item => typeof item === 'string' ? item : item.url));

    let added = 0;
    for (const p of programs) {
        if (!existingUrls.has(p.url)) {
            hunting.push(p);
            added++;
        }
    }

    fs.writeFileSync('./hunting_ons.json', JSON.stringify(hunting, null, 2));
    fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(hunting, null, 2));

    console.log(`✅ Added ${added} new IssueHunt programs`);
    console.log(`📊 Total programs in database: ${hunting.length}`);
}

scrapeIssueHunt().catch(console.error);