import fs from 'fs/promises';
import path from 'path';

async function mapStore() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    const minioFiles = await fs.readdir(path.join(process.cwd(), 'minio-data', 'wafi-media'));

    let matched = 0;

    for (const item of items) {
        // If current URL is already a MinIO URL, keep the key if valid
        const currentUrlKey = item.url ? path.basename(item.url) : '';
        if (minioFiles.includes(currentUrlKey)) {
            console.log(`[OK] Already correct: ${item.name} -> ${currentUrlKey}`);
            matched++;
            continue;
        }

        // Find file in minioFiles that contains key words
        const found = minioFiles.find(file => {
            const lowerFile = file.toLowerCase();
            const lowerName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (lowerName.length > 3 && lowerFile.includes(lowerName)) return true;

            // Try matching original S3 filename if URL had S3
            if (item.url && item.url.includes('amazonaws.com')) {
                const s3File = path.basename(decodeURIComponent(new URL(item.url).pathname)).toLowerCase().replace(/[^a-z0-9]/g, '');
                if (s3File.length > 3 && lowerFile.includes(s3File)) return true;
            }
            return false;
        });

        if (found) {
            item.url = `http://localhost:9005/wafi-media/${found}`;
            console.log(`[MATCHED] "${item.name}" -> ${found}`);
            matched++;
        } else {
            console.warn(`[MISSING] "${item.name}" (url: ${item.url})`);
        }
    }

    await fs.writeFile(storePath, JSON.stringify(items, null, 2));
    console.log(`\nMapping complete: ${matched}/${items.length} items mapped to existing MinIO files.`);
}

mapStore().catch(console.error);
