import { Folder } from 'lucide-react';
import Link from 'next/link';
import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from './RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function RecentFiles() {
    const files = await getFiles();
    
    return (
        <section className="recent-files">
            <div className="section-header">
                <h2>Recent Files</h2>
                <Link href="/docs" className="view-all-link">View all</Link>
            </div>
            <RecentFilesTable files={files.slice(0, 5)} />
            <div className="view-all-files">
                <Link href="/docs" style={{ textDecoration: 'none' }}>
                    <button className="outline-btn">
                        <Folder size={20} />
                        View all files
                    </button>
                </Link>
            </div>
        </section>
    );
}
