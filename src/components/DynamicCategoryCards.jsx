import Link from 'next/link';
import DynamicIcon from './IconHelper';
import { getFiles } from '@/actions/fileActions';

export default async function DynamicCategoryCards({ dashboardSlug, categories = [] }) {
    const allFiles = await getFiles();
    
    // Count files matching this dashboard and category name strictly
    const getCount = (catName) => {
        return allFiles.filter(f => {
            const fDash = (f.dashboardSlug || 'wafi-command-centre').toLowerCase();
            return fDash === dashboardSlug.toLowerCase() && 
                   (f.category === catName || f.category?.toLowerCase() === catName?.toLowerCase());
        }).length;
    };

    if (!categories || categories.length === 0) {
        return (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No categories defined for this dashboard yet.</p>
            </div>
        );
    }

    const colors = ['blue-icon', 'purple-icon', 'green-icon', 'orange-icon', 'yellow-icon'];
    const tagColors = ['blue-tag', 'purple-tag', 'green-tag', 'orange-tag', 'yellow-tag'];

    return (
        <section className="categories-grid">
            {categories.map((cat, index) => {
                const count = getCount(cat.name);
                const colorClass = cat.colorClass || colors[index % colors.length];
                const tagClass = cat.tagClass || tagColors[index % tagColors.length];
                const linkHref = `/${dashboardSlug}/${cat.id}`;

                return (
                    <Link href={linkHref} key={cat.id || cat.name} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="category-card" style={{ height: '100%' }}>
                            <div className={`card-icon ${colorClass}`}>
                                <DynamicIcon name={cat.icon || 'FileText'} size={28} />
                            </div>
                            <div className="card-content">
                                <h3>{cat.name}</h3>
                                <p>{cat.description || `Documents and files for ${cat.name}.`}</p>
                                <div className="card-footer">
                                    <span className={`tag ${tagClass}`}>{count} {cat.tag || 'Files'}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </section>
    );
}
