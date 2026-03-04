const https = require('https');
const fs = require('fs');

async function fetchUrl(url, options = {}) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                ...options.headers
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
        }).on('error', (err) => resolve({ status: 0, body: '', error: err.message }));
    });
}

async function tryApiEndpoints() {
    console.log('🔧 Trying alternative API endpoints...\n');

    const endpoints = [
        'https://www.bugbountydirectory.com/api/programs',
        'https://api.bugbountydirectory.com/programs',
        'https://www.bugbountydirectory.com/api/programs?page=1',
        'https://www.bugbountydirectory.com/v1/programs',
    ];

    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint}`);
        const { status, body } = await fetchUrl(endpoint);
        console.log(`  Status: ${status}, Size: ${body.length}\n`);

        if (status === 200 && body.length > 100) {
            try {
                // Check if it's JSON
                const json = JSON.parse(body);
                console.log('✅ Valid JSON found!\n');
                console.log(JSON.stringify(json, null, 2).substring(0, 500));
                return { found: true, endpoint, data: json };
            } catch (e) {
                console.log('  (Not JSON)\n');
            }
        }
    }

    return { found: false };
}

async function parseNextJsData() {
    console.log('\n📑 Parsing Next.js embedded data...\n');

    const { body } = await fetchUrl('https://www.bugbountydirectory.com/programs?page=1');

    // Look for __NEXT_DATA__ which contains the page state
    const nextDataMatch = body.match(/<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/);

    if (nextDataMatch) {
        console.log('✅ Found __NEXT_DATA__ JSON!\n');
        try {
            const data = JSON.parse(nextDataMatch[1]);
            console.log('Data keys:', Object.keys(data));

            // Look for props
            if (data.props && data.props.pageProps) {
                console.log('Found pageProps keys:', Object.keys(data.props.pageProps));
                console.log('\nContent sample:');
                console.log(JSON.stringify(data.props.pageProps, null, 2).substring(0, 1000));
                return data;
            }
        } catch (e) {
            console.log('Could not parse __NEXT_DATA__:', e.message);
        }
    } else {
        console.log('❌ __NEXT_DATA__ not found in page\n');
    }

    return null;
}

async function main() {
    console.log('🔎 BugBountyDirectory API Discovery\n');
    console.log('====================================\n');

    const apiResult = await tryApiEndpoints();

    if (!apiResult.found) {
        const nextData = await parseNextJsData();

        if (!nextData) {
            console.log('\n⚠️  Neither API endpoints nor embedded data found.');
            console.log('\n📌 Diagnosis: bugbountydirectory.com appears to be fully client-side rendered.');
            console.log('\n🔧 Solutions:');
            console.log('  1. Install Puppeteer or Playwright for headless browser scraping');
            console.log('  2. Check browser Network tab to see what API the frontend calls');
            console.log('  3. Use a headless Chrome instance');
            console.log('\n💡 Temporary fix: Use Cheerio to parse the rendered HTML from a headless browser');
        }
    }
}

main().catch(e => console.error('Error:', e.message));