#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CHAOS_FILE = 'chaos_selfhosted.json';
const HUNTING_FILE = 'hunting_ons.json';

function mergeChaosPrograms() {
    try {
        if (!fs.existsSync(HUNTING_FILE)) {
            console.error(`[✗] File not found: ${HUNTING_FILE}`);
            process.exit(1);
        }

        const huntingData = JSON.parse(fs.readFileSync(HUNTING_FILE, 'utf-8'));
        console.log(`[*] Loaded ${huntingData.length} programs from ${HUNTING_FILE}`);

        if (!fs.existsSync(CHAOS_FILE)) {
            console.error(`[✗] File not found: ${CHAOS_FILE}`);
            process.exit(1);
        }

        const chaosData = JSON.parse(fs.readFileSync(CHAOS_FILE, 'utf-8'));
        console.log(`[*] Loaded ${chaosData.length} self-hosted programs from ${CHAOS_FILE}`);

        const normalizedChaos = chaosData.map((program) => ({
            url: program.program_url,
            source: 'chaos-selfhosted',
            name: program.name,
            bounty: program.bounty,
            subdomains_count: program.subdomains_count,
            icon: program.icon,
            download_url: program.download_url,
            platform: program.platform,
            addedDate: new Date().toISOString(),
            tags: ['Chaos', 'Self-Hosted', 'Bug Bounty']
        }));

        const existingUrls = new Set(huntingData.map((p) => p.url));
        const newPrograms = normalizedChaos.filter((p) => !existingUrls.has(p.url));

        console.log(`[*] Found ${newPrograms.length} new programs to add`);

        const mergedData = [...huntingData, ...newPrograms];

        fs.writeFileSync(HUNTING_FILE, JSON.stringify(mergedData, null, 2));
        
        const publicPath = path.join('public', HUNTING_FILE);
        if (fs.existsSync('public')) {
            fs.copyFileSync(HUNTING_FILE, publicPath);
            console.log(`[✓] Also updated ${publicPath}`);
        }

        console.log(`[✓] Merged successfully!`);
        console.log(`[✓] Total programs: ${mergedData.length}`);
        console.log(`[*] New Chaos self-hosted programs added:`);
        newPrograms.slice(0, 10).forEach((p) => {
            console.log(`  - ${p.name} | ${p.url}`);
        });
        if (newPrograms.length > 10) {
            console.log(`  ... and ${newPrograms.length - 10} more`);
        }

    } catch (error) {
        console.error('[✗] Error:', error.message);
        process.exit(1);
    }
}

mergeChaosPrograms();
