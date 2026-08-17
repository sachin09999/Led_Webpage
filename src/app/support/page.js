import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
    const allFiles = await getFiles();
    const files = allFiles.filter(f => f.category === 'Support Data');

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <RecentFilesTable files={files} title="Support Data" category="Support Data" dashboardSlug="ledwalldocs" />
        </section>
    );
}
