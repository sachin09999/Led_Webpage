import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function RecentPage() {
    const files = await getFiles();

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <RecentFilesTable files={files} title="Recent Files" category="Docs" dashboardSlug="ledwalldocs" />
        </section>
    );
}
