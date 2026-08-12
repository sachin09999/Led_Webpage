'use client';
import { createContext, useContext, useState } from 'react';

const FileViewerContext = createContext();

export function FileViewerProvider({ children }) {
    const [activeFile, setActiveFile] = useState(null);
    return (
        <FileViewerContext.Provider value={{ activeFile, setActiveFile }}>
            {children}
        </FileViewerContext.Provider>
    );
}

export function useFileViewer() {
    return useContext(FileViewerContext);
}
