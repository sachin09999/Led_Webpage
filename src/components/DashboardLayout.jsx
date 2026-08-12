'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useFileViewer } from '@/context/FileViewerContext';
import FileViewerModal from './FileViewerModal';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const { activeFile, setActiveFile } = useFileViewer();

    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <div className="app-container">
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="main-content">
                <Header 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    isDark={isDark} 
                    toggleDark={() => setIsDark(!isDark)} 
                />
                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            {activeFile && (
                <FileViewerModal file={activeFile} onClose={() => setActiveFile(null)} />
            )}
        </div>
    );
}
