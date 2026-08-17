'use client';

import { useState } from 'react';
import DataTable from './DataTable';
import AddMaterialModal from './AddMaterialModal';
import { useFileViewer } from '@/context/FileViewerContext';
import { Plus } from 'lucide-react';

export default function RecentFilesTable({ 
    files, 
    title, 
    category = 'Docs', 
    dashboardSlug = 'ledwalldocs',
    showAddButton = true 
}) {
    const { setActiveFile } = useFileViewer();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const buttonLabel = category ? `Add ${category}` : 'Add Item';

    return (
        <div>
            {title && (
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2>{title}</h2>
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
            )}

            {!title && showAddButton && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
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
                </div>
            )}

            <DataTable files={files} onFileClick={(file) => setActiveFile(file)} />

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

