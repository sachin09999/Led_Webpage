'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { updateFile } from '@/actions/fileActions';
import { useRouter } from 'next/navigation';

export default function EditMaterialModal({ file, onClose, onUpdated }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: file?.name || '',
        url: file?.url || '',
        category: file?.category || 'Docs',
        type: file?.type || 'document',
        dashboardSlug: file?.dashboardSlug || 'wafi-command-centre'
    });

    if (!file) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('url', formData.url);
            data.append('category', formData.category);
            data.append('type', formData.type);
            data.append('dashboardSlug', formData.dashboardSlug);

            await updateFile(file.id, data);
            if (onUpdated) onUpdated();
            router.refresh();
            onClose();
        } catch (err) {
            console.error("Failed to update material:", err);
            alert("Error updating item. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-content" 
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '520px',
                    width: '90%',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Item</h3>
                    <button className="icon-btn" onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Name / Title *</label>
                        <input 
                            required 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            style={{ 
                                padding: '10px 14px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-color)', 
                                color: 'var(--text-main)', 
                                outline: 'none' 
                            }} 
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>URL / Download Link *</label>
                        <input 
                            required 
                            type="text" 
                            value={formData.url} 
                            onChange={e => setFormData({ ...formData, url: e.target.value })} 
                            style={{ 
                                padding: '10px 14px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-color)', 
                                color: 'var(--text-main)', 
                                outline: 'none' 
                            }} 
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Category</label>
                            <input 
                                type="text"
                                value={formData.category} 
                                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                                placeholder="e.g. Videos, Docs..."
                                style={{ 
                                    padding: '10px 14px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--bg-color)', 
                                    color: 'var(--text-main)', 
                                    outline: 'none' 
                                }} 
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Media Type</label>
                            <select 
                                value={formData.type} 
                                onChange={e => setFormData({ ...formData, type: e.target.value })} 
                                style={{ 
                                    padding: '10px 14px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--bg-color)', 
                                    color: 'var(--text-main)', 
                                    outline: 'none' 
                                }}
                            >
                                <option value="document">Document / PDF</option>
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button type="button" className="outline-btn" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={16} />
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
