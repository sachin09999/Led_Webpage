import { S3Client, CreateBucketCommand, PutObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

const minioHost = process.env.MINIO_ENDPOINT || '127.0.0.1';
const minioPort = process.env.MINIO_PORT || '9000';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

export const bucketName = process.env.MINIO_BUCKET || 'wafi-media';

// Configured S3 Client targeting local/docker MinIO
export const s3Client = new S3Client({
    endpoint: `http://${minioHost}:${minioPort}`,
    region: 'us-east-1',
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for MinIO path-style bucket URLs
});

let bucketChecked = false;

// Ensure bucket exists and has public read access policy
export async function ensureBucket() {
    if (bucketChecked) return;
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } catch (err) {
        // Ignore if bucket already exists
    }

    // Set public read policy so browser can stream videos/images directly
    const publicPolicy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: "*",
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
        ]
    };

    try {
        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(publicPolicy)
        }));
    } catch (e) {
        // Policy setting best effort
    }

    bucketChecked = true;
}

export async function uploadToMinIO(fileBuffer, fileName, contentType) {
    await ensureBucket();

    // Generate unique sanitized filename
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueKey = `${Date.now()}_${cleanName}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: contentType || 'application/octet-stream'
    }));

    // Public accessible URL for the browser
    // If MINIO_PUBLIC_URL is configured (e.g. http://192.168.1.165:9000 or http://localhost:9000)
    const publicHost = process.env.MINIO_PUBLIC_URL || `http://${minioHost}:${minioPort}`;
    const fileUrl = `${publicHost}/${bucketName}/${uniqueKey}`;

    return { fileUrl, key: uniqueKey };
}
