import fs from 'fs/promises';
import path from 'path';

async function updateUrls() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    let count = 0;
    for (const item of items) {
        if (item.url && item.url.includes('wafi-centre.s3.ap-south-1.amazonaws.com')) {
            const originalName = path.basename(decodeURIComponent(new URL(item.url).pathname)) || item.name;
            const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
            item.url = `http://localhost:9005/wafi-media/${cleanName}`;
            count++;
        }
    }

    await fs.writeFile(storePath, JSON.stringify(items, null, 2));
    console.log(`Updated ${count} items in store.json to point to local MinIO URLs.`);
}

updateUrls().catch(console.error);
