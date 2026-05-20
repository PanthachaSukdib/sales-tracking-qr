const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
}

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600&display=swap';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

console.log('Fetching CSS from Google Fonts...');

https.get(CSS_URL, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
    let cssData = '';
    res.on('data', chunk => cssData += chunk);
    res.on('end', () => {
        const blocks = cssData.split('/* ');
        let downloads = [];
        
        blocks.forEach(block => {
            if (!block.trim()) return;
            // Matches /* thai */ or /* latin */ etc.
            const subsetMatch = block.match(/^([a-z-]+)\s*\*\//);
            if (!subsetMatch) return;
            const subset = subsetMatch[1];
            
            // We only care about thai and latin
            if (subset !== 'thai' && subset !== 'latin') return;
            
            const weightMatch = block.match(/font-weight:\s*(\d+);/);
            if (!weightMatch) return;
            const weight = weightMatch[1];
            
            const urlMatch = block.match(/url\((https:\/\/[^\)]+)\)/);
            if (!urlMatch) return;
            const url = urlMatch[1];
            
            const fileName = `noto-sans-thai-${weight}-${subset}.woff2`;
            const destPath = path.join(FONTS_DIR, fileName);
            
            downloads.push(downloadFile(url, destPath, fileName));
        });
        
        Promise.all(downloads).then(() => {
            console.log('All required fonts downloaded successfully!');
        }).catch(err => {
            console.error('Error downloading fonts:', err);
        });
    });
}).on('error', err => {
    console.error('Failed to fetch CSS:', err);
});

function downloadFile(url, dest, fileName) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${fileName}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}
