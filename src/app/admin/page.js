import { getFiles } from '@/actions/fileActions';
import { getDashboards } from '@/actions/dashboardActions';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }) {
    const params = await searchParams;
    const dashSlug = params?.dash || '';
    const files = await getFiles();
    const dashboards = await getDashboards();

    return (
        <div style={{ paddingBottom: '32px' }}>
            <AdminClient 
                initialFiles={files} 
                initialDashboards={dashboards} 
                scopedDashSlug={dashSlug}
            />
        </div>
    );
}
