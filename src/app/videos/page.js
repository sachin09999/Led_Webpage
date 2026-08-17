import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
    const allFiles = await getFiles();
    const files = allFiles.filter(f => f.category === 'Videos' || f.type === 'video');

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <RecentFilesTable files={files} title="Videos" category="Videos" dashboardSlug="ledwalldocs" />
        </section>
    );
}
