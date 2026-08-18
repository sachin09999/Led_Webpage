import fs from 'fs/promises';
import path from 'path';
import { S3Client, CreateBucketCommand, PutObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

const minioHost = process.env.MINIO_ENDPOINT || '127.0.0.1';
const minioPort = process.env.MINIO_PORT || '9005';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const bucketName = process.env.MINIO_BUCKET || 'wafi-media';

const s3Client = new S3Client({
    endpoint: `http://${minioHost}:${minioPort}`,
    region: 'us-east-1',
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    },
    forcePathStyle: true,
});

async function ensureBucket() {
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } catch (err) {
        // Ignore if exists
    }
    const publicPolicy = {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
        }]
    };
    try {
        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(publicPolicy)
        }));
    } catch (e) {}
}

async function migrate() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    await ensureBucket();

    let migratedCount = 0;
    const total = items.length;

    console.log(`Starting migration of ${total} store items to local MinIO...`);

    for (let i = 0; i < total; i++) {
        const item = items[i];
        if (item.url && item.url.includes('amazonaws.com')) {
            try {
                console.log(`[${i + 1}/${total}] Downloading: ${item.name} (${item.url})`);
                const response = await fetch(item.url);
                if (!response.ok) {
                    console.error(`Failed to download ${item.url}: ${response.statusText}`);
                    continue;
                }

                const contentType = response.headers.get('content-type') || 'application/octet-stream';
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Sanitize filename
                const originalName = path.basename(decodeURIComponent(new URL(item.url).pathname)) || item.name;
                const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
                const uniqueKey = `${Date.now()}_${cleanName}`;

                console.log(`Uploading to MinIO as: ${uniqueKey}`);
                await s3Client.send(new PutObjectCommand({
                    Bucket: bucketName,
                    Key: uniqueKey,
                    Body: buffer,
                    ContentType: contentType
                }));

                // Update URL to local MinIO endpoint
                const publicHost = process.env.MINIO_PUBLIC_URL || `http://localhost:9005`;
                item.url = `${publicHost}/${bucketName}/${uniqueKey}`;
                
                // Update size if missing or zero
                if (!item.size || item.size === '-' || item.size === '0 MB') {
                    item.size = `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`;
                }

                migratedCount++;
                console.log(`Successfully migrated -> ${item.url}`);
            } catch (err) {
                console.error(`Error migrating item "${item.name}":`, err.message);
            }
        }
    }

    if (migratedCount > 0) {
        await fs.writeFile(storePath, JSON.stringify(items, null, 2));
        console.log(`Migration Complete! Successfully transferred ${migratedCount} files from Amazon S3 to MinIO.`);
    } else {
        console.log('No Amazon S3 files found needing migration.');
    }
}

migrate().catch(console.error);
