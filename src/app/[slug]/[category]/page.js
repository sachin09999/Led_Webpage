import { notFound } from 'next/navigation';
import { getFiles } from '@/actions/fileActions';
import { getDashboardBySlug } from '@/actions/dashboardActions';
import RecentFilesTable from '@/components/RecentFilesTable';

export const dynamic = 'force-dynamic';

export default async function DynamicCategoryPage({ params }) {
    const { slug, category } = await params;
    const dashboard = await getDashboardBySlug(slug);

    if (!dashboard) {
        notFound();
    }

    // Find category object in dashboard
    const catObj = (dashboard.categories || []).find(
        c => c.id.toLowerCase() === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase()
    );

    const categoryTitle = catObj ? catObj.name : category;

    const allFiles = await getFiles();

    // Filter files strictly scoped to this dashboard and category
    const filteredFiles = allFiles.filter(f => {
        const fileDashSlug = (f.dashboardSlug || 'wafi-command-centre').toLowerCase();
        const currentDashSlug = slug.toLowerCase();

        if (fileDashSlug !== currentDashSlug) {
            return false;
        }

        if (catObj) {
            return f.category === catObj.name || (f.category && f.category.toLowerCase() === catObj.name.toLowerCase());
        }
        return f.category && f.category.toLowerCase() === category.toLowerCase();
    });

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <div className="section-header">
                <h2>{categoryTitle}</h2>
            </div>
            <RecentFilesTable files={filteredFiles} />
        </section>
    );
}
