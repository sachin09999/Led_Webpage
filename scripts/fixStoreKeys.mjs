import fs from 'fs/promises';
import path from 'path';

async function fixKeys() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    const minioFiles = await fs.readdir(path.join(process.cwd(), 'minio-data', 'wafi-media'));

    let matchedCount = 0;

    for (const item of items) {
        // Extract raw name without special chars
        const keywords = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Find best match in minio-data directory
        const match = minioFiles.find(file => {
            const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanFile.includes(keywords) || keywords.includes(cleanFile.replace(/^[0-9]+/, ''))) {
                return true;
            }
            return false;
        });

        if (match) {
            item.url = `http://localhost:9005/wafi-media/${match}`;
            matchedCount++;
            console.log(`Matched "${item.name}" -> ${match}`);
        } else {
            console.warn(`No match found for "${item.name}" (url: ${item.url})`);
        }
    }

    await fs.writeFile(storePath, JSON.stringify(items, null, 2));
    console.log(`\nSuccessfully updated ${matchedCount}/${items.length} items in store.json with exact MinIO keys!`);
}

fixKeys().catch(console.error);
