#!/usr/bin/env node

/**
 * Create a consolidated file with ONLY programs that pay bounties
 * Combines bounty programs from all sources: Chaos, BugBountyHunt, HackerOne, Bugcrowd, etc.
 */

const fs = require('fs');

const HUNTING_FILE = 'hunting_ons.json';
const OUTPUT_FILE = 'bounty_only_all.json';
const PUBLIC_OUTPUT_FILE = 'public/bounty_only_all.json';

function createBountyOnlyDatabase() {
    try {
        // Read hunting_ons.json
        if (!fs.existsSync(HUNTING_FILE)) {
            console.error(`[✗] File not found: ${HUNTING_FILE}`);
            process.exit(1);
        }

        const allPrograms = JSON.parse(fs.readFileSync(HUNTING_FILE, 'utf-8'));
        console.log(`[*] Loaded ${allPrograms.length} total programs`);

        // Filter for ONLY bounty programs
        const bountyPrograms = allPrograms.filter((p) => p.bounty === true);

        console.log(`[✓] Found ${bountyPrograms.length} programs paying bounties`);

        // Save to root
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bountyPrograms, null, 2));
        console.log(`[✓] Saved to ${OUTPUT_FILE}`);

        // Also save to public folder
        if (fs.existsSync('public')) {
            fs.copyFileSync(OUTPUT_FILE, PUBLIC_OUTPUT_FILE);
            console.log(`[✓] Also saved to ${PUBLIC_OUTPUT_FILE}`);
        }

        // Show breakdown by source
        const bySource = {};
        bountyPrograms.forEach((p) => {
            const source = p.source || 'other';
            bySource[source] = (bySource[source] || 0) + 1;
        });

        console.log('\n[*] Bounty Programs by Source:');
        Object.entries(bySource)
            .sort((a, b) => b[1] - a[1])
            .forEach(([source, count]) => {
                const icons = {
                    'hackerone': '🔴',
                    'bugcrowd': '🎯',
                    'chaos': '🔗',
                    'bugbountyhunt': '🎱',
                    'yeswehack': '✨',
                    'issuehunt': '🎪',
                    'intigriti': '✓',
                    'bugbountydirectory': '📋',
                    'immunefi': '🛡️',
                    'other': '📎'
                };
                const icon = icons[source] || '•';
                console.log(`  ${icon} ${source.padEnd(20)} | ${count} programs`);
            });

        console.log('\n[*] Sample bounty programs:');
        bountyPrograms.slice(0, 5).forEach((p) => {
            const name = p.name || p.url.split('/')[2];
            console.log(`  - ${name} | ${p.source || 'other'}`);
        });

    } catch (error) {
        console.error('[✗] Error:', error.message);
        process.exit(1);
    }
}

createBountyOnlyDatabase();