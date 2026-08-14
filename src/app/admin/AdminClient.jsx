'use client';

import { useState } from 'react';
import { addFile, updateFile, deleteFile } from '@/actions/fileActions';
import { addDashboard, updateDashboard, deleteDashboard } from '@/actions/dashboardActions';
import DataTable from '@/components/DataTable';
import DynamicIcon, { availableIcons } from '@/components/IconHelper';
import Link from 'next/link';
import { Plus, Trash2, Edit3, ExternalLink, Layers, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function AdminClient({ initialFiles = [], initialDashboards = [], scopedDashSlug = '' }) {
    const scopedDashObj = scopedDashSlug 
        ? initialDashboards.find(d => d.slug.toLowerCase() === scopedDashSlug.toLowerCase()) 
        : null;

    const defaultSlug = scopedDashObj ? scopedDashObj.slug : (initialDashboards[0]?.slug || 'ledwalldocs');

    const [activeTab, setActiveTab] = useState(scopedDashSlug ? 'materials' : 'dashboards'); // 'dashboards' | 'materials'

    // Preset banner image wallpapers
    const presetBanners = [
        { label: 'Cyber Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80' },
        { label: 'Abstract Neon', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80' },
        { label: 'Water / Blue', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1920&q=80' },
        { label: 'Factory / Tech', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80' },
        { label: 'Solar & Energy', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1920&q=80' }
    ];

    // Dashboard Form State
    const [editingDashId, setEditingDashId] = useState(null);
    const [dashForm, setDashForm] = useState({
        name: '',
        slug: '',
        headerTitle: '',
        description: '',
        heroSubtitle: '',
        icon: 'MonitorPlay',
        bgClass: '',
        bannerUrl: '',
        categoriesText: 'Docs, Videos, Drawings, Pictures'
    });

    // Material Form State
    const [editingMaterialId, setEditingMaterialId] = useState(null);
    const [selectedDashSlug, setSelectedDashSlug] = useState(defaultSlug);
    const [materialForm, setMaterialForm] = useState({
        name: '',
        url: '',
        category: '',
        type: 'document',
        dashboardSlug: defaultSlug
    });

    const activeDashObj = initialDashboards.find(d => d.slug === (materialForm.dashboardSlug || selectedDashSlug)) || initialDashboards[0];
    const categoryOptions = activeDashObj ? (activeDashObj.categories || []).map(c => c.name) : ['Docs', 'Videos', 'Drawings'];

    // Reset Dashboard Form
    const resetDashForm = () => {
        setEditingDashId(null);
        setDashForm({
            name: '',
            slug: '',
            headerTitle: '',
            description: '',
            heroSubtitle: '',
            icon: 'MonitorPlay',
            bgClass: '',
            bannerUrl: '',
            categoriesText: 'Docs, Videos, Drawings, Pictures'
        });
    };

    // Reset Material Form
    const resetMaterialForm = () => {
        setEditingMaterialId(null);
        setMaterialForm({
            name: '',
            url: '',
            category: categoryOptions[0] || '',
            type: 'document',
            dashboardSlug: selectedDashSlug
        });
    };

    // Edit Dashboard Handler
    const handleEditDash = (dash) => {
        setEditingDashId(dash.id);
        const catNames = (dash.categories || []).map(c => c.name).join(', ');
        setDashForm({
            name: dash.name || '',
            slug: dash.slug || '',
            headerTitle: dash.headerTitle || dash.name || '',
            description: dash.description || '',
            heroSubtitle: dash.heroSubtitle || '',
            icon: dash.icon || 'MonitorPlay',
            bgClass: dash.bgClass || '',
            bannerUrl: dash.bannerUrl || '',
            categoriesText: catNames
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete Dashboard Handler
    const handleDeleteDash = async (id, name) => {
        if (confirm(`Are you sure you want to delete dashboard "${name}"?`)) {
            await deleteDashboard(id);
        }
    };

    // Dashboard Form Submit
    const handleDashSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', dashForm.name);
        data.append('slug', dashForm.slug || dashForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        data.append('headerTitle', dashForm.headerTitle || dashForm.name);
        data.append('description', dashForm.description);
        data.append('heroSubtitle', dashForm.heroSubtitle);
        data.append('icon', dashForm.icon);
        data.append('bgClass', dashForm.bgClass);
        data.append('bannerUrl', dashForm.bannerUrl);

        // Convert comma separated categories string into array
        const rawCats = dashForm.categoriesText.split(',').map(s => s.trim()).filter(Boolean);
        const catsArr = rawCats.map(catName => ({
            id: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: catName,
            tag: 'Files',
            description: `Documents and records for ${catName}.`
        }));
        data.append('categories', JSON.stringify(catsArr));

        if (editingDashId) {
            await updateDashboard(editingDashId, data);
        } else {
            await addDashboard(data);
        }
        resetDashForm();
    };

    // Material Form Submit
    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', materialForm.name);
        data.append('url', materialForm.url);
        data.append('category', materialForm.category || categoryOptions[0] || 'Docs');
        data.append('type', materialForm.type);
        data.append('dashboardSlug', materialForm.dashboardSlug);

        if (editingMaterialId) {
            await updateFile(editingMaterialId, data);
        } else {
            await addFile(data);
        }
        resetMaterialForm();
    };

    // Edit Material Handler
    const handleEditMaterial = (file) => {
        setEditingMaterialId(file.id);
        setMaterialForm({
            name: file.name,
            url: file.url,
            category: file.category,
            type: file.type || 'document',
            dashboardSlug: file.dashboardSlug || selectedDashSlug
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete Material Handler
    const handleDeleteMaterial = async (id) => {
        if (confirm("Are you sure you want to delete this material?")) {
            await deleteFile(id);
        }
    };

    return (
        <div>
            {/* Header & Tabs */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                        {scopedDashObj ? `${scopedDashObj.name} Admin Panel` : 'Main Dashboard Admin Panel'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {scopedDashObj 
                            ? `Manage templates, categories, and shared materials specifically for ${scopedDashObj.name}.` 
                            : 'Create new project dashboards dynamically and manage shared templates & materials.'}
                    </p>
                </div>
                
                {/* Tab Switcher (Only show on Main Hub Admin Panel) */}
                {!scopedDashObj && (
                    <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '4px' }}>
                        <button 
                            onClick={() => setActiveTab('dashboards')}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                background: activeTab === 'dashboards' ? 'var(--primary-blue)' : 'transparent',
                                color: activeTab === 'dashboards' ? '#fff' : 'var(--text-main)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Layers size={18} />
                            <span>Manage Dashboards ({initialDashboards.length})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('materials')}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                background: activeTab === 'materials' ? 'var(--primary-blue)' : 'transparent',
                                color: activeTab === 'materials' ? '#fff' : 'var(--text-main)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FileText size={18} />
                            <span>Manage Materials ({initialFiles.length})</span>
                        </button>
                    </div>
                )}
            </div>

            {/* TAB 1: DASHBOARDS MANAGEMENT */}
            {activeTab === 'dashboards' && (
                <>
                    {/* Add / Edit Dashboard Form */}
                    <section className="recent-files" style={{ marginBottom: '32px', padding: '24px' }}>
                        <div className="section-header" style={{ padding: '0 0 20px 0', borderBottom: 'none' }}>
                            <h2>{editingDashId ? 'Edit Dashboard Template' : 'Create New Dashboard Template'}</h2>
                        </div>
                        <form onSubmit={handleDashSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Dashboard Name *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="e.g. LED Wall Specs / Solar Plant"
                                        value={dashForm.name} 
                                        onChange={e => {
                                            const val = e.target.value;
                                            const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                            setDashForm({
                                                ...dashForm, 
                                                name: val,
                                                slug: editingDashId ? dashForm.slug : autoSlug,
                                                headerTitle: editingDashId ? dashForm.headerTitle : val
                                            });
                                        }} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>URL Slug (Route Path e.g. /ledwalldocs) *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="e.g. ledwalldocs"
                                        value={dashForm.slug} 
                                        onChange={e => setDashForm({...dashForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Icon</label>
                                    <select 
                                        value={dashForm.icon} 
                                        onChange={e => setDashForm({...dashForm, icon: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        {availableIcons.map(ic => (
                                            <option key={ic} value={ic}>{ic}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Short Description (For Main Dashboard card)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Inverter specs, wiring diagrams, and generation logs."
                                        value={dashForm.description} 
                                        onChange={e => setDashForm({...dashForm, description: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Hero Subtitle (Header banner description)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. All essential operations data and documents in one place."
                                        value={dashForm.heroSubtitle} 
                                        onChange={e => setDashForm({...dashForm, heroSubtitle: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                            </div>

                            {/* Banner Image Input & Preset Pickers */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ImageIcon size={16} />
                                    <span>Header Banner Image URL (Optional custom wallpaper)</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="https://images.unsplash.com/... or custom image link"
                                    value={dashForm.bannerUrl} 
                                    onChange={e => setDashForm({...dashForm, bannerUrl: e.target.value})} 
                                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                />

                                {/* Preset Banner Wallpapers */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preset Wallpapers:</span>
                                    {presetBanners.map(p => (
                                        <button 
                                            key={p.label}
                                            type="button" 
                                            onClick={() => setDashForm({ ...dashForm, bannerUrl: p.url })}
                                            className="outline-btn"
                                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                    {dashForm.bannerUrl && (
                                        <button 
                                            type="button" 
                                            onClick={() => setDashForm({ ...dashForm, bannerUrl: '' })}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            Clear Banner
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Categories (Comma separated names)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Docs, Videos, Drawings, Pictures, Finance Data"
                                    value={dashForm.categoriesText} 
                                    onChange={e => setDashForm({...dashForm, categoriesText: e.target.value})} 
                                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={18} />
                                    <span>{editingDashId ? 'Update Dashboard' : 'Create Dashboard Template'}</span>
                                </button>
                                {editingDashId && <button type="button" className="outline-btn" onClick={resetDashForm}>Cancel</button>}
                            </div>
                        </form>
                    </section>

                    {/* Existing Dashboards Grid */}
                    <section className="recent-files" style={{ padding: '24px' }}>
                        <div className="section-header" style={{ padding: '0 0 20px 0' }}>
                            <h2>Active Project Dashboards ({initialDashboards.length})</h2>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {initialDashboards.map(dash => (
                                <div key={dash.id || dash.slug} style={{
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="card-icon blue-icon" style={{ width: '42px', height: '42px', borderRadius: '8px' }}>
                                                    <DynamicIcon name={dash.icon || 'MonitorPlay'} size={22} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{dash.name}</h3>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: 500 }}>/{dash.slug}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{dash.description}</p>
                                        
                                        {/* Categories tags */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {(dash.categories || []).map(cat => (
                                                <span key={cat.id || cat.name} className={`tag ${cat.tagClass || 'blue-tag'}`} style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <DynamicIcon name={cat.icon || 'FileText'} size={12} />
                                                    <span>{cat.name}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                        <Link href={`/${dash.slug}`} style={{ textDecoration: 'none', color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>Visit Dashboard Path</span>
                                            <ExternalLink size={14} />
                                        </Link>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditDash(dash)} className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                                <Edit3 size={14} />
                                                <span>Edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteDash(dash.id, dash.name)} className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* TAB 2: MATERIALS MANAGEMENT */}
            {activeTab === 'materials' && (
                <>
                    <section className="recent-files" style={{ marginBottom: '32px', padding: '24px' }}>
                        <div className="section-header" style={{ padding: '0 0 20px 0', borderBottom: 'none' }}>
                            <h2>{editingMaterialId ? 'Edit Material' : 'Add New Material'}</h2>
                        </div>
                        <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                {!scopedDashObj && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Target Dashboard</label>
                                        <select 
                                            value={materialForm.dashboardSlug} 
                                            onChange={e => {
                                                const newDashSlug = e.target.value;
                                                setSelectedDashSlug(newDashSlug);
                                                const dObj = initialDashboards.find(d => d.slug === newDashSlug);
                                                const firstCat = dObj?.categories?.[0]?.name || 'Docs';
                                                setMaterialForm({
                                                    ...materialForm, 
                                                    dashboardSlug: newDashSlug,
                                                    category: firstCat
                                                });
                                            }} 
                                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
                                        >
                                            {initialDashboards.map(d => (
                                                <option key={d.slug} value={d.slug}>{d.name} (/{d.slug})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Category</label>
                                    <select 
                                        value={materialForm.category} 
                                        onChange={e => setMaterialForm({...materialForm, category: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        {categoryOptions.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Media / File Type</label>
                                    <select 
                                        value={materialForm.type} 
                                        onChange={e => setMaterialForm({...materialForm, type: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        <option value="document">Document / PDF</option>
                                        <option value="video">Video</option>
                                        <option value="image">Image</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Name / Title *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="File title"
                                        value={materialForm.name} 
                                        onChange={e => setMaterialForm({...materialForm, name: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 500 }}>File URL / Download Link *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="https://..."
                                        value={materialForm.url} 
                                        onChange={e => setMaterialForm({...materialForm, url: e.target.value})} 
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button type="submit" className="primary-btn">{editingMaterialId ? 'Save Changes' : 'Add Material'}</button>
                                {editingMaterialId && <button type="button" className="outline-btn" onClick={resetMaterialForm}>Cancel</button>}
                            </div>
                        </form>
                    </section>

                    <section className="recent-files">
                        <div className="section-header">
                            <h2>
                                {scopedDashObj ? `Shared Materials for ${scopedDashObj.name}` : 'Manage Shared Materials'} ({
                                    (scopedDashObj 
                                        ? initialFiles.filter(f => (f.dashboardSlug || 'ledwalldocs').toLowerCase() === scopedDashObj.slug.toLowerCase())
                                        : initialFiles
                                    ).length
                                })
                            </h2>
                        </div>
                        <DataTable 
                            files={
                                scopedDashObj 
                                    ? initialFiles.filter(f => (f.dashboardSlug || 'ledwalldocs').toLowerCase() === scopedDashObj.slug.toLowerCase())
                                    : initialFiles
                            } 
                            onEdit={handleEditMaterial} 
                            onDelete={handleDeleteMaterial} 
                        />
                    </section>
                </>
            )}
        </div>
    );
}
