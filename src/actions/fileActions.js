'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const dataFilePath = path.join(process.cwd(), 'data', 'store.json');

export async function getFiles() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const files = JSON.parse(fileContents);
        return files.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.log("Database not found, initializing fresh store...");
        const defaultData = [
            { id: "1", name: "LED Wall Installation Manual v2.1.pdf", category: "LED Wall Docs", date: "May 20, 2024", size: "4.8 MB", icon: "FileText", iconColor: "blue-text", tagColor: "blue-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { id: "2", name: "Insta 360° Installation Guide.mp4", category: "Videos", date: "May 18, 2024", size: "128.6 MB", icon: "PlaySquare", iconColor: "purple-text", tagColor: "purple-tag", type: "video", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
            { id: "3", name: "Power Wiring Diagram.pdf", category: "Drawings", date: "May 17, 2024", size: "2.1 MB", icon: "PenTool", iconColor: "green-text", "tagColor": "green-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { id: "4", name: "Rigging Reference 1.jpg", category: "Pictures", date: "May 01, 2024", size: "5.2 MB", icon: "ImageIcon", iconColor: "orange-text", "tagColor": "orange-tag", type: "image", url: "https://picsum.photos/800/600" },
            { id: "5", name: "Q1 Purchase History.pdf", category: "Finance Data", date: "Apr 05, 2024", size: "0.8 MB", icon: "PieChart", iconColor: "yellow-text", "tagColor": "yellow-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { id: "6", name: "Global Contacts List.pdf", category: "Support Data", date: "Jan 15, 2024", size: "0.5 MB", icon: "LifeBuoy", iconColor: "blue-text", "tagColor": "blue-tag", type: "document", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
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
    switch (category) {
        case 'LED Wall Docs': return { icon: 'FileText', iconColor: 'blue-text', tagColor: 'blue-tag' };
        case 'Videos': return { icon: 'PlaySquare', iconColor: 'purple-text', tagColor: 'purple-tag' };
        case 'Drawings': return { icon: 'PenTool', iconColor: 'green-text', tagColor: 'green-tag' };
        case 'Pictures': return { icon: 'ImageIcon', iconColor: 'orange-text', tagColor: 'orange-tag' };
        case 'Finance Data': return { icon: 'PieChart', iconColor: 'yellow-text', tagColor: 'yellow-tag' };
        case 'Support Data': return { icon: 'LifeBuoy', iconColor: 'blue-text', tagColor: 'blue-tag' };
        default: return { icon: 'FileText', iconColor: 'blue-text', tagColor: 'blue-tag' };
    }
}

export async function addFile(formData) {
    const files = await getFiles();
    
    const category = formData.get('category');
    const { icon, iconColor, tagColor } = determineStyles(category);

    const newFile = {
        id: Date.now().toString(),
        name: formData.get('name'),
        category: category,
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
    const { icon, iconColor, tagColor } = determineStyles(category);

    files[index] = {
        ...files[index],
        name: formData.get('name'),
        category: category,
        size: formData.get('size'),
        type: formData.get('type'),
        url: formData.get('url'),
        icon,
        iconColor,
        tagColor
    };

    await fs.writeFile(dataFilePath, JSON.stringify(files, null, 2));
    revalidatePath('/', 'layout');
}

export async function deleteFile(id) {
    const files = await getFiles();
    const updatedFiles = files.filter(f => f.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify(updatedFiles, null, 2));
    revalidatePath('/', 'layout');
}
