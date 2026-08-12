'use client';
import DataTable from './DataTable';
import { useFileViewer } from '@/context/FileViewerContext';

export default function RecentFilesTable({ files }) {
    const { setActiveFile } = useFileViewer();
    return <DataTable files={files} onFileClick={(file) => setActiveFile(file)} />;
}
