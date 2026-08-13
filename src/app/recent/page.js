import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function RecentPage() {
    const files = await getFiles();

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <div className="section-header">
                <h2>Recent Files</h2>
            </div>
            <RecentFilesTable files={files} />
        </section>
    );
}
