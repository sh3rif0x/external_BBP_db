const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function toBool(v) {
    return v === '!0' || v === 'true';
}

async function scrapeBugBountyDirectory() {
    console.log('🔍 BugBountyDirectory Data Scraper\n');
    console.log('==================================\n');

    try {
        // Fetch the JS chunk that contains all program data
        const url = 'https://www.bugbountydirectory.com/_next/static/chunks/d62b1434f561f626.js';
        console.log(`📥 Fetching: ${url}\n`);

        const text = await fetchUrl(url);
        console.log(`✓ Downloaded ${text.length} bytes\n`);

        // Extract the data array from s=[{id:o(),...
        const start = text.indexOf(',s=[{id:o(),');
        if (start === -1) {
            console.log('❌ Could not find data array in JS chunk');
            console.log('The chunk structure might have changed. Trying alternative patterns...\n');

            // Try alternative pattern
            if (text.includes('company:')) {
                console.log('✓ Found "company:" in the file, attempting different extraction...');
            }
            return [];
        }

        const raw = text.substring(start + 4);
        console.log(`✓ Extracted data segment (${raw.length} chars)\n`);

        // Extract all fields using regex
        console.log('📊 Extracting fields...\n');

        const companies = [];
        const urls = [];
        const overviews = [];
        const bounties = [];
        const swags = [];
        const hofs = [];
        const tags_all = [];
        const dates = [];

        // Use regex to find all matches
        const companyMatches = raw.match(/company:"([^"]+)"/g) || [];
        companies.push(...companyMatches.map(m => m.match(/company:"([^"]+)"/)[1]));

        const urlMatches = raw.match(/url:"([^"]+)"/g) || [];
        urls.push(...urlMatches.map(m => m.match(/url:"([^"]+)"/)[1]));

        const overviewMatches = raw.match(/overview:"([^"]+)"/g) || [];
        overviews.push(...overviewMatches.map(m => m.match(/overview:"([^"]+)"/)[1]));

        const bountyMatches = raw.match(/bounty:(!0|!1|false|true)/g) || [];
        bounties.push(...bountyMatches.map(m => m.match(/bounty:(!0|!1|false|true)/)[1]));

        const swagMatches = raw.match(/swag:(!0|!1|false|true)/g) || [];
        swags.push(...swagMatches.map(m => m.match(/swag:(!0|!1|false|true)/)[1]));

        const hofMatches = raw.match(/hof:(!0|!1|false|true)/g) || [];
        hofs.push(...hofMatches.map(m => m.match(/hof:(!0|!1|false|true)/)[1]));

        const tagsMatches = raw.match(/tags:\[([^\]]*)\]/g) || [];
        tags_all.push(...tagsMatches.map(m => m.match(/tags:\[([^\]]*)\]/)[1]));

        const dateMatches = raw.match(/createdAt:"([^"]+)"/g) || [];
        dates.push(...dateMatches.map(m => m.match(/createdAt:"([^"]+)"/)[1]));

        console.log(`Found companies:  ${companies.length}`);
        console.log(`Found URLs:       ${urls.length}`);
        console.log(`Found overviews:  ${overviews.length}`);
        console.log(`Found bounties:   ${bounties.length}`);
        console.log(`Found swags:      ${swags.length}`);
        console.log(`Found HOF:        ${hofs.length}`);
        console.log(`Found tags:       ${tags_all.length}`);
        console.log(`Found dates:      ${dates.length}\n`);

        // Combine into programs
        const programs = [];
        const maxLen = Math.min(companies.length, urls.length);

        for (let i = 0; i < maxLen; i++) {
            const tagsStr = i < tags_all.length ? tags_all[i] : '';
            const tagMatches = tagsStr.match(/"([^"]+)"/g) || [];
            const tags = tagMatches.map(t => t.replace(/"/g, ''));

            programs.push({
                company: companies[i],
                url: urls[i],
                overview: overviews[i] || '',
                bounty: i < bounties.length ? toBool(bounties[i]) : false,
                swag: i < swags.length ? toBool(swags[i]) : false,
                hof: i < hofs.length ? toBool(hofs[i]) : false,
                tags: tags,
                createdAt: dates[i] || ''
            });
        }

        console.log(`✅ Parsed ${programs.length} programs\n`);
        console.log('Sample programs:');
        programs.slice(0, 5).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.company.padEnd(30)} | ${p.url}`);
        });

        return programs;

    } catch (err) {
        console.error('Error:', err.message);
        return [];
    }
}

async function main() {
    try {
        const programs = await scrapeBugBountyDirectory();

        if (programs.length === 0) {
            console.log('\n❌ No programs extracted');
            return;
        }

        console.log(`\n📊 Total: ${programs.length} programs\n`);

        // Load existing database
        let existing = [];
        if (fs.existsSync('./hunting_ons.json')) {
            existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        }

        const existingUrls = new Set(existing.map(p => typeof p === 'string' ? p : p.url));
        const newPrograms = programs.filter(p => !existingUrls.has(p.url));

        console.log(`New programs: ${newPrograms.length}/${programs.length}`);
        console.log(`Already in DB: ${programs.length - newPrograms.length}\n`);

        if (newPrograms.length > 0) {
            console.log('✅ Adding new programs:\n');
            newPrograms.slice(0, 10).forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.company.padEnd(30)} → ${p.url}`);
            });
            if (newPrograms.length > 10) {
                console.log(`  ... and ${newPrograms.length - 10} more`);
            }

            // Format for database
            const formatted = newPrograms.map(p => ({
                url: p.url,
                source: 'bugbountydirectory',
                addedDate: new Date().toISOString(),
                company: p.company,
                bounty: p.bounty,
                swag: p.swag,
                hof: p.hof,
                tags: p.tags
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

            // Save extracted programs as well
            fs.writeFileSync('./bugbounty_programs.json', JSON.stringify(programs, null, 2));
            console.log(`\n✅ Also saved: bugbounty_programs.json (${programs.length} total from source)`);
        } else {
            console.log('ℹ️  All programs already in database.');
        }

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exit(1);
    }
}

main();