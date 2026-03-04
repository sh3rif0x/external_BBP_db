const fs = require('fs');

// Load both files
const hunting = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
const issuehuntData = JSON.parse(fs.readFileSync('./issuehunt_programs.json', 'utf8'));

// Create a map of slug -> icon
const iconMap = {};
issuehuntData.forEach(p => {
    if (p.icon) iconMap[p.slug] = p.icon;
});

// Update hunting_ons.json with organization icons for IssueHunt entries
let updated = 0;
hunting.forEach(entry => {
    if (entry.source === 'issuehunt' && entry.slug && iconMap[entry.slug]) {
        entry.icon = iconMap[entry.slug];
        updated++;
    }
});

// Save
fs.writeFileSync('./hunting_ons.json', JSON.stringify(hunting, null, 2));
fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(hunting, null, 2));

console.log(`✅ Updated ${updated} IssueHunt entries with organization icons`);
