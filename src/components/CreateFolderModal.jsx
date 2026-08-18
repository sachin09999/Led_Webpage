'use client';
import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { createFolder } from '@/actions/folderActions';
import { useRouter } from 'next/navigation';

export default function CreateFolderModal({ 
    isOpen, 
    onClose, 
    category = 'Docs', 
    dashboardSlug = 'ledwalldocs',
    parentId = null 
}) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('category', category);
            formData.append('dashboardSlug', dashboardSlug);
            formData.append('color', color);
            if (parentId) formData.append('parentId', parentId);

            await createFolder(formData);

            setName('');
            setIsSubmitting(false);
            onClose();
            router.refresh();
        } catch (err) {
            console.error("Failed to create folder:", err);
            setIsSubmitting(false);
            alert("Failed to create folder. Please try again.");
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
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                            <FolderPlus size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Create New Folder</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Target: {category}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                            Folder Name *
                        </label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Installation Manuals 2026"
                            required
                            autoFocus
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--bg-main, #f9fafb)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                        <button 
                            type="button" 
                            className="outline-btn" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            style={{ padding: '8px 16px', borderRadius: '8px' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="primary-btn" 
                            disabled={isSubmitting}
                            style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 500 }}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
