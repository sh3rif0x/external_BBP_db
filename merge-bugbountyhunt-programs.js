#!/usr/bin/env node

/**
 * Merge BugBountyHunt programs into hunting_ons.json
 * Normalizes BugBountyHunt program data to match hunting_ons.json format
 */

const fs = require('fs');
const path = require('path');

const BUGBOUNTYHUNT_FILE = 'bugbountyhunt_programs.json';
const HUNTING_FILE = 'hunting_ons.json';

function mergeBugBountyHuntPrograms() {
    try {
        // Read hunting_ons.json
        if (!fs.existsSync(HUNTING_FILE)) {
            console.error(`[✗] File not found: ${HUNTING_FILE}`);
            process.exit(1);
        }

        const huntingData = JSON.parse(fs.readFileSync(HUNTING_FILE, 'utf-8'));
        console.log(`[*] Loaded ${huntingData.length} programs from ${HUNTING_FILE}`);

        // Read bugbountyhunt programs
        if (!fs.existsSync(BUGBOUNTYHUNT_FILE)) {
            console.error(`[✗] File not found: ${BUGBOUNTYHUNT_FILE}`);
            process.exit(1);
        }

        const bugbountyhuntData = JSON.parse(fs.readFileSync(BUGBOUNTYHUNT_FILE, 'utf-8'));
        console.log(`[*] Loaded ${bugbountyhuntData.length} programs from ${BUGBOUNTYHUNT_FILE}`);

        // Convert BugBountyHunt programs to hunting_ons format
        const normalizedBBH = bugbountyhuntData.map((program) => ({
            url: program.url,
            source: 'bugbountyhunt',
            name: program.name,
            contact_email: program.email,
            bounty: program.bounty,
            safe_harbor: program.safe_harbor,
            icon: program.icon,
            addedDate: new Date().toISOString(),
            tags: program.bounty ? ['BugBountyHunt', 'Bug Bounty'] : ['BugBountyHunt', 'VDP']
        }));

        // Remove duplicates based on URL
        const existingUrls = new Set(huntingData.map((p) => p.url));
        const newPrograms = normalizedBBH.filter((p) => !existingUrls.has(p.url));

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
        console.log(`[*] New BugBountyHunt programs added:`);
        newPrograms.forEach((p) => {
            console.log(`  - ${p.name} (${p.bounty ? 'Bounty' : 'VDP'}) | ${p.url}`);
        });

    } catch (error) {
        console.error('[✗] Error:', error.message);
        process.exit(1);
    }
}

mergeBugBountyHuntPrograms();