'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { uploadToMinIO } from '@/lib/minioClient';

const dataFilePath = path.join(process.cwd(), 'data', 'store.json');

export async function getFiles() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const files = JSON.parse(fileContents);
        return files.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.log("Database not found, initializing fresh store...");
        const defaultData = [
            { id: "1", name: "LED Wall Installation Manual v2.1.pdf", category: "Docs", dashboardSlug: "wafi-command-centre", date: "May 20, 2026", size: "4.8 MB", icon: "FileText", iconColor: "blue-text", tagColor: "blue-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { id: "2", name: "Insta 360° Installation Guide.mp4", category: "Videos", dashboardSlug: "wafi-command-centre", date: "May 18, 2026", size: "128.6 MB", icon: "PlaySquare", iconColor: "purple-text", tagColor: "purple-tag", type: "video", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
            { id: "3", name: "Power Wiring Diagram.pdf", category: "Drawings", dashboardSlug: "wafi-command-centre", date: "May 17, 2026", size: "2.1 MB", icon: "PenTool", iconColor: "green-text", tagColor: "green-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { id: "4", name: "Rigging Reference 1.jpg", category: "Pictures", dashboardSlug: "wafi-command-centre", date: "May 01, 2026", size: "5.2 MB", icon: "ImageIcon", iconColor: "orange-text", tagColor: "orange-tag", type: "image", url: "https://picsum.photos/800/600" },
            { id: "5", name: "Q1 Purchase History.pdf", category: "Finance Data", dashboardSlug: "wafi-command-centre", date: "Apr 05, 2026", size: "0.8 MB", icon: "PieChart", iconColor: "yellow-text", tagColor: "yellow-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { id: "6", name: "Global Contacts List.pdf", category: "Support Data", dashboardSlug: "wafi-command-centre", date: "Jan 15, 2026", size: "0.5 MB", icon: "LifeBuoy", iconColor: "blue-text", tagColor: "blue-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ];
        try {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2));
        } catch (e) {
            console.error("Failed to initialize store.json", e);
        }
        return defaultData.sort((a, b) => a.name.localeCompare(b.name));
    }
}

function determineStyles(category) {
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('doc')) return { icon: 'FileText', iconColor: 'blue-text', tagColor: 'blue-tag' };
    if (catLower.includes('video')) return { icon: 'PlaySquare', iconColor: 'purple-text', tagColor: 'purple-tag' };
    if (catLower.includes('drawing')) return { icon: 'PenTool', iconColor: 'green-text', tagColor: 'green-tag' };
    if (catLower.includes('picture') || catLower.includes('photo') || catLower.includes('image')) return { icon: 'ImageIcon', iconColor: 'orange-text', tagColor: 'orange-tag' };
    if (catLower.includes('finance')) return { icon: 'PieChart', iconColor: 'yellow-text', tagColor: 'yellow-tag' };
    if (catLower.includes('support')) return { icon: 'LifeBuoy', iconColor: 'blue-text', tagColor: 'blue-tag' };
    return { icon: 'FileText', iconColor: 'blue-text', tagColor: 'blue-tag' };
}

export async function addFile(formData) {
    const files = await getFiles();
    
    const category = formData.get('category');
    const dashboardSlug = formData.get('dashboardSlug') || 'wafi-command-centre';
    const folderId = formData.get('folderId') || null;
    const { icon, iconColor, tagColor } = determineStyles(category);

    const newFile = {
        id: Date.now().toString(),
        name: formData.get('name'),
        category: category,
        dashboardSlug: dashboardSlug,
        folderId: folderId || null,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        size: formData.get('size') || '-',
        type: formData.get('type') || 'document',
        url: formData.get('url'),
        icon,
        iconColor,
        tagColor
    };

    files.unshift(newFile);
    await fs.writeFile(dataFilePath, JSON.stringify(files, null, 2));
    
    revalidatePath('/', 'layout');
}

export async function updateFile(id, formData) {
    const files = await getFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) return;

    const category = formData.get('category');
    const dashboardSlug = formData.get('dashboardSlug') || files[index].dashboardSlug || 'wafi-command-centre';
    const folderId = formData.get('folderId') !== undefined ? formData.get('folderId') : files[index].folderId;
    const { icon, iconColor, tagColor } = determineStyles(category);

    files[index] = {
        ...files[index],
        name: formData.get('name'),
        category: category,
        dashboardSlug: dashboardSlug,
        folderId: folderId || null,
        size: formData.get('size') || files[index].size,
        type: formData.get('type') || files[index].type,
        url: formData.get('url') || files[index].url,
        icon,
        iconColor,
        tagColor
    };

    await fs.writeFile(dataFilePath, JSON.stringify(files, null, 2));
    revalidatePath('/', 'layout');
}

export async function moveFileToFolder(fileId, folderId) {
    const files = await getFiles();
    const index = files.findIndex(f => f.id === fileId);
    if (index === -1) return;

    files[index].folderId = folderId || null;
    await fs.writeFile(dataFilePath, JSON.stringify(files, null, 2));
    revalidatePath('/', 'layout');
}

export async function deleteFile(id) {
    const files = await getFiles();
    const updatedFiles = files.filter(f => f.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify(updatedFiles, null, 2));
    revalidatePath('/', 'layout');
}

export async function uploadFileToMinIOAction(formData) {
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
        throw new Error('No file provided');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { fileUrl } = await uploadToMinIO(buffer, file.name, file.type);

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = `${sizeInMB} MB`;

    // Detect type
    let itemType = 'document';
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
        itemType = 'video';
    } else if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        itemType = 'image';
    }

    return { 
        fileUrl, 
        fileName: file.name, 
        fileSize: formattedSize, 
        fileType: itemType 
    };
}
