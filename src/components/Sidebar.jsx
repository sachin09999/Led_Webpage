'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hexagon, Home, Clock, FileText, PlaySquare, PenTool, Image as ImageIcon, PieChart, LifeBuoy, Settings } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Recent Files', href: '/recent', icon: Clock },
        { name: 'LED Wall Docs', href: '/docs', icon: FileText },
        { name: 'Videos', href: '/videos', icon: PlaySquare },
        { name: 'Drawings', href: '/drawings', icon: PenTool },
        { name: 'Pictures', href: '/pictures', icon: ImageIcon },
        { name: 'Finance Data', href: '/finance', icon: PieChart },
        { name: 'Support Data', href: '/support', icon: LifeBuoy },
        { name: 'Admin Panel', href: '/admin', icon: Settings },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <Hexagon className="logo-icon" />
                </div>
                <span className="logo-text">LED Wall Docs</span>
            </div>
            
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
