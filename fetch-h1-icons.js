const https = require('https');
const fs = require('fs');

function fetchH1ProfilePage(handle) {
    return new Promise((resolve, reject) => {
        const url = `https://hackerone.com/${handle}`;

        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    // Extract profile photo URLs using regex
                    const regex = /https:\/\/profile-photos\.hackerone-user-content\.com\/[^\s"']+/g;
                    const icons = data.match(regex) || [];
                    const unique = [...new Set(icons)];
                    resolve({ status: res.statusCode, icon: unique[0] || null });
                } catch (err) {
                    resolve({ status: res.statusCode, icon: null });
                }
            });
        }).on('error', reject);
    });
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function fetchProgramIcons() {
    console.log('🔓 HackerOne Program Icons Fetcher\n');
    console.log('===================================\n');

    // Load programs
    if (!fs.existsSync('./h1_bounty_programs.json')) {
        console.log('❌ h1_bounty_programs.json not found\n');
        return;
    }

    const programs = JSON.parse(fs.readFileSync('./h1_bounty_programs.json', 'utf8'));
    console.log(`📊 Loading ${programs.length} programs\n`);
    console.log('🌐 Fetching program icons by scraping HackerOne profiles...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < programs.length; i++) {
        const p = programs[i];
        const handle = p.handle;

        process.stdout.write(`[${i + 1}/${programs.length}] ${handle.padEnd(30)}: `);

        try {
            const { status, icon } = await fetchH1ProfilePage(handle);

            if (status === 200 && icon) {
                p.icon = icon;
                console.log(`✓ ${icon.substring(0, 50)}...`);
                successCount++;
            } else {
                p.icon = null;
                console.log(`⚠️  No icon found (status ${status})`);
                errorCount++;
            }
        } catch (err) {
            p.icon = null;
            console.log(`❌ ${err.message}`);
            errorCount++;
        }

        // Rate limit
        await sleep(300);
    }

    // Save updated programs
    fs.writeFileSync('./h1_bounty_programs.json', JSON.stringify(programs, null, 2));
    console.log(`\n✅ Done! Icons added to h1_bounty_programs.json`);
    console.log(`\n📊 Results:`);
    console.log(`   ✓ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    // Show sample
    console.log('\nSample programs with icons:\n');
    programs.filter(p => p.icon).slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name.padEnd(30)}`);
        console.log(`     Icon: ${p.icon}`);
    });

    return programs;
}

async function main() {
    try {
        const programs = await fetchProgramIcons();

        if (!programs) return;

        // Update database with icons
        let existing = [];
        if (fs.existsSync('./hunting_ons.json')) {
            existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
        }

        // Update HackerOne entries with icon data
        const updated = existing.map(p => {
            if (typeof p === 'string') return p;
            if (p.source !== 'hackerone') return p;

            // Find matching program and add icon
            const match = programs.find(hp => hp.url === p.url);
            if (match && match.icon) {
                p.icon = match.icon;
            }
            return p;
        });

        fs.writeFileSync('./hunting_ons.json', JSON.stringify(updated, null, 0));
        fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(updated, null, 0));

        console.log('\n✅ Database updated with HackerOne program icons\n');
    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exit(1);
    }
}

main();