#!/usr/bin/env node

/**
 * Fetch bug bounty programs from BugBountyHunt API
 * Saves to bugbountyhunt_programs.json
 */

const https = require('https');
const fs = require('fs');
const { URL } = require('url');

const OUTPUT_FILE = 'bugbountyhunt_programs.json';

function fetchFromApi(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
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

function extractDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return '';
    }
}

function getFaviconUrl(domain) {
    return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
}

async function fetchBugBountyHuntPrograms() {
    try {
        console.log('[*] Fetching programs from BugBountyHunt API...');

        const data = await fetchFromApi('https://bugbountyhunt.com/api/programs');
        const programs = data.programs || [];
        console.log(`[*] Retrieved ${programs.length} programs from API`);

        const result = [];

        for (const p of programs) {
            try {
                const policyUrl = p.policy_url || '';
                const domain = extractDomain(policyUrl);

                result.push({
                    name: p.program_name,
                    url: policyUrl,
                    email: p.contact_email,
                    bounty: p.offers_bounty === 'yes',
                    safe_harbor: p.safe_harbor,
                    icon: getFaviconUrl(domain)
                });
            } catch (err) {
                console.error(`[!] Error processing program: ${err.message}`);
            }
        }

        // Save to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

        console.log(`[✓] Total: ${result.length} programs saved`);
        console.log('\n[*] Sample programs:');
        result.slice(0, 5).forEach((p) => {
            console.log(`  ${p.name.padEnd(30)} | bounty:${p.bounty} | ${p.url}`);
        });

    } catch (error) {
        console.error(`[✗] Error: ${error.message}`);
        process.exit(1);
    }
}

fetchBugBountyHuntPrograms();