'use client';
import { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, Trash2, Edit2, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteFolder, renameFolder } from '@/actions/folderActions';

export default function FolderGrid({ 
    folders = [], 
    files = [], 
    viewMode = 'grid',
    onOpenFolder,
    onRefresh 
}) {
    const router = useRouter();
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const menuRef = useRef(null);

    // Close 3-dots menu when clicking anywhere outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        if (activeMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [activeMenuId]);

    if (!folders || folders.length === 0) return null;

    const handleStartRename = (folder) => {
        setEditingFolderId(folder.id);
        setEditingName(folder.name);
        setActiveMenuId(null);
    };

    const handleSaveRename = async (id) => {
        if (editingName.trim()) {
            try {
                await renameFolder(id, editingName.trim());
                if (onRefresh) onRefresh();
                router.refresh();
            } catch (err) {
                console.error("Failed to rename folder:", err);
            }
        }
        setEditingFolderId(null);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this folder? Files inside will be moved to the main view.')) {
            try {
                await deleteFolder(id);
                if (onRefresh) onRefresh();
                router.refresh();
            } catch (err) {
                console.error("Failed to delete folder:", err);
                alert("Failed to delete folder. Please try again.");
            }
        }
        setActiveMenuId(null);
    };

    const isListView = viewMode === 'list';

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted, #6b7280)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Folders ({folders.length})
                </h3>
            </div>

            <div style={isListView ? { display: 'flex', flexDirection: 'column', gap: '8px' } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                {folders.map(folder => {
                    const itemCount = files.filter(f => f.folderId === folder.id).length;
                    const isMenuOpen = activeMenuId === folder.id;
                    const isEditing = editingFolderId === folder.id;

                    const catLower = (folder.category || '').toLowerCase();
                    const theme = catLower.includes('video') ? { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }
                                : catLower.includes('drawing') ? { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
                                : catLower.includes('picture') || catLower.includes('image') ? { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
                                : catLower.includes('finance') ? { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }
                                : { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };

                    if (isListView) {
                        return (
                            <div
                                key={folder.id}
                                onClick={() => onOpenFolder(folder)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    background: 'var(--card-bg, #ffffff)',
                                    border: '1px solid var(--border-color, #e5e7eb)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                className="folder-list-row"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                        padding: '8px', 
                                        borderRadius: '10px', 
                                        background: theme.bg, 
                                        color: theme.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Folder size={18} fill={theme.color} fillOpacity={0.2} />
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '16px' }}>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(folder.id)}
                                                onBlur={() => handleSaveRename(folder.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                                style={{
                                                    width: '200px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #3b82f6',
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                        ) : (
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main, #111827)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {folder.name}
                                            </h4>
                                        )}

                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', fontWeight: 500 }}>
                                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                        </p>
                                    </div>
                                </div>

                                {/* Folder Menu Actions */}
                                <div ref={isMenuOpen ? menuRef : null} style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(isMenuOpen ? null : folder.id);
                                        }}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: 'var(--text-muted, #9ca3af)',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {isMenuOpen && (
                                        <div 
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                zIndex: 20,
                                                minWidth: '130px',
                                                background: 'var(--card-bg, #ffffff)',
                                                border: '1px solid var(--border-color, #e5e7eb)',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                padding: '4px 0'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onOpenFolder(folder);
                                                    setActiveMenuId(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-main)'
                                                }}
                                            >
                                                <FolderOpen size={14} />
                                                <span>Open</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleStartRename(folder)}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-main)'
                                                }}
                                            >
                                                <Edit2 size={14} />
                                                <span>Rename</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(folder.id)}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={folder.id}
                            onClick={() => onOpenFolder(folder)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                borderRadius: '14px',
                                background: 'var(--card-bg, #ffffff)',
                                border: '1px solid var(--border-color, #e5e7eb)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative'
                            }}
                            className="folder-card"
                        >
                            <div 
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}
                            >
                                <div style={{ 
                                    padding: '10px', 
                                    borderRadius: '12px', 
                                    background: theme.bg, 
                                    color: theme.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Folder size={22} fill={theme.color} fillOpacity={0.2} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(folder.id)}
                                            onBlur={() => handleSaveRename(folder.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                            style={{
                                                width: '100%',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                border: '1px solid #3b82f6',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main, #111827)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {folder.name}
                                            </h4>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted, #6b7280)', fontWeight: 500 }}>
                                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Folder Menu Actions */}
                            <div ref={isMenuOpen ? menuRef : null} style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(isMenuOpen ? null : folder.id);
                                    }}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--text-muted, #9ca3af)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {isMenuOpen && (
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            zIndex: 20,
                                            minWidth: '130px',
                                            background: 'var(--card-bg, #ffffff)',
                                            border: '1px solid var(--border-color, #e5e7eb)',
                                            borderRadius: '8px',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '4px 0'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onOpenFolder(folder);
                                                setActiveMenuId(null);
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                color: 'var(--text-main)'
                                            }}
                                        >
                                            <FolderOpen size={14} />
                                            <span>Open</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleStartRename(folder)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                color: 'var(--text-main)'
                                            }}
                                        >
                                            <Edit2 size={14} />
                                            <span>Rename</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(folder.id)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                color: '#ef4444'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
