const https = require('https');
const fs = require('fs');

const USERNAME = 'sh3rif0x';
const API_TOKEN = 'b/Xslk7xWmFcp4HJoH1j+4MusYzoZ9JRYgRAnOJkAUA=';

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${USERNAME}:${API_TOKEN}`).toString('base64');

        https.get(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (err) {
                    resolve({ status: res.statusCode, data: null });
                }
            });
        }).on('error', reject);
    });
}

async function scrapeHackerOne() {
    console.log('🔓 HackerOne Programs Scraper\n');
    console.log('=============================\n');

    const programs = [];
    let page = 1;
    let totalFetched = 0;
    let keepGoing = true;

    while (keepGoing) {
        const url = `https://api.hackerone.com/v1/hackers/programs?page[number]=${page}&page[size]=100`;
        console.log(`📄 Page ${page}: Fetching...`);

        try {
            const { status, data } = await fetchUrl(url);

            if (status !== 200) {
                console.log(`❌ Error ${status}`);
                if (data && data.errors) {
                    console.log(`   ${data.errors[0]?.detail || 'Unknown error'}\n`);
                }
                break;
            }

            const results = data.data || [];

            if (results.length === 0) {
                console.log(`✓ No more programs\n`);
                keepGoing = false;
                break;
            }

            // Extract program data
            results.forEach(p => {
                const attr = p.attributes || {};
                programs.push({
                    name: attr.name,
                    handle: attr.handle,
                    url: `https://hackerone.com/${attr.handle}`,
                    bounty: attr.offers_bounties,
                    private: attr.state === 'soft_launched',
                    min_bounty: attr.min_bounty_table_value,
                    max_bounty: attr.max_bounty_table_value,
                    launched_at: attr.launched_at,
                    submission_state: attr.submission_state
                });
            });

            totalFetched += results.length;
            console.log(`✓ Found ${results.length} programs | Total: ${totalFetched}\n`);

            // Check for next page
            const links = data.links || {};
            if (!links.next) {
                keepGoing = false;
            } else {
                page++;
            }

            // Rate limiting
            await new Promise(r => setTimeout(r, 500));

        } catch (err) {
            console.log(`❌ Error: ${err.message}\n`);
            keepGoing = false;
        }
    }

    console.log(`\n📊 Total programs fetched: ${programs.length}\n`);

    // Filter for bounty programs
    const bountyPrograms = programs.filter(p => p.bounty === true);
    console.log(`💰 Programs with bounties: ${bountyPrograms.length}`);
    console.log(`   Without bounties: ${programs.length - bountyPrograms.length}\n`);

    // Show sample
    console.log('Sample H1 bounty programs:\n');
    bountyPrograms.slice(0, 10).forEach((p, i) => {
        const bountyRange = p.min_bounty && p.max_bounty ?
            `$${p.min_bounty} - $${p.max_bounty}` :
            'N/A';
        console.log(`  ${i + 1}. ${p.name.padEnd(30)} | ${bountyRange}`);
        console.log(`     ${p.url}`);
    });

    if (bountyPrograms.length > 10) {
        console.log(`\n  ... and ${bountyPrograms.length - 10} more`);
    }

    // Save full results
    fs.writeFileSync('./h1_programs.json', JSON.stringify(programs, null, 2));
    console.log(`\n✅ Saved: h1_programs.json (${programs.length} total)`);

    // Save bounty-only results
    fs.writeFileSync('./h1_bounty_programs.json', JSON.stringify(bountyPrograms, null, 2));
    console.log(`✅ Saved: h1_bounty_programs.json (${bountyPrograms.length} bounty programs)`);

    return bountyPrograms;
}

async function main() {
    try {
        const bountyPrograms = await scrapeHackerOne();

        // Load existing database
        let existing = [];
        if (fs.existsSync('./hunting_ons.json')) {
            existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        }

        const existingUrls = new Set(existing.map(p => typeof p === 'string' ? p : p.url));
        const newPrograms = bountyPrograms.filter(p => !existingUrls.has(p.url));

        console.log(`\n📊 Database integration:\n`);
        console.log(`New programs: ${newPrograms.length}/${bountyPrograms.length}`);
        console.log(`Already in DB: ${bountyPrograms.length - newPrograms.length}\n`);

        if (newPrograms.length > 0) {
            console.log('✅ Adding new programs:\n');
            newPrograms.slice(0, 10).forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.name.padEnd(30)} → ${p.url}`);
            });
            if (newPrograms.length > 10) {
                console.log(`  ... and ${newPrograms.length - 10} more`);
            }

            // Format for database
            const formatted = newPrograms.map(p => ({
                url: p.url,
                source: 'hackerone',
                addedDate: new Date().toISOString(),
                name: p.name,
                handle: p.handle,
                bounty: p.bounty,
                private: p.private,
                min_bounty: p.min_bounty,
                max_bounty: p.max_bounty
            }));

            const merged = [...existing, ...formatted];
            fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
            fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));

            // Statistics
            const stats = {};
            merged.forEach(p => {
                const s = typeof p === 'string' ? 'other' : (p.source || 'other');
                stats[s] = (stats[s] || 0) + 1;
            });

            console.log(`\n✅ Database updated: ${merged.length} total programs\n`);
            console.log('📊 Source breakdown:');
            Object.entries(stats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([source, count]) => {
                    console.log(`   ${source.padEnd(22)}: ${count}`);
                });
        } else {
            console.log('ℹ️  All HackerOne programs already in database.');
        }

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exit(1);
    }
}

main();