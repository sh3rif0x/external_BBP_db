const fs = require('fs');

async function filterBugBountyPrograms() {
    console.log('🔍 Filter BugBountyDirectory Programs\n');
    console.log('====================================\n');

    if (!fs.existsSync('./bugbounty_programs.json')) {
        console.log('❌ bugbounty_programs.json not found\n');
        console.log('Run scraper-nextjs-chunk.js first');
        return;
    }

    // Load the full programs list
    const allPrograms = JSON.parse(fs.readFileSync('./bugbounty_programs.json', 'utf8'));
    console.log(`📊 Total programs from bugbountydirectory: ${allPrograms.length}\n`);

    // Filter only programs with active bounties
    const withBounty = allPrograms.filter(p => p.bounty === true);
    console.log(`💰 Programs with ACTIVE BOUNTY: ${withBounty.length}`);
    console.log(`   Without bounty: ${allPrograms.length - withBounty.length}\n`);

    // Show by categories
    const byCategory = {
        bountyOnly: withBounty.filter(p => p.bounty && !p.swag && !p.hof),
        bountySwag: withBounty.filter(p => p.bounty && p.swag && !p.hof),
        bountyHof: withBounty.filter(p => p.bounty && !p.swag && p.hof),
        bountySwagHof: withBounty.filter(p => p.bounty && p.swag && p.hof)
    };

    console.log('📈 Breakdown:\n');
    console.log(`  💰 Bounty only:           ${byCategory.bountyOnly.length}`);
    console.log(`  💰 + Swag:                ${byCategory.bountySwag.length}`);
    console.log(`  💰 + Hall of Fame:        ${byCategory.bountyHof.length}`);
    console.log(`  💰 + Swag + Hall of Fame: ${byCategory.bountySwagHof.length}\n`);

    // Show sample
    console.log('Sample programs with bounty:\n');
    withBounty.slice(0, 10).forEach((p, i) => {
        const extras = [];
        if (p.swag) extras.push('SWAG');
        if (p.hof) extras.push('HOF');
        const extraStr = extras.length > 0 ? ` [${extras.join(', ')}]` : '';
        console.log(`  ${i + 1}. ${p.company.padEnd(30)} ${extraStr}`);
        console.log(`     ${p.url}`);
    });

    if (withBounty.length > 10) {
        console.log(`\n  ... and ${withBounty.length - 10} more programs with bounty`);
    }

    // Save filtered version
    fs.writeFileSync('./bugbounty_programs_bounty_only.json', JSON.stringify(withBounty, null, 2));
    console.log(`\n✅ Saved: bugbounty_programs_bounty_only.json (${withBounty.length} programs)\n`);

    // Now update the main database to include only bounty programs from bugbountydirectory
    let existing = [];
    if (fs.existsSync('./hunting_ons.json')) {
        existing = JSON.parse(fs.readFileSync('./hunting_ons.json', 'utf8'));
    }

    // Remove old bugbountydirectory entries
    const nonBBD = existing.filter(p => {
        if (typeof p === 'string') return true;
        return p.source !== 'bugbountydirectory';
    });

    console.log(`Database cleanup:\n`);
    console.log(`  Before: ${existing.length} total programs`);
    console.log(`  Removed bugbountydirectory entries: ${existing.length - nonBBD.length}`);

    // Add only bounty-enabled programs
    const formatted = withBounty.map(p => ({
        url: p.url,
        source: 'bugbountydirectory',
        addedDate: new Date().toISOString(),
        company: p.company,
        bounty: p.bounty,
        swag: p.swag,
        hof: p.hof,
        tags: p.tags
    }));

    const merged = [...nonBBD, ...formatted];
    fs.writeFileSync('./hunting_ons.json', JSON.stringify(merged, null, 0));
    fs.writeFileSync('./public/hunting_ons.json', JSON.stringify(merged, null, 0));

    // Statistics
    const stats = {};
    merged.forEach(p => {
        const s = typeof p === 'string' ? 'other' : (p.source || 'other');
        stats[s] = (stats[s] || 0) + 1;
    });

    console.log(`  After: ${merged.length} total programs`);
    console.log(`  Added bounty programs: ${formatted.length}\n`);

    console.log('✅ Database updated with BOUNTY-ONLY programs\n');
    console.log('📊 New statistics:');
    Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([source, count]) => {
            console.log(`   ${source.padEnd(22)}: ${count}`);
        });
}

filterBugBountyPrograms().catch(console.error);