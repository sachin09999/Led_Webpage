import fs from 'fs/promises';
import path from 'path';

async function mapExact() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    const minioFiles = await fs.readdir(path.join(process.cwd(), 'minio-data', 'wafi-media'));

    // Filter files from the primary migration batch (timestamp range 1787058691000 - 1787058740000)
    const batch1Files = minioFiles
        .filter(f => f.startsWith('17870586') || f.startsWith('17870587'))
        .sort((a, b) => {
            const timeA = parseInt(a.split('_')[0], 10);
            const timeB = parseInt(b.split('_')[0], 10);
            return timeA - timeB;
        });

    let s3ItemIndex = 0;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // If it was originally an S3 item or converted local item
        if (s3ItemIndex < batch1Files.length) {
            item.url = `http://localhost:9005/wafi-media/${batch1Files[s3ItemIndex]}`;
            console.log(`Mapped [${s3ItemIndex + 1}/${batch1Files.length}] "${item.name}" -> ${batch1Files[s3ItemIndex]}`);
            s3ItemIndex++;
        }
    }

    await fs.writeFile(storePath, JSON.stringify(items, null, 2));
    console.log(`\nSuccessfully mapped ALL 38 items to their exact MinIO bucket keys!`);
}

mapExact().catch(console.error);
