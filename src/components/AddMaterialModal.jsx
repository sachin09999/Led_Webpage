'use client';

import { useState, useEffect } from 'react';
import { X, Plus, UploadCloud, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';
import { addFile, uploadFileToMinIOAction } from '@/actions/fileActions';
import { getDashboards } from '@/actions/dashboardActions';
import { useRouter } from 'next/navigation';

export default function AddMaterialModal({ 
    isOpen, 
    onClose, 
    defaultCategory = 'Docs',
    defaultDashboardSlug = 'ledwalldocs',
    lockDashboard = true,
    lockCategory = false,
    dashboardsProp = [],
    currentFolderId = null
}) {
    const router = useRouter();
    const [mode, setMode] = useState('file'); // 'file' (upload) | 'link' (URL link)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [allDashboards, setAllDashboards] = useState(dashboardsProp);

    // Form state
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dashboardSlug, setDashboardSlug] = useState(defaultDashboardSlug);
    const [category, setCategory] = useState(defaultCategory);
    const [type, setType] = useState(() => {
        const catLower = (defaultCategory || '').toLowerCase();
        if (catLower.includes('video')) return 'video';
        if (catLower.includes('picture') || catLower.includes('photo') || catLower.includes('image')) return 'image';
        return 'document';
    });

    // Fetch dashboards dynamically on mount or when opened
    useEffect(() => {
        if (isOpen) {
            getDashboards().then(dashList => {
                if (dashList && dashList.length > 0) {
                    setAllDashboards(dashList);
                }
            }).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Find active dashboard object
    const activeDashboard = allDashboards.find(
        d => d.slug.toLowerCase() === dashboardSlug.toLowerCase()
    ) || allDashboards[0];

    // Compute category options strictly belonging to active dashboard
    const categoryOptions = activeDashboard && activeDashboard.categories && activeDashboard.categories.length > 0
        ? activeDashboard.categories.map(c => c.name)
        : [defaultCategory];

    // Dynamic upload guidance based on category & type
    const getUploadGuidance = () => {
        const catLower = (category || defaultCategory || '').toLowerCase();
        const typeLower = (type || '').toLowerCase();

        if (catLower.includes('video') || typeLower === 'video') {
            return {
                prompt: 'Click or drop video files here',
                accept: 'video/*'
            };
        }
        if (catLower.includes('picture') || catLower.includes('photo') || catLower.includes('image') || typeLower === 'image') {
            return {
                prompt: 'Click or drop image files here',
                accept: 'image/*'
            };
        }
        if (catLower.includes('drawing')) {
            return {
                prompt: 'Click or drop drawing files here',
                accept: '.pdf,.dwg,.dxf,.png,.jpg,.jpeg,.docx,.doc'
            };
        }
        if (catLower.includes('finance') || catLower.includes('support')) {
            return {
                prompt: 'Click or drop files here',
                accept: '.pdf,.xlsx,.xls,.csv,.docx,.doc,.zip'
            };
        }
        return {
            prompt: 'Click or drop document files here',
            accept: '.pdf,.docx,.doc,.xlsx,.xls,.txt,.pptx'
        };
    };

    const uploadGuidance = getUploadGuidance();

    // Handle multiple file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            if (!name.trim()) {
                setName(files[0].name);
            }

            // Auto detect type from first file
            const first = files[0];
            if (first.type.startsWith('video/') || first.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
                setType('video');
            } else if (first.type.startsWith('image/') || first.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                setType('image');
            } else {
                setType('document');
            }
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Handle dashboard change (if unlocked)
    const handleDashboardChange = (newSlug) => {
        setDashboardSlug(newSlug);
        const newDash = allDashboards.find(d => d.slug.toLowerCase() === newSlug.toLowerCase());
        if (newDash && newDash.categories && newDash.categories.length > 0) {
            setCategory(newDash.categories[0].name);
        }
    };

    // Auto detect type from category or selection
    const handleCategoryChange = (cat) => {
        setCategory(cat);
        const catLower = cat.toLowerCase();
        if (catLower.includes('video')) setType('video');
        else if (catLower.includes('picture') || catLower.includes('photo') || catLower.includes('image')) setType('image');
        else setType('document');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setStatusMessage('');

        try {
            if (mode === 'file') {
                if (selectedFiles.length === 0) {
                    alert('Please select at least one file to upload.');
                    setIsSubmitting(false);
                    return;
                }

                // Batch upload files to MinIO
                const total = selectedFiles.length;
                for (let i = 0; i < total; i++) {
                    const currentFile = selectedFiles[i];
                    setStatusMessage(`Uploading file ${i + 1} of ${total}: ${currentFile.name}...`);

                    const uploadData = new FormData();
                    uploadData.append('file', currentFile);

                    const res = await uploadFileToMinIOAction(uploadData);
                    
                    // Determine display name
                    const displayName = (total === 1 && name.trim()) ? name.trim() : currentFile.name;

                    const formData = new FormData();
                    formData.append('name', displayName);
                    formData.append('url', res.fileUrl);
                    formData.append('category', category);
                    formData.append('type', res.fileType || type);
                    formData.append('dashboardSlug', dashboardSlug);
                    if (currentFolderId) {
                        formData.append('folderId', currentFolderId);
                    }
                    formData.append('size', res.fileSize);

                    await addFile(formData);
                }
            } else {
                // Mode 2: External link URL
                if (!name.trim()) {
                    alert('Please enter a display name.');
                    setIsSubmitting(false);
                    return;
                }
                const finalUrl = url.trim();
                if (!finalUrl) {
                    alert('Please enter a valid media URL link.');
                    setIsSubmitting(false);
                    return;
                }

                setStatusMessage('Saving item to database...');
                const formData = new FormData();
                formData.append('name', name.trim());
                formData.append('url', finalUrl);
                formData.append('category', category);
                formData.append('type', type);
                formData.append('dashboardSlug', dashboardSlug);
                if (currentFolderId) {
                    formData.append('folderId', currentFolderId);
                }
                formData.append('size', '-');

                await addFile(formData);
            }

            setIsSubmitting(false);
            setStatusMessage('');
            onClose();
            router.refresh();
        } catch (err) {
            console.error('Failed to add material:', err);
            setIsSubmitting(false);
            setStatusMessage('');
            alert('Failed to process upload. Please try again.');
        }
    };

    return (
        <div className="viewer-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
            <div 
                className="viewer-content shadow-card" 
                onClick={e => e.stopPropagation()} 
                style={{ 
                    maxWidth: '540px', 
                    height: 'auto', 
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '16px',
                    padding: '24px',
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border-color, #e5e7eb)'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Plus size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Add New Item</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Target: <strong style={{ color: 'var(--text-main)' }}>{activeDashboard ? activeDashboard.name : dashboardSlug}</strong>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-gray, #6b7280)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div style={{ display: 'flex', background: 'var(--bg-main, #f3f4f6)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={() => setMode('file')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            background: mode === 'file' ? 'var(--card-bg, #ffffff)' : 'transparent',
                            color: mode === 'file' ? 'var(--text-main, #111827)' : 'var(--text-muted, #6b7280)',
                            boxShadow: mode === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        <UploadCloud size={16} />
                        <span>Upload File(s)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('link')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            background: mode === 'link' ? 'var(--card-bg, #ffffff)' : 'transparent',
                            color: mode === 'link' ? 'var(--text-main, #111827)' : 'var(--text-muted, #6b7280)',
                            boxShadow: mode === 'link' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        <LinkIcon size={16} />
                        <span>Paste External Link</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Mode 1: File Upload Box */}
                    {mode === 'file' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                                Choose File(s) from Computer *
                            </label>
                            <div 
                                style={{
                                    border: '2px dashed var(--border-color, #d1d5db)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    background: 'var(--bg-main, #f9fafb)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <input 
                                    type="file" 
                                    multiple
                                    onChange={handleFileChange}
                                    accept={uploadGuidance.accept}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0,
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer'
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                        <UploadCloud size={24} />
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                                        {uploadGuidance.prompt}
                                    </p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>
                                        Supports selecting multiple files at once
                                    </span>
                                </div>
                            </div>

                            {/* List of selected files */}
                            {selectedFiles.length > 0 && (
                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #6b7280)' }}>
                                        Selected Files ({selectedFiles.length}):
                                    </div>
                                    <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {selectedFiles.map((file, idx) => (
                                            <div 
                                                key={`${file.name}-${idx}`} 
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '6px 10px',
                                                    borderRadius: '8px',
                                                    background: 'var(--bg-main, #f3f4f6)',
                                                    fontSize: '0.82rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                    <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                                                        {file.name}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.75rem', flexShrink: 0 }}>
                                                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(idx)}
                                                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px 4px' }}
                                                    title="Remove file"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mode 2: Link Input */}
                    {mode === 'link' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                                File URL / Media Link *
                            </label>
                            <input 
                                type="url" 
                                className="search-input"
                                placeholder="https://example.com/document.pdf or video.mp4" 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required={mode === 'link'}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--bg-main, #f9fafb)' }}
                            />
                        </div>
                    )}

                    {/* Title / File Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                            Title / Display Name *
                        </label>
                        <input 
                            type="text" 
                            className="search-input"
                            placeholder="e.g. Installation Guide Part 2.pdf" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--bg-main, #f9fafb)' }}
                        />
                    </div>

                    {/* Category & Media Type (Only displayed if lockCategory is false) */}
                    {!lockCategory && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                                    Category
                                </label>
                                <select 
                                    value={category} 
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px 12px', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--border-color, #d1d5db)', 
                                        background: 'var(--bg-main, #f9fafb)', 
                                        color: 'inherit',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                                    Media Type
                                </label>
                                <select 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--bg-main, #f9fafb)', color: 'inherit' }}
                                >
                                    <option value="document">📄 Document (PDF / Doc)</option>
                                    <option value="video">🎥 Video (MP4)</option>
                                    <option value="image">🖼️ Picture / Image</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Location Selection */}
                    {!lockDashboard && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                                Dashboard Location
                            </label>
                            <select 
                                value={dashboardSlug} 
                                onChange={(e) => handleDashboardChange(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', background: 'var(--bg-main, #f9fafb)', color: 'inherit' }}
                            >
                                {allDashboards.map(d => (
                                    <option key={d.slug} value={d.slug}>{d.name || d.headerTitle || d.slug}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Upload / Processing Status Notice */}
                    {isSubmitting && statusMessage && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    {/* Submit Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
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
                            {isSubmitting ? 'Processing...' : mode === 'file' ? (selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : 'Upload & Add Item') : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
