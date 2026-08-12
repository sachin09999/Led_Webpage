'use client';

import { useState } from 'react';
import { addFile, updateFile, deleteFile } from '@/actions/fileActions';
import DataTable from '@/components/DataTable';

export default function AdminClient({ initialFiles }) {
    const [editingId, setEditingId] = useState(null);
    
    // For the form
    const [formData, setFormData] = useState({
        name: '', url: '', category: 'LED Wall Docs', type: 'document'
    });

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', url: '', category: 'LED Wall Docs', type: 'document' });
    };

    const handleEdit = (file) => {
        setEditingId(file.id);
        setFormData({
            name: file.name,
            url: file.url,
            category: file.category,
            type: file.type
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this file?")) {
            await deleteFile(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, val]) => data.append(key, val));

        if (editingId) {
            await updateFile(editingId, data);
        } else {
            await addFile(data);
        }
        resetForm();
    };

    return (
        <div>
            <section className="recent-files" style={{ marginBottom: '32px', padding: '24px' }}>
                <div className="section-header" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
                    <h2>{editingId ? 'Edit Material' : 'Add New Material'}</h2>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-gray">Name / Title</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-gray">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}>
                                <option>LED Wall Docs</option>
                                <option>Videos</option>
                                <option>Drawings</option>
                                <option>Pictures</option>
                                <option>Finance Data</option>
                                <option>Support Data</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-gray">File URL / Link</label>
                            <input required type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-gray">Type</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}>
                                <option value="document">Document / PDF</option>
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <button type="submit" className="primary-btn">{editingId ? 'Save Changes' : 'Add Material'}</button>
                        {editingId && <button type="button" className="outline-btn" onClick={resetForm}>Cancel</button>}
                    </div>
                </form>
            </section>

            <section className="recent-files">
                <div className="section-header">
                    <h2>Manage Materials</h2>
                </div>
                <DataTable files={initialFiles} onEdit={handleEdit} onDelete={handleDelete} />
            </section>
        </div>
    );
}
