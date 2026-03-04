const fs = require('fs');

// Load disclose data
const discloseData = JSON.parse(fs.readFileSync('disclose_programs.json', 'utf8'));

// Define managed platforms to exclude
const managedPlatforms = ['bugcrowd', 'hackerone', 'hacker.one', 'intigriti', 'yeswehack', 'synack', 'cobalt'];

// Filter: only keep self-hosted programs (no known platforms)
const selfHosted = discloseData.filter(p => {
    const url = (p.url || '').toLowerCase();
    return !managedPlatforms.some(platform => url.includes(platform));
});

console.log(`[*] Disclose total bounty programs: ${discloseData.length}`);
console.log(`[*] Managed (platform-hosted): ${discloseData.length - selfHosted.length}`);
console.log(`[✓] Self-hosted to add: ${selfHosted.length}`);

// Load existing database
const existing = JSON.parse(fs.readFileSync('hunting_ons.json', 'utf8'));
const existingUrls = new Set(existing.map(p => p.url));

// Filter: only add if URL doesn't exist
const toAdd = selfHosted.filter(p => !existingUrls.has(p.url));

console.log(`[*] Already in database: ${selfHosted.length - toAdd.length}`);
console.log(`[✓] New programs to add: ${toAdd.length}`);

// Add source and timestamp
const now = new Date().toISOString();
const programsToAdd = toAdd.map(p => ({
    url: p.url,
    name: p.name,
    bounty: p.bounty,
    swag: p.swag || false,
    safe_harbor: p.safe_harbor || '',
    icon: p.icon,
    source: 'disclose',
    addedDate: now,
    tags: ['Bug Bounty', 'Self-hosted']
}));

// Merge with existing
const merged = [...existing, ...programsToAdd];

// Save updated files
fs.writeFileSync('hunting_ons.json', JSON.stringify(merged, null, 2));
fs.writeFileSync('public/hunting_ons.json', JSON.stringify(merged, null, 2));

console.log(`[✓] Updated hunting_ons.json - Total: ${merged.length}`);
console.log(`[✓] Updated public/hunting_ons.json`);

// Show sample added programs
if (toAdd.length > 0) {
    console.log('\n[*] Sample added programs:');
    toAdd.slice(0, 5).forEach(p => {
        console.log(`  ✓ ${p.name} | ${p.url}`);
    });
}

// Update bounty-only database
const bountyPrograms = merged.filter(p => p.bounty === true);
fs.writeFileSync('bounty_only_all.json', JSON.stringify(bountyPrograms, null, 2));
fs.writeFileSync('public/bounty_only_all.json', JSON.stringify(bountyPrograms, null, 2));

console.log(`\n[✓] Updated bounty-only database: ${bountyPrograms.length} total`);

// Count by source
const sources = {};
bountyPrograms.forEach(p => {
    sources[p.source] = (sources[p.source] || 0) + 1;
});
console.log('\n[*] Bounty programs by source:');
Object.entries(sources).sort((a, b) => b[1] - a[1]).forEach(([src, count]) => {
    console.log(`  ${src}: ${count}`);
});