'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const foldersFilePath = path.join(process.cwd(), 'data', 'folders.json');

export async function getFolders() {
    try {
        const fileContents = await fs.readFile(foldersFilePath, 'utf8');
        const folders = JSON.parse(fileContents);
        return folders.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.log("folders.json not found, returning empty array...");
        return [];
    }
}

export async function createFolder(formData) {
    const folders = await getFolders();
    
    const name = formData.get('name') || 'New Folder';
    const parentId = formData.get('parentId') || null;
    const category = formData.get('category') || 'Docs';
    const dashboardSlug = formData.get('dashboardSlug') || 'wafi-command-centre';
    const color = formData.get('color') || 'blue';

    const newFolder = {
        id: `folder-${Date.now()}`,
        name: name.trim(),
        parentId: parentId || null,
        category,
        dashboardSlug,
        color,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    folders.unshift(newFolder);
    await fs.mkdir(path.dirname(foldersFilePath), { recursive: true });
    await fs.writeFile(foldersFilePath, JSON.stringify(folders, null, 2));

    revalidatePath('/', 'layout');
    return newFolder;
}

export async function renameFolder(id, newName) {
    const folders = await getFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) return;

    folders[index].name = newName.trim();
    await fs.writeFile(foldersFilePath, JSON.stringify(folders, null, 2));
    revalidatePath('/', 'layout');
}

export async function deleteFolder(id) {
    const folders = await getFolders();
    
    // Find all folder IDs to delete recursively (target folder + any nested subfolders)
    const folderIdsToDelete = new Set([id]);
    let addedMore = true;
    while (addedMore) {
        addedMore = false;
        folders.forEach(f => {
            if (f.parentId && folderIdsToDelete.has(f.parentId) && !folderIdsToDelete.has(f.id)) {
                folderIdsToDelete.add(f.id);
                addedMore = true;
            }
        });
    }

    const updatedFolders = folders.filter(f => !folderIdsToDelete.has(f.id));
    await fs.writeFile(foldersFilePath, JSON.stringify(updatedFolders, null, 2));

    // Reset folderId on files inside any of the deleted folders
    const storePath = path.join(process.cwd(), 'data', 'store.json');
    try {
        const fileContents = await fs.readFile(storePath, 'utf8');
        const files = JSON.parse(fileContents);
        let modified = false;
        files.forEach(f => {
            if (f.folderId && folderIdsToDelete.has(f.folderId)) {
                f.folderId = null;
                modified = true;
            }
        });
        if (modified) {
            await fs.writeFile(storePath, JSON.stringify(files, null, 2));
        }
    } catch (e) {
        console.error("Failed to update store.json after folder deletion", e);
    }

    revalidatePath('/', 'layout');
}
