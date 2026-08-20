'use client';
import { createContext, useContext, useState } from 'react';

const FileViewerContext = createContext();

export function FileViewerProvider({ children }) {
    const [activeFile, setActiveFileState] = useState(null);
    const [fileList, setFileList] = useState([]);

    const setActiveFile = (file, list = null) => {
        setActiveFileState(file);
        if (list && Array.isArray(list)) {
            setFileList(list);
        } else if (!file) {
            setFileList([]);
        }
    };

    return (
        <FileViewerContext.Provider value={{ activeFile, fileList, setActiveFile, setFileList }}>
            {children}
        </FileViewerContext.Provider>
    );
}

export function useFileViewer() {
    return useContext(FileViewerContext);
}
