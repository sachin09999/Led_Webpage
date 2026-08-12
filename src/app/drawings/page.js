import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function DrawingsPage() {
    const allFiles = await getFiles();
    const files = allFiles.filter(f => f.category === 'Drawings');

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <div className="section-header">
                <h2>Drawings</h2>
            </div>
            <RecentFilesTable files={files} />
        </section>
    );
}
