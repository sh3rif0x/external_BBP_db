const fs = require('fs');
const data = require('./hunting_ons.json');

// Show what's wrong
const bbd = data.filter(p => typeof p === 'object' && p.source === 'bugbountydirectory');
console.log('❌ Current bugbountydirectory programs (WRONG DATA):\n');
bbd.slice(0, 10).forEach((p, i) => {
    console.log(`${i+1}. ${p.url}`);
});
if (bbd.length > 10) console.log(`... and ${bbd.length - 10} more`);
console.log(`\nTotal bad entries: ${bbd.length}\n`);

// Clean: remove bugbountydirectory entries and rebuild from scratch
const nonBBD = data.filter(p => {
    if (typeof p === 'string') return true; // Legacy format
    return p.source !== 'bugbountydirectory'; // Remove ALL current bugbountydirectory
});

console.log(`✅ Removed all ${bbd.length} bugbountydirectory entries`);
console.log(`   Keeping: ${nonBBD.length} other programs`);

// Save cleaned version
fs.writeFileSync('./hunting_ons.json', JSON.stringify(nonBBD, null, 0));
fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(nonBBD, null, 0));

const stats = {};
nonBBD.forEach(p => {
    const s = typeof p === 'string' ? 'other' : (p.source || 'other');
    stats[s] = (stats[s] || 0) + 1;
});

console.log('\n✅ Database cleaned. New statistics:\n');
Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
    console.log(`   ${source.padEnd(22)}: ${count}`);
});