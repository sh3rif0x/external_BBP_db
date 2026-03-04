const https = require('https');
const fs = require('fs');

function fetchYesWeHackPage(page) {
    return new Promise((resolve, reject) => {
        const url = `https://api.yeswehack.com/programs?page=${page}`;

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

async function scrapeYesWeHack() {
    console.log('🐝 YesWeHack Programs Scraper\n');
    console.log('=============================\n');

    const programs = [];
    let page = 1;
    let totalErrors = 0;
    let nbPages = 1;

    while (page <= nbPages) {
        process.stdout.write(`[Page ${page}/${nbPages}] Fetching... `);

        try {
            const { status, data } = await fetchYesWeHackPage(page);

            if (status !== 200 || !data) {
                console.log(`❌ Status ${status}`);
                break;
            }

            const results = data.items || [];
            const pagination = data.pagination || {};
            nbPages = pagination.nb_pages || 1;

            if (!results || results.length === 0) {
                console.log('✓ No more results');
                break;
            }

            for (const p of results) {
                const thumbnail = p.thumbnail || {};
                const icon = thumbnail.url;

                programs.push({
                    name: p.title,
                    slug: p.slug,
                    url: `https://yeswehack.com/programs/${p.slug}`,
                    icon: icon,
                    type: p.type,
                    bounty: p.type === 'bug-bounty',
                    status: p.status,
                    country: p.country,
                    source: 'yeswehack'
                });
            }

            console.log(`✓ ${results.length} programs | Total: ${programs.length}`);
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
    fs.writeFileSync('./yeswehack_programs.json', JSON.stringify(programs, null, 2));

    console.log(`\n✅ Total: ${programs.length} programs saved to yeswehack_programs.json`);

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

    console.log(`✅ Added ${added} new YesWeHack programs`);
    console.log(`📊 Total programs in database: ${hunting.length}`);
}

scrapeYesWeHack().catch(console.error);