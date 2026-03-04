#!/usr/bin/env node

/**
 * Fetch self-hosted Chaos programs that pay bounties
 * Fetches from Chaos index and filters for non-known-platform bounty programs
 */

const https = require('https');
const fs = require('fs');

const KNOWN_PLATFORMS = new Set([
    'hackerone',
    'bugcrowd',
    'intigriti',
    'yeswehack',
    'hackenproof',
    'issuehunt',
    'bugbountydirectory'
]);

function fetchFromApi(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        };

        https
            .get(url, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (err) {
                        reject(new Error(`JSON parse error: ${err.message}`));
                    }
                });
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

async function fetchChaosSelfhostedBounty() {
    try {
        console.log('[*] Fetching Chaos index from projectdiscovery.io...');

        const data = await fetchFromApi('https://chaos-data.projectdiscovery.io/index.json');
        console.log(`[*] Retrieved ${data.length} total programs from Chaos`);

        const selfHosted = [];

        for (const p of data) {
            const platform = (p.platform || '').toLowerCase().trim();
            const bounty = p.bounty === true;

            // Filter: not in known platforms AND has bounty
            if (!KNOWN_PLATFORMS.has(platform) && bounty) {
                selfHosted.push({
                    name: p.name,
                    program_url: p.program_url,
                    platform: platform,
                    bounty: bounty,
                    subdomains_count: p.count,
                    download_url: p.URL
                });
            }
        }

        // Confirm filter
        const filtered = selfHosted.filter(p => p.bounty === true);

        // Save to file
        fs.writeFileSync('chaos_selfhosted.json', JSON.stringify(filtered, null, 2));

        console.log(`[✓] Total bounty=True only: ${filtered.length}`);
        console.log('\n[*] Sample self-hosted bounty programs:');
        filtered.slice(0, 10).forEach((p) => {
            console.log(`  ${p.name.padEnd(30)} | ${p.program_url}`);
        });

    } catch (error) {
        console.error(`[✗] Error: ${error.message}`);
        process.exit(1);
    }
}

fetchChaosSelfhostedBounty();