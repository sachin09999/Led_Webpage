'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, FileText, PlaySquare, PenTool, Image as ImageIcon, PieChart, LifeBuoy, Eye, Edit3, Trash2 } from 'lucide-react';
import { deleteFile } from '@/actions/fileActions';
import { useRouter } from 'next/navigation';
import EditMaterialModal from './EditMaterialModal';

const iconMap = {
    FileText,
    PlaySquare,
    PenTool,
    ImageIcon,
    PieChart,
    LifeBuoy
};

export default function DataTable({ files, onFileClick, onEdit, onDelete }) {
    const router = useRouter();
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const menuRef = useRef(null);

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
        return <p className="text-gray" style={{ padding: '16px 24px' }}>No files found.</p>;
    }

    const handleDeleteItem = async (file) => {
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

    const handleEditItem = (file) => {
        setOpenMenuId(null);
        if (onEdit) {
            onEdit(file);
        } else {
            setEditingFile(file);
        }
    };

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Date Added</th>
                        <th style={{ width: '48px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, idx) => {
                        const Icon = iconMap[file.icon] || FileText;
                        const isMenuOpen = openMenuId === (file.id || idx);
                        const isLowerRow = files.length >= 2 && idx >= Math.max(1, files.length - 2);

                        return (
                            <tr key={file.id || idx} onClick={() => onFileClick && onFileClick(file)} style={{ cursor: 'pointer' }}>
                                <td><Icon className={file.iconColor} size={20} /></td>
                                <td className="font-medium">{file.name}</td>
                                <td><span className={`tag ${file.tagColor}`}>{file.category}</span></td>
                                <td className="text-gray">{file.date}</td>
                                <td style={{ position: 'relative' }}>
                                    {(onEdit || onDelete) ? (
                                        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                            {onEdit && <button className="outline-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => onEdit(file)}>Edit</button>}
                                            {onDelete && <button className="outline-btn" style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => onDelete(file.id)}>Delete</button>}
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }} ref={isMenuOpen ? menuRef : null}>
                                            <button 
                                                className="icon-btn-small" 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setOpenMenuId(isMenuOpen ? null : (file.id || idx));
                                                }}
                                                title="Actions"
                                                style={{
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: isMenuOpen ? 'var(--border-color)' : 'transparent',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-main)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {/* Dropdown Popover Menu */}
                                            {isMenuOpen && (
                                                <div 
                                                    style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: isLowerRow ? 'auto' : '100%',
                                                        bottom: isLowerRow ? '100%' : 'auto',
                                                        marginTop: isLowerRow ? '0' : '4px',
                                                        marginBottom: isLowerRow ? '6px' : '0',
                                                        width: '160px',
                                                        background: 'var(--card-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
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
                                                            padding: '8px 12px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--text-main)',
                                                            fontSize: '0.85rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Eye size={14} />
                                                        <span>View Item</span>
                                                    </button>

                                                    <button 
                                                        onClick={() => handleEditItem(file)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--text-main)',
                                                            fontSize: '0.85rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Edit3 size={14} />
                                                        <span>Edit Item</span>
                                                    </button>

                                                    <button 
                                                        onClick={() => handleDeleteItem(file)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: '#ef4444',
                                                            fontSize: '0.85rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Delete Item</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Edit Material Modal Overlay */}
            {editingFile && (
                <EditMaterialModal 
                    file={editingFile} 
                    onClose={() => setEditingFile(null)} 
                    onUpdated={() => router.refresh()} 
                />
            )}
        </div>
    );
}
