'use client';

import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import DataGrid from './DataGrid';
import AddMaterialModal from './AddMaterialModal';
import CreateFolderModal from './CreateFolderModal';
import FolderGrid from './FolderGrid';
import FolderBreadcrumbs from './FolderBreadcrumbs';
import { useFileViewer } from '@/context/FileViewerContext';
import { Plus, LayoutList, LayoutGrid, FolderPlus, FolderOpen } from 'lucide-react';
import { getFolders } from '@/actions/folderActions';

export default function RecentFilesTable({ 
    files = [], 
    title, 
    category = 'Docs', 
    dashboardSlug = 'ledwalldocs',
    showAddButton = true 
}) {
    const { setActiveFile } = useFileViewer();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    // Initialize view mode from localStorage
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('wafi_view_mode');
            if (saved === 'grid' || saved === 'list') return saved;
        }
        return 'list';
    });

    const loadFolders = () => {
        getFolders().then(allFolders => {
            const filtered = allFolders.filter(f => {
                const matchDash = !dashboardSlug || f.dashboardSlug?.toLowerCase() === dashboardSlug.toLowerCase();
                const matchCat = !category || f.category?.toLowerCase() === category.toLowerCase();
                return matchDash && matchCat;
            });
            setFolders(filtered);
            
            // If current active folder was deleted, navigate back to root
            if (currentFolder && !allFolders.some(f => f.id === currentFolder.id)) {
                setCurrentFolder(null);
                setBreadcrumbs([]);
            }
        }).catch(console.error);
    };

    // Fetch folders strictly matching current category & dashboard
    useEffect(() => {
        loadFolders();
    }, [category, dashboardSlug, isCreateFolderOpen]);

    const handleViewToggle = (mode) => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('wafi_view_mode', mode);
        }
    };

    const handleOpenFolder = (folder) => {
        setCurrentFolder(folder);
        setBreadcrumbs(prev => [...prev, folder]);
    };

    const handleNavigateBreadcrumb = (folderId) => {
        if (!folderId) {
            setCurrentFolder(null);
            setBreadcrumbs([]);
        } else {
            const idx = breadcrumbs.findIndex(b => b.id === folderId);
            if (idx !== -1) {
                const newCrumbs = breadcrumbs.slice(0, idx + 1);
                setBreadcrumbs(newCrumbs);
                setCurrentFolder(newCrumbs[newCrumbs.length - 1]);
            }
        }
    };

    // Compute visible folders inside current directory
    const currentParentId = currentFolder ? currentFolder.id : null;
    const visibleFolders = folders.filter(f => (f.parentId || null) === currentParentId);

    // Compute visible files inside current directory
    const visibleFiles = files.filter(f => {
        if (currentFolder) {
            return f.folderId === currentFolder.id;
        }
        // At root level, match only loose files without folderId
        return !f.folderId || f.folderId === null;
    });

    // Files to display (strictly inside active folder, or loose root files if any)
    const displayFiles = visibleFiles;

    const buttonLabel = category ? `Add ${category}` : 'Add Item';

    return (
        <div className="recent-files" style={{ padding: '24px' }}>
            {/* Header Toolbar */}
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    {title && <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>{title}</h2>}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* View Mode Toggle Switch */}
                    <div className="view-toggle-group" style={{ background: 'var(--bg-main, #f3f4f6)', padding: '3px', borderRadius: '10px' }}>
                        <button
                            type="button"
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => handleViewToggle('list')}
                            title="List View"
                        >
                            <LayoutList size={18} />
                        </button>
                        <button
                            type="button"
                            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => handleViewToggle('grid')}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    {showAddButton && (
                        <>
                            <button 
                                type="button"
                                className="outline-btn" 
                                onClick={() => setIsCreateFolderOpen(true)}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    padding: '8px 14px',
                                    fontSize: '0.85rem',
                                    borderRadius: '8px',
                                    fontWeight: 500
                                }}
                            >
                                <FolderPlus size={17} style={{ color: '#f59e0b' }} />
                                <span>New Folder</span>
                            </button>

                            <button 
                                className="primary-btn" 
                                onClick={() => setIsAddOpen(true)}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    padding: '8px 16px',
                                    fontSize: '0.85rem',
                                    borderRadius: '8px',
                                    fontWeight: 500
                                }}
                            >
                                <Plus size={18} />
                                <span>{buttonLabel}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Google Drive Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
                <FolderBreadcrumbs 
                    categoryName={category || title || 'All Files'} 
                    breadcrumbs={breadcrumbs} 
                    onNavigate={handleNavigateBreadcrumb} 
                />
            )}

            {/* Folders Grid / List */}
            <FolderGrid 
                folders={visibleFolders} 
                files={files} 
                viewMode={viewMode}
                onOpenFolder={handleOpenFolder} 
                onRefresh={loadFolders}
            />

            {/* Sub-heading for files if inside a folder */}
            {currentFolder && (
                <div style={{ marginBottom: '14px', marginTop: '12px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted, #6b7280)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Items in {currentFolder.name} ({displayFiles.length})
                    </h3>
                </div>
            )}

            {/* Files View or Empty State (Only shown if inside a folder OR if loose files exist at root) */}
            {(currentFolder || displayFiles.length > 0) && (
                displayFiles.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px 24px',
                        background: 'var(--card-bg, #ffffff)',
                        borderRadius: '16px',
                        border: '1px dashed var(--border-color, #e5e7eb)',
                        textAlign: 'center',
                        marginTop: '12px'
                    }}>
                        <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', marginBottom: '12px' }}>
                            <FolderOpen size={36} />
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main, #111827)' }}>
                            This folder is empty
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)', maxWidth: '360px' }}>
                            There are no items inside this folder yet. Click below to add your first file.
                        </p>
                        <button
                            type="button"
                            className="primary-btn"
                            onClick={() => setIsAddOpen(true)}
                            style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem' }}
                        >
                            <Plus size={16} />
                            <span>Add File to Folder</span>
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <DataGrid files={displayFiles} onFileClick={(file) => setActiveFile(file, displayFiles)} />
                ) : (
                    <DataTable files={displayFiles} onFileClick={(file) => setActiveFile(file, displayFiles)} />
                )
            )}

            {/* Add File Modal */}
            <AddMaterialModal 
                key={`${category}-${dashboardSlug}-${currentFolder?.id || 'root'}`}
                isOpen={isAddOpen} 
                onClose={() => setIsAddOpen(false)} 
                defaultCategory={category}
                defaultDashboardSlug={dashboardSlug}
                lockDashboard={true}
                lockCategory={true}
                currentFolderId={currentFolder?.id || null}
            />

            {/* Create Folder Modal */}
            <CreateFolderModal 
                isOpen={isCreateFolderOpen} 
                onClose={() => setIsCreateFolderOpen(false)} 
                category={category}
                dashboardSlug={dashboardSlug}
                parentId={currentFolder?.id || null}
            />
        </div>
    );
}
