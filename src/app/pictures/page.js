import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function PicturesPage() {
    const allFiles = await getFiles();
    const files = allFiles.filter(f => f.category === 'Pictures');

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <div className="section-header">
                <h2>Pictures</h2>
            </div>
            <RecentFilesTable files={files} />
        </section>
    );
}
