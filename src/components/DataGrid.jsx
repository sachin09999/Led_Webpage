'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, PlaySquare, PenTool, Image as ImageIcon, PieChart, LifeBuoy, Eye, Edit3, Trash2, Play, FolderInput } from 'lucide-react';
import { deleteFile } from '@/actions/fileActions';
import { getFolders } from '@/actions/folderActions';
import { useRouter } from 'next/navigation';
import EditMaterialModal from './EditMaterialModal';
import MoveFileModal from './MoveFileModal';

const iconMap = {
    FileText,
    PlaySquare,
    PenTool,
    ImageIcon,
    PieChart,
    LifeBuoy
};

export default function DataGrid({ files, onFileClick, onEdit, onDelete }) {
    const router = useRouter();
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const [movingFile, setMovingFile] = useState(null);
    const [availableFolders, setAvailableFolders] = useState([]);
    const menuRef = useRef(null);

    // Fetch folders for moving files
    useEffect(() => {
        getFolders().then(setAvailableFolders).catch(console.error);
    }, [movingFile]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!files || files.length === 0) {
        return <p className="text-gray" style={{ padding: '16px 24px' }}>No items found in this folder.</p>;
    }

    const handleDeleteItem = async (file, e) => {
        if (e) e.stopPropagation();
        setOpenMenuId(null);
        if (onDelete) {
            onDelete(file.id);
        } else {
            if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                try {
                    await deleteFile(file.id);
                    router.refresh();
                } catch (err) {
                    console.error("Failed to delete file:", err);
                    alert("Error deleting item.");
                }
            }
        }
    };

    const handleEditItem = (file, e) => {
        if (e) e.stopPropagation();
        setOpenMenuId(null);
        if (onEdit) {
            onEdit(file);
        } else {
            setEditingFile(file);
        }
    };

    const handleMoveItem = (file, e) => {
        if (e) e.stopPropagation();
        setOpenMenuId(null);
        setMovingFile(file);
    };

    return (
        <div className="data-grid-container">
            {files.map((file, idx) => {
                const Icon = iconMap[file.icon] || FileText;
                const isMenuOpen = openMenuId === (file.id || idx);

                // Resolve hostname dynamically if URL is MinIO
                const rawUrl = file.url || '';
                let resolvedUrl = rawUrl;
                if (typeof window !== 'undefined' && rawUrl.includes(':9005')) {
                    const currentHost = window.location.hostname;
                    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
                        resolvedUrl = rawUrl.replace(/localhost:9005/g, `${currentHost}:9005`)
                                           .replace(/127\.0\.0\.1:9005/g, `${currentHost}:9005`);
                    }
                }

                const isVideo = resolvedUrl.match(/\.(mp4|webm|ogg)$/i) || file.type === 'video';
                const isImage = resolvedUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || file.type === 'image';

                return (
                    <div 
                        key={file.id || idx} 
                        className="grid-card"
                        onClick={() => onFileClick && onFileClick(file)}
                    >
                        {/* Media Preview / Icon Banner */}
                        <div className="grid-card-media">
                            {isImage ? (
                                <img src={resolvedUrl} alt={file.name} loading="lazy" />
                            ) : isVideo ? (
                                <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <video src={resolvedUrl} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                    <div style={{ position: 'absolute', padding: '12px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.9)', color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Play size={20} fill="#ffffff" />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px' }}>
                                    <Icon className={file.iconColor} size={44} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {file.type || 'DOCUMENT'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="grid-card-body">
                            <h4 className="grid-card-title" title={file.name}>{file.name}</h4>
                            
                            <div className="grid-card-footer">
                                <span className={`tag ${file.tagColor}`}>{file.category}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{file.date}</span>
                                    
                                    {/* Action Popover Menu */}
                                    <div style={{ position: 'relative' }} ref={isMenuOpen ? menuRef : null}>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setOpenMenuId(isMenuOpen ? null : (file.id || idx));
                                            }}
                                            title="Actions"
                                            style={{
                                                padding: '4px 6px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: isMenuOpen ? 'var(--border-color)' : 'transparent',
                                                cursor: 'pointer',
                                                color: 'var(--text-main)',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {isMenuOpen && (
                                            <div 
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    bottom: '100%',
                                                    marginBottom: '4px',
                                                    width: '150px',
                                                    background: 'var(--card-bg, #ffffff)',
                                                    border: '1px solid var(--border-color, #e5e7eb)',
                                                    borderRadius: '10px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                                    zIndex: 100,
                                                    padding: '4px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px'
                                                }}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <button 
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        if (onFileClick) onFileClick(file);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '7px 10px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: 'var(--text-main)',
                                                        fontSize: '0.85rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Eye size={14} />
                                                    <span>View Item</span>
                                                </button>

                                                <button 
                                                    onClick={(e) => handleEditItem(file, e)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '7px 10px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: 'var(--text-main)',
                                                        fontSize: '0.85rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Edit3 size={14} />
                                                    <span>Edit Item</span>
                                                </button>

                                                <button 
                                                    onClick={(e) => handleMoveItem(file, e)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '7px 10px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: 'var(--text-main)',
                                                        fontSize: '0.85rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FolderInput size={14} />
                                                    <span>Move to Folder</span>
                                                </button>

                                                <button 
                                                    onClick={(e) => handleDeleteItem(file, e)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '7px 10px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        fontSize: '0.85rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                    <span>Delete Item</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Edit Material Modal Overlay */}
            {editingFile && (
                <EditMaterialModal 
                    file={editingFile} 
                    onClose={() => setEditingFile(null)} 
                    onUpdated={() => router.refresh()} 
                />
            )}

            {/* Move File Modal Overlay */}
            {movingFile && (
                <MoveFileModal 
                    file={movingFile}
                    folders={availableFolders}
                    onClose={() => setMovingFile(null)}
                    onMoved={() => router.refresh()}
                />
            )}
        </div>
    );
}
