import { FileText, PlaySquare, PenTool, Image as ImageIcon, PieChart, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getFiles } from '@/actions/fileActions';

export default async function CategoryCards() {
    const allFiles = await getFiles();
    
    const getCount = (category) => allFiles.filter(f => f.category === category).length;

    const categories = [
        { title: 'LED Wall Docs', desc: 'Technical documents, manuals and specifications.', count: `${getCount('LED Wall Docs')} Documents`, icon: FileText, color: 'blue', link: '/docs' },
        { title: 'Videos', desc: 'Installation videos, 360° videos and tutorial content.', count: `${getCount('Videos')} Videos`, icon: PlaySquare, color: 'purple', link: '/videos' },
        { title: 'Drawings', desc: 'Wiring diagrams, schematics and technical drawings.', count: `${getCount('Drawings')} Drawings`, icon: PenTool, color: 'green', link: '/drawings' },
        { title: 'Pictures', desc: 'All connection photos, wiring images and references.', count: `${getCount('Pictures')} Images`, icon: ImageIcon, color: 'orange', link: '/pictures' },
        { title: 'Finance Data', desc: 'Purchase history, spares and cost related data.', count: `${getCount('Finance Data')} Records`, icon: PieChart, color: 'yellow', link: '/finance' },
        { title: 'Support Data', desc: 'Spares location, support contacts and more.', count: `${getCount('Support Data')} Locations`, icon: MapPin, color: 'blue', link: '/support' },
    ];

    return (
        <section className="categories-grid">
            {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                    <Link href={cat.link} key={idx} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="category-card" style={{ height: '100%' }}>
                            <div className={`card-icon ${cat.color}-icon`}>
                                <Icon size={28} />
                            </div>
                            <div className="card-content">
                                <h3>{cat.title}</h3>
                                <p>{cat.desc}</p>
                                <div className="card-footer">
                                    <span className={`tag ${cat.color}-tag`}>{cat.count}</span>
                                    <ChevronRight className="arrow-icon" size={18} />
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </section>
    );
}
