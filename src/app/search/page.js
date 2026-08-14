import { getFiles } from '@/actions/fileActions';
import { getDashboardBySlug } from '@/actions/dashboardActions';
import RecentFilesTable from '@/components/RecentFilesTable';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
    const params = await searchParams;
    const q = params?.q || '';
    const dash = params?.dash || '';

    if (!q) {
        redirect('/');
    }

    const allFiles = await getFiles();
    const dashboardObj = dash ? await getDashboardBySlug(dash) : null;

    // Filter files strictly scoped to dashboard if dash param is present
    const files = allFiles.filter(f => {
        const fileDashSlug = (f.dashboardSlug || 'ledwalldocs').toLowerCase();
        
        if (dash && fileDashSlug !== dash.toLowerCase()) {
            return false;
        }

        return f.name.toLowerCase().includes(q.toLowerCase()) || 
               (f.category && f.category.toLowerCase().includes(q.toLowerCase()));
    });

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Search Results for "{q}" {dashboardObj ? `in ${dashboardObj.name}` : ''}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    {files.length} {files.length === 1 ? 'item' : 'items'} found
                </p>
            </div>
            {files.length > 0 ? (
                <RecentFilesTable files={files} />
            ) : (
                <div style={{ padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
                    No matching files found {dashboardObj ? `in ${dashboardObj.name}` : ''}.
                </div>
            )}
        </section>
    );
}
