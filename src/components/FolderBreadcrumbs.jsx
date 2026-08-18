'use client';
import { ChevronRight, Folder, Home } from 'lucide-react';

export default function FolderBreadcrumbs({ 
    categoryName, 
    breadcrumbs = [], 
    onNavigate 
}) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
        <nav 
            aria-label="Breadcrumb"
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: '6px', 
                marginBottom: '16px',
                padding: '6px 14px',
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '20px',
                border: '1px solid var(--border-color, #e5e7eb)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
        >
            {/* Root Category */}
            <button
                type="button"
                onClick={() => onNavigate(null)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#3b82f6',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <Home size={15} />
                <span>{categoryName || 'All Files'}</span>
            </button>

            {/* Breadcrumb Trail */}
            {breadcrumbs.map((folder, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                    <div key={folder.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ChevronRight size={14} style={{ color: 'var(--text-muted, #9ca3af)' }} />
                        <button
                            type="button"
                            onClick={() => !isLast && onNavigate(folder.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: 'none',
                                background: 'transparent',
                                color: isLast ? 'var(--text-main, #111827)' : '#3b82f6',
                                fontWeight: isLast ? 600 : 500,
                                cursor: isLast ? 'default' : 'pointer',
                                fontSize: '0.85rem',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={e => !isLast && (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)')}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Folder size={15} style={{ color: '#f59e0b' }} />
                            <span>{folder.name}</span>
                        </button>
                    </div>
                );
            })}
        </nav>
    );
}
