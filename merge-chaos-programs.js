#!/usr/bin/env node

/**
 * Merge Chaos Selfhosted programs into hunting_ons.json
 * Normalizes Chaos program data to match hunting_ons.json format
 */

const fs = require('fs');
const path = require('path');

const CHAOS_FILE = 'chaos_selfhosted.json';
const HUNTING_FILE = 'hunting_ons.json';

function normalizeChaosPrograms() {
    try {
        // Read hunting_ons.json
        if (!fs.existsSync(HUNTING_FILE)) {
            console.error(`[✗] File not found: ${HUNTING_FILE}`);
            process.exit(1);
        }

        const huntingData = JSON.parse(fs.readFileSync(HUNTING_FILE, 'utf-8'));
        console.log(`[*] Loaded ${huntingData.length} programs from ${HUNTING_FILE}`);

        // Read chaos programs
        if (!fs.existsSync(CHAOS_FILE)) {
            console.error(`[✗] File not found: ${CHAOS_FILE}`);
            process.exit(1);
        }

        const chaosData = JSON.parse(fs.readFileSync(CHAOS_FILE, 'utf-8'));
        console.log(`[*] Loaded ${chaosData.length} programs from ${CHAOS_FILE}`);

        // Convert Chaos programs to hunting_ons format
        const normalizedChaos = chaosData.map((program) => ({
            url: program.program_url,
            source: 'chaos',
            name: program.name,
            bounty: program.bounty,
            subdomains_count: program.subdomains_count,
            icon: program.icon,
            download_url: program.download_url,
            addedDate: new Date().toISOString(),
            tags: program.bounty ? ['Chaos', 'Bug Bounty'] : ['Chaos', 'VDP']
        }));

        // Remove duplicates based on URL
        const existingUrls = new Set(huntingData.map((p) => p.url));
        const newPrograms = normalizedChaos.filter((p) => !existingUrls.has(p.url));

        console.log(`[*] Found ${newPrograms.length} new programs to add`);

        // Merge
        const mergedData = [...huntingData, ...newPrograms];

        // Save to root
        fs.writeFileSync(HUNTING_FILE, JSON.stringify(mergedData, null, 2));

        // Also copy to public folder so React app can load it
        const publicPath = path.join('public', HUNTING_FILE);
        if (fs.existsSync('public')) {
            fs.copyFileSync(HUNTING_FILE, publicPath);
            console.log(`[✓] Also updated ${publicPath}`);
        }

        console.log(`[✓] Merged successfully!`);
        console.log(`[✓] Total programs: ${mergedData.length}`);
        console.log(`[*] New Chaos programs added:`);
        newPrograms.forEach((p) => {
            console.log(`  - ${p.name} (${p.bounty ? 'Bounty' : 'VDP'})`);
        });

    } catch (error) {
        console.error('[✗] Error:', error.message);
        process.exit(1);
    }
}

normalizeChaosPrograms();