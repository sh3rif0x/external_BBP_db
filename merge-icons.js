const fs = require('fs');

// Load both files
const hunting = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
const h1Icons = JSON.parse(fs.readFileSync('./h1_bounty_programs.json', 'utf8'));

// Create a map of handle -> icon
const iconMap = {};
h1Icons.forEach(p => {
    if (p.icon) iconMap[p.handle] = p.icon;
});

// Update hunting_ons.json with icons for HackerOne entries
let updated = 0;
hunting.forEach(entry => {
    if (entry.source === 'hackerone' && entry.handle && iconMap[entry.handle]) {
        entry.icon = iconMap[entry.handle];
        updated++;
    }
});

// Save
fs.writeFileSync('./hunting_ons.json', JSON.stringify(hunting, null, 2));
fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(hunting, null, 2));

console.log(`✅ Updated ${updated} HackerOne entries with icons`);
