const fs = require('fs');

// Load consolidated hunting_ons.json
const programs = JSON.parse(fs.readFileSync('hunting_ons.json', 'utf8'));

// Filter only bounty-paying programs
const bountyPrograms = programs.filter(p => p.bounty === true);

// Save bounty-only version
fs.writeFileSync('bounty_only_all.json', JSON.stringify(bountyPrograms, null, 2));
fs.writeFileSync('public/bounty_only_all.json', JSON.stringify(bountyPrograms, null, 2));

console.log(`[✓] Updated bounty-only database`);
console.log(`[*] Total bounty programs: ${bountyPrograms.length}`);

// Breakdown by source
const sources = {};
bountyPrograms.forEach(p => {
    sources[p.source] = (sources[p.source] || 0) + 1;
});

console.log('\n[*] Breakdown by source:');
Object.entries(sources).sort((a, b) => b[1] - a[1]).forEach(([src, count]) => {
    console.log(`  ${src}: ${count}`);
});

// Count consolidated chaos
const chaosCount = bountyPrograms.filter(p => p.source === 'chaos').length;
console.log(`\n[✓] Consolidated Chaos in bounty DB: ${chaosCount}`);