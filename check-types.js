const https = require('https');

function fetchIssueHuntPage(page) {
    return new Promise((resolve, reject) => {
        const url = `https://api.issuehunt.io/programs?page=${page}&perPage=100`;

        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (err) {
                    resolve({ status: res.statusCode, data: null });
                }
            });
        }).on('error', reject);
    });
}

async function checkTypes() {
    const { status, data } = await fetchIssueHuntPage(1);
    const results = data.data || [];
    
    console.log('Sample programs and their types:\n');
    results.slice(0, 5).forEach(p => {
        console.log(`${p.name}: type="${p.type}"`);
    });
    
    console.log('\nAll unique types found:');
    const types = new Set();
    results.forEach(p => types.add(p.type));
    Array.from(types).forEach(t => console.log(`  - ${t}`));
}

checkTypes().catch(console.error);
