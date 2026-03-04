#!/usr/bin/env node

/**
 * Filter Chaos Selfhosted programs - Extract bounty-only programs
 * Creates a new JSON file with only programs that offer bounties
 */

const fs = require('fs');

const INPUT_FILE = 'chaos_selfhosted.json';
const OUTPUT_FILE = 'chaos_bounty_only.json';

async function filterBountyPrograms() {
    try {
        // Read all programs
        if (!fs.existsSync(INPUT_FILE)) {
            console.error(`[✗] File not found: ${INPUT_FILE}`);
            process.exit(1);
        }

        const allPrograms = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
        console.log(`[*] Loaded ${allPrograms.length} total programs`);

        // Filter for bounty-only programs
        const bountyPrograms = allPrograms.filter((p) => p.bounty === true);

        console.log(`[✓] Found ${bountyPrograms.length} bounty programs`);

        // Save filtered programs
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bountyPrograms, null, 2));
        console.log(`[✓] Saved to ${OUTPUT_FILE}`);

        console.log('\n[*] Bounty programs:');
        bountyPrograms.forEach((p) => {
            console.log(`  - ${p.name} (${p.subdomains_count} subdomains)`);
        });

    } catch (error) {
        console.error('[✗] Error:', error.message);
        process.exit(1);
    }
}

filterBountyPrograms();