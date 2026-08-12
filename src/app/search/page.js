import { getFiles } from '@/actions/fileActions';
import RecentFilesTable from '@/components/RecentFilesTable';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
    // searchParams in Next.js 15+ needs to be awaited if treated as Promise, but in Next 13-14 it's an object. 
    // Wait, let's just use it safely.
    const params = await searchParams;
    const q = params?.q || '';

    if (!q) {
        redirect('/');
    }

    const allFiles = await getFiles();
    const files = allFiles.filter(f => 
        f.name.toLowerCase().includes(q.toLowerCase()) || 
        (f.category && f.category.toLowerCase().includes(q.toLowerCase()))
    );

    return (
        <section className="recent-files" style={{ paddingBottom: '0' }}>
            <div className="section-header">
                <h2>Search Results for "{q}"</h2>
                <p>{files.length} items found</p>
            </div>
            {files.length > 0 ? (
                <RecentFilesTable files={files} />
            ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>
                    No matching files found.
                </div>
            )}
        </section>
    );
}
