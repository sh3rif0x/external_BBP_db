#!/usr/bin/env node

/**
 * Fetch and update icons for Chaos Selfhosted programs
 * Adds Google favicon icons to all programs in chaos_selfhosted.json
 */

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

const PROGRAM_FILE = 'chaos_selfhosted.json';

function extractDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return '';
    }
}

function getFaviconUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

async function updateChaosIcons() {
    try {
        // Read programs
        if (!fs.existsSync(PROGRAM_FILE)) {
            console.error(`[✗] File not found: ${PROGRAM_FILE}`);
            process.exit(1);
        }

        const programs = JSON.parse(fs.readFileSync(PROGRAM_FILE, 'utf-8'));
        console.log(`[*] Loaded ${programs.length} programs from ${PROGRAM_FILE}`);

        let updated = 0;

        // Add icons to each program
        for (const program of programs) {
            if (program.program_url) {
                const domain = extractDomain(program.program_url);
                if (domain) {
                    program.icon = getFaviconUrl(domain);
                    updated++;
                }
            }
        }

        // Save updated programs
        fs.writeFileSync(PROGRAM_FILE, JSON.stringify(programs, null, 2));

        console.log(`[✓] Icons added to ${updated} programs`);
        console.log('\n[*] Sample programs:');
        programs.slice(0, 5).forEach((p) => {
            console.log(`  ${p.name.padEnd(30)} | ${p.icon}`);
        });

    } catch (error) {
        console.error('[✗] Error:', error.message);
        process.exit(1);
    }
}

updateChaosIcons();