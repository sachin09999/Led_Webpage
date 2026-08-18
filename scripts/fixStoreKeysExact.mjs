import fs from 'fs/promises';
import path from 'path';

async function fixStoreKeysExact() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    const minioFiles = await fs.readdir(path.join(process.cwd(), 'minio-data', 'wafi-media'));

    let matched = 0;

    for (const item of items) {
        if (!item.url) continue;

        // Current filename in URL e.g. "Ai_Server.jpeg" or "1787058691465_Ai_Server.jpeg"
        const currentFile = path.basename(item.url);

        // Find exact file in minioFiles ending with currentFile or matching currentFile
        const found = minioFiles.find(f => f === currentFile || f.endsWith(`_${currentFile}`) || currentFile.endsWith(f));

        if (found) {
            item.url = `http://localhost:9005/wafi-media/${found}`;
            console.log(`[MATCHED] "${item.name}" -> ${found}`);
            matched++;
        } else {
            console.warn(`[UNMATCHED] "${item.name}" (url: ${item.url})`);
        }
    }

    await fs.writeFile(storePath, JSON.stringify(items, null, 2));
    console.log(`\nSuccessfully matched and updated ${matched}/${items.length} items in store.json!`);
}

fixStoreKeysExact().catch(console.error);
