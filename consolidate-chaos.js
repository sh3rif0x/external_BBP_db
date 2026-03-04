const fs = require('fs');

// Load main database
const programs = JSON.parse(fs.readFileSync('hunting_ons.json', 'utf8'));

// Filter: remove "chaos" (basic), keep "chaos-selfhosted" (renamed to "chaos")
const consolidated = programs
    .filter(p => p.source !== 'chaos') // Remove basic chaos programs
    .map(p => {
        if (p.source === 'chaos-selfhosted') {
            return {...p, source: 'chaos' }; // Rename chaos-selfhosted to chaos
        }
        return p;
    });

console.log(`[*] Loaded ${programs.length} programs`);
console.log(`[*] Removed basic 'chaos' programs: ${programs.filter(p => p.source === 'chaos').length}`);
console.log(`[*] Consolidated 'chaos-selfhosted' → 'chaos': ${programs.filter(p => p.source === 'chaos-selfhosted').length}`);
console.log(`[✓] Total after consolidation: ${consolidated.length}`);

// Save to root
fs.writeFileSync('hunting_ons.json', JSON.stringify(consolidated, null, 2));
console.log('[✓] Updated hunting_ons.json');

// Save to public
fs.writeFileSync('public/hunting_ons.json', JSON.stringify(consolidated, null, 2));
console.log('[✓] Updated public/hunting_ons.json');

// Show consolidated chaos stats
const chaosPrograms = consolidated.filter(p => p.source === 'chaos');
console.log(`\n[✓] Consolidated Chaos Programs: ${chaosPrograms.length}`);
console.log(`[✓] With bounty=true: ${chaosPrograms.filter(p => p.bounty).length}`);

// Sample programs
console.log('\n[*] Sample consolidated programs:');
chaosPrograms.slice(0, 5).forEach(p => {
    console.log(`  ${p.name} | ${p.url}`);
});