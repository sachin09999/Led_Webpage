import fs from 'fs/promises';
import path from 'path';
import { S3Client, CreateBucketCommand, PutObjectCommand, PutBucketPolicyCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const minioHost = process.env.MINIO_ENDPOINT || 'minio';
const minioPort = process.env.MINIO_PORT || '9000';
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

// Map of original S3 URLs by file title/key
const s3Map = {
    "Ai Server": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Ai+Server.jpeg",
    "AP 1": "https://wafi-centre.s3.ap-south-1.amazonaws.com/AP+1.jpeg",
    "AP 2": "https://wafi-centre.s3.ap-south-1.amazonaws.com/AP+2.jpeg",
    "Back Frame Drawing Dubai Wafi Mall": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Back+Frame+Drawing-Dubai+Wafi+Mall.pdf",
    "Compression Server": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Comperssion+Server.jpeg",
    "Connection Diagram Dubai Wali Project ": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Connection+Diagram-+Dubai+Waifi+Project.pdf",
    "Devices of Rack 1": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Devices+Explnation+Rack1.mp4",
    "Firewall": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Firewall.jpeg",
    "How to turn on and off Display": "https://wafi-centre.s3.ap-south-1.amazonaws.com/how+to+turn+on+and+off+display_s.mp4",
    "Led Wall": "https://wafi-centre.s3.ap-south-1.amazonaws.com/LED+Wall.jpeg",
    "Led Wall Connection": "https://wafi-centre.s3.ap-south-1.amazonaws.com/How+the+Display_s+is+Connected.mp4",
    "Led wall installation video 1 ": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Installation-Video1.mp4",
    "Led wall installation video 2": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Installation-Video2.mp4",
    "Led wall installation video 3": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Installation-Video3.mp4",
    "Led wall installation video 4": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Installation-Video4.mp4",
    "Led Wall Invoice": "https://wafi-centre.s3.ap-south-1.amazonaws.com/INVOICE+DUBAI.pdf",
    "NAS Storage": "https://wafi-centre.s3.ap-south-1.amazonaws.com/NAS+Storage.jpeg",
    "Network Topology": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Network+Topology-Diagram+Document.pdf",
    "NVR": "https://wafi-centre.s3.ap-south-1.amazonaws.com/NVR.png",
    "NVR and Storage": "https://wafi-centre.s3.ap-south-1.amazonaws.com/2-+NVR+and+Storage.mp4",
    "Primary Server": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Primary+Server.jpeg",
    "Rack 2 Devices": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Rack+2+Devices.mp4",
    "Rack 2 Topology": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Rack+2+Topology.mp4",
    "Router": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Router.jpeg",
    "Secondary Server": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Secondary+Server.jpeg",
    "Server Rack 1": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Server+Rack+1.jpeg",
    "Server Rack 2": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Server+Rack+2.jpeg",
    "Switch 1": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Switch+1.jpeg",
    "Switch 2": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Switch+2.png",
    "Switch 3": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Switch+3.png",
    "Switch 4": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Switch+4.png",
    "System Connection Diagram": "https://wafi-centre.s3.ap-south-1.amazonaws.com/How+the+System+Is+Connected.png",
    "Topology of Rack 1": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Topology+Rack+1.mp4",
    "Valve_PDF": "https://wafi-centre.s3.ap-south-1.amazonaws.com/EAV+Electric+ball+valve.pdf",
    "Video Controller": "https://wafi-centre.s3.ap-south-1.amazonaws.com/Video+Controller.png",
    "WTP_connection_diagram": "https://wafi-centre.s3.ap-south-1.amazonaws.com/WTP_Diagram.png",
    "WTP_Drawing": "https://wafi-centre.s3.ap-south-1.amazonaws.com/WTP-Sensor-image2.png"
};

async function ensureBucket() {
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } catch (err) {}
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

async function checkMinioFile(key) {
    try {
        await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
        return true;
    } catch (err) {
        return false;
    }
}

async function migrate() {
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    const content = await fs.readFile(storePath, 'utf8');
    const items = JSON.parse(content);

    await ensureBucket();

    let transferred = 0;
    const total = items.length;

    console.log(`Checking ${total} store items for missing MinIO files...`);

    for (let i = 0; i < total; i++) {
        const item = items[i];
        if (!item.url) continue;

        const key = path.basename(item.url);
        const exists = await checkMinioFile(key);

        if (exists) {
            console.log(`[EXISTS] ${item.name} (${key})`);
            continue;
        }

        // Determine source S3 URL
        let downloadUrl = null;
        if (item.url.includes('amazonaws.com')) {
            downloadUrl = item.url;
        } else if (s3Map[item.name]) {
            downloadUrl = s3Map[item.name];
        }

        if (downloadUrl) {
            try {
                console.log(`[DOWNLOADING ${i + 1}/${total}] ${item.name} from Amazon S3...`);
                const response = await fetch(downloadUrl);
                if (!response.ok) {
                    console.error(`Failed to download ${downloadUrl}: ${response.statusText}`);
                    continue;
                }

                const contentType = response.headers.get('content-type') || 'application/octet-stream';
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                console.log(`[UPLOADING] ${key} to MinIO (${(buffer.length / (1024 * 1024)).toFixed(1)} MB)...`);
                await s3Client.send(new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType
                }));

                transferred++;
                console.log(`[SUCCESS] ${key} is now ready in MinIO!`);
            } catch (err) {
                console.error(`[ERROR] Failed to transfer "${item.name}":`, err.message);
            }
        }
    }

    console.log(`\nDone! Successfully downloaded & transferred ${transferred} missing files to MinIO.`);
}

migrate().catch(console.error);
