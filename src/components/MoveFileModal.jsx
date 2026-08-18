'use client';
import { useState } from 'react';
import { X, FolderInput, Folder } from 'lucide-react';
import { moveFileToFolder } from '@/actions/fileActions';
import { useRouter } from 'next/navigation';

export default function MoveFileModal({ 
    file, 
    folders = [], 
    onClose, 
    onMoved 
}) {
    const router = useRouter();
    const [selectedFolderId, setSelectedFolderId] = useState(file?.folderId || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!file) return null;

    const handleMove = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await moveFileToFolder(file.id, selectedFolderId || null);
            if (onMoved) onMoved();
            router.refresh();
            onClose();
        } catch (err) {
            console.error("Failed to move file:", err);
            alert("Failed to move file. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="viewer-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
            <div 
                className="viewer-content shadow-card" 
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '440px',
                    width: '90%',
                    height: 'auto',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border-color, #e5e7eb)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <FolderInput size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Move Item</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {file.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleMove} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px' }}>
                            Select Destination Folder:
                        </label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color, #e5e7eb)',
                                    cursor: 'pointer',
                                    background: selectedFolderId === '' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-main, #f9fafb)'
                                }}
                            >
                                <input 
                                    type="radio" 
                                    name="folderTarget" 
                                    value="" 
                                    checked={selectedFolderId === ''} 
                                    onChange={() => setSelectedFolderId('')} 
                                />
                                <Folder size={18} style={{ color: '#9ca3af' }} />
                                <span style={{ fontSize: '0.875rem', fontWeight: selectedFolderId === '' ? 600 : 400 }}>
                                    Root Level (No Folder)
                                </span>
                            </label>

                            {folders.map(f => (
                                <label
                                    key={f.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color, #e5e7eb)',
                                        cursor: 'pointer',
                                        background: selectedFolderId === f.id ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-main, #f9fafb)'
                                    }}
                                >
                                    <input 
                                        type="radio" 
                                        name="folderTarget" 
                                        value={f.id} 
                                        checked={selectedFolderId === f.id} 
                                        onChange={() => setSelectedFolderId(f.id)} 
                                    />
                                    <Folder size={18} style={{ color: '#f59e0b' }} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: selectedFolderId === f.id ? 600 : 400 }}>
                                        {f.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                        <button type="button" className="outline-btn" onClick={onClose} disabled={isSaving} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn" disabled={isSaving} style={{ padding: '8px 20px', borderRadius: '8px' }}>
                            {isSaving ? 'Moving...' : 'Move File'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
