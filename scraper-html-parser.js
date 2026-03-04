const https = require('https');
const fs = require('fs');

async function fetchPage(url) {
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

async function scrapeFromHTML() {
    console.log('🔍 BugBountyDirectory HTML Parser\n');
    console.log('===================================\n');

    const allPrograms = new Set();

    for (let page = 1; page <= 5; page++) {
        const url = `https://www.bugbountydirectory.com/programs?page=${page}`;
        console.log(`📄 Page ${page}:`);

        const html = await fetchPage(url);

        if (html.length < 1000) {
            console.log('  ❌ Page too small, stopping\n');
            break;
        }

        // Strategy 1: Look for data attributes that might contain URLs
        const dataAttrMatch = html.match(/data-[^=]*="([^"]*https?:\/\/[^"]+)"/g) || [];
        console.log(`  Found ${dataAttrMatch.length} data attributes with URLs`);

        // Strategy 2: Look for href="https://..." in the HTML
        const hrefMatch = html.match(/href="(https?:\/\/[^"]+)"/g) || [];
        const hrefUrls = hrefMatch.map(m => m.match(/href="([^"]+)"/)[1]);
        console.log(`  Found ${hrefUrls.length} href attributes`);

        // Strategy 3: Look for JSON-LD structured data
        const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
        console.log(`  Found ${jsonMatch.length} JSON-LD blocks`);

        // Filter for real bug bounty programs
        const programs = hrefUrls.filter(url => {
            const lower = url.toLowerCase();
            return url.startsWith('http') &&
                !lower.includes('bugbountydirectory') &&
                !lower.includes('_next') &&
                !lower.includes('.css') &&
                !lower.includes('.js') &&
                !lower.includes('umami') &&
                !lower.includes('cloudflare') &&
                !lower.includes('google') &&
                !lower.includes('cdn') &&
                url.length > 20;
        });

        console.log(`  After filtering: ${programs.length} real programs\n`);

        // If no programs found, show diagnostic info
        if (programs.length === 0) {
            console.log('  🔎 Diagnosis: No legitimate URLs found');
            console.log(`     HTML size: ${html.length} bytes`);
            console.log(`     Contains "http": ${html.includes('http')}`);
            console.log(`     Contains "program": ${html.includes('program')}`);

            // Show sample of what URLs are in the page
            const sampleUrls = hrefUrls.slice(0, 5);
            console.log('     Sample URLs found:');
            sampleUrls.forEach(u => console.log(`       - ${u.substring(0, 60)}...`));
            console.log('');
            break;
        }

        programs.forEach(p => allPrograms.add(p));
    }

    return Array.from(allPrograms);
}

async function main() {
    try {
        const programs = await scrapeFromHTML();

        console.log('📊 Results:\n');
        console.log(`Total programs found: ${programs.length}\n`);

        if (programs.length === 0) {
            console.log('❌ No programs found this way.\n');
            console.log('📌 Issue identified:');
            console.log('   bugbountydirectory.com is fully JavaScript-rendered.');
            console.log('   The actual program URLs are only visible in the browser.\n');
            console.log('💡 Solutions:\n');
            console.log('1. The website is already running at http://localhost:3000');
            console.log('   It has 804 programs from other sources (intigriti, yeswehack, etc).\n');
            console.log('2. If you want to ADD specific programs manually:');
            console.log('   - Visit bugbountydirectory.com/programs in a browser');
            console.log('   - Copy the program URLs you want');
            console.log('   - Send them to me and I\'ll add them\n');
            console.log('3. Or provide more details about which/how many');
            console.log('   bugbountydirectory programs you want added.');
        } else {
            console.log('Programs found:');
            programs.slice(0, 20).forEach((p, i) => console.log(`${i+1}. ${p}`));
            if (programs.length > 20) console.log(`... and ${programs.length - 20} more`);

            // Check database
            let existing = [];
            if (fs.existsSync('./hunting_ons.json')) {
                existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
            }

            const existingUrls = new Set(existing.map(p => typeof p === 'string' ? p : p.url));
            const newUrls = programs.filter(url => !existingUrls.has(url));

            console.log(`\n✅ NEW programs: ${newUrls.length}`);
            console.log(`   Already in DB: ${programs.length - newUrls.length}`);

            if (newUrls.length > 0) {
                const newPrograms = newUrls.map(url => ({
                    url,
                    source: 'bugbountydirectory',
                    addedDate: new Date().toISOString()
                }));

                const merged = [...existing, ...newPrograms];
                fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
                fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));
                console.log(`\n✅ Database updated: ${merged.length} total`);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();