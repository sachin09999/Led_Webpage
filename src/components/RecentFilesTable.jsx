'use client';

import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import DataGrid from './DataGrid';
import AddMaterialModal from './AddMaterialModal';
import { useFileViewer } from '@/context/FileViewerContext';
import { Plus, LayoutList, LayoutGrid } from 'lucide-react';

export default function RecentFilesTable({ 
    files, 
    title, 
    category = 'Docs', 
    dashboardSlug = 'ledwalldocs',
    showAddButton = true 
}) {
    const { setActiveFile } = useFileViewer();
    const [isAddOpen, setIsAddOpen] = useState(false);
    // Initialize view mode from localStorage
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('wafi_view_mode');
            if (saved === 'grid' || saved === 'list') return saved;
        }
        return 'list';
    });

    const handleViewToggle = (mode) => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('wafi_view_mode', mode);
        }
    };

    const buttonLabel = category ? `Add ${category}` : 'Add Item';

    return (
        <div>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                {title ? <h2>{title}</h2> : <div />}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* View Mode Toggle Buttons */}
                    <div className="view-toggle-group">
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
                        <button 
                            className="primary-btn" 
                            onClick={() => setIsAddOpen(true)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                padding: '8px 16px',
                                fontSize: '0.875rem',
                                borderRadius: '8px'
                            }}
                        >
                            <Plus size={18} />
                            <span>{buttonLabel}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* View Mode Switcher */}
            {viewMode === 'grid' ? (
                <DataGrid files={files} onFileClick={(file) => setActiveFile(file)} />
            ) : (
                <DataTable files={files} onFileClick={(file) => setActiveFile(file)} />
            )}

            <AddMaterialModal 
                key={`${category}-${dashboardSlug}`}
                isOpen={isAddOpen} 
                onClose={() => setIsAddOpen(false)} 
                defaultCategory={category}
                defaultDashboardSlug={dashboardSlug}
                lockDashboard={true}
            />
        </div>
    );
}
