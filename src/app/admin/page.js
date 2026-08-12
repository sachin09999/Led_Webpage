import { getFiles } from '@/actions/fileActions';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const files = await getFiles();
    return (
        <div style={{ paddingBottom: '32px' }}>
            <AdminClient initialFiles={files} />
        </div>
    );
}
