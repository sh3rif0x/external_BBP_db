const fs = require('fs');

// New programs from Trusted Hacker source
const newPrograms = [{
        url: 'https://www.bentley.com/legal/bug-bounty-report/',
        name: 'Bentley',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://www.telekom.com/en/company/data-privacy-and-security/news/help-us-to-become-better-360054',
        name: 'Telekom',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://github.com/swisscom/bugbounty',
        name: 'Swisscom',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://www.kaseya.com/trust-center/vulnerability-disclosure-policy/',
        name: 'Kaseya',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://www.artificiallawyer.com/2019/10/22/relativity-offers-bug-bounties-discusses-calder7-security-measures/',
        name: 'Relativity',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://bugbounty.paytm.com/',
        name: 'Paytm',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://www.liquidweb.com/policies/bug-bounty-program/',
        name: 'Liquidweb',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://proton.me/security/bug-bounty',
        name: 'Proton',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://hive.oroinc.com/bug-bounty/',
        name: 'Oroinc',
        bounty: true,
        source: 'chaos'
    },
    {
        url: 'https://www.animalfriends.co.uk/bug-bounty/',
        name: 'AnimalFriends',
        bounty: true,
        source: 'chaos'
    }
];

// Load existing database
const existing = JSON.parse(fs.readFileSync('hunting_ons.json', 'utf8'));
const existingUrls = new Set(existing.map(p => p.url));

// Filter new programs - only add if URL doesn't exist
const toAdd = newPrograms.filter(p => !existingUrls.has(p.url));

console.log(`[*] Total new programs provided: ${newPrograms.length}`);
console.log(`[*] Programs already in database: ${newPrograms.length - toAdd.length}`);
console.log(`[✓] New programs to add: ${toAdd.length}`);

// Add icon and timestamp to new programs
const now = new Date().toISOString();
const programsToAdd = toAdd.map(p => ({
    ...p,
    icon: `https://www.google.com/s2/favicons?domain=${new URL(p.url).hostname}&sz=64`,
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

// Show added programs
if (toAdd.length > 0) {
    console.log('\n[*] Added programs:');
    toAdd.forEach(p => {
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