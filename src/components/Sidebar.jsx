'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DynamicIcon from './IconHelper';
import { getDashboards } from '@/actions/dashboardActions';

export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();
    const [dashboards, setDashboards] = useState([]);
    const [dashParam, setDashParam] = useState(null);

    useEffect(() => {
        getDashboards().then(res => setDashboards(res || [])).catch(() => {});
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setDashParam(params.get('dash'));
        }
    }, [pathname]);

    // Determine current active dashboard slug from pathname (e.g. /wtp/docs -> slug = wtp)
    // or from search param (e.g. /search?q=led&dash=ledwalldocs -> slug = ledwalldocs)
    const pathParts = pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0] || '';

    const activeSlug = (firstPart === 'search' && dashParam) ? dashParam : firstPart;
    const currentDashboard = dashboards.find(d => d.slug.toLowerCase() === activeSlug.toLowerCase());

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <DynamicIcon name={currentDashboard ? currentDashboard.icon : 'MonitorPlay'} size={28} className="logo-icon" />
                </div>
                <span className="logo-text">{currentDashboard ? currentDashboard.name : 'Wafi Command Centre'}</span>
            </div>
            
            <nav className="sidebar-nav">
                {/* Global Navigation */}
                <div className="nav-section-title" style={{ padding: '8px 12px 4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    System Navigation
                </div>
                <Link 
                    href="/" 
                    className={`nav-item ${pathname === '/' ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                >
                    <DynamicIcon name="Home" size={20} />
                    <span>Main Hub</span>
                </Link>
                <Link 
                    href={currentDashboard ? `/admin?dash=${currentDashboard.slug}` : "/admin"} 
                    className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                >
                    <DynamicIcon name="Settings" size={20} />
                    <span>{currentDashboard ? `${currentDashboard.name} Admin` : 'Main Admin Panel'}</span>
                </Link>

                {/* Project Dashboards Section */}
                {dashboards.length > 0 && (
                    <>
                        <div className="nav-section-title" style={{ padding: '16px 12px 4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Project Dashboards
                        </div>
                        {dashboards.map(dash => {
                            const isDashActive = activeSlug.toLowerCase() === dash.slug.toLowerCase();
                            return (
                                <Link 
                                    key={dash.id}
                                    href={`/${dash.slug}`}
                                    className={`nav-item ${isDashActive && pathParts.length <= 1 && pathname !== '/search' ? 'active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <DynamicIcon name={dash.icon || 'MonitorPlay'} size={20} />
                                    <span>{dash.name}</span>
                                </Link>
                            );
                        })}
                    </>
                )}

                {/* Categories of Currently Active Dashboard */}
                {currentDashboard && currentDashboard.categories && currentDashboard.categories.length > 0 && (
                    <>
                        <div className="nav-section-title" style={{ padding: '16px 12px 4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {currentDashboard.name} Categories
                        </div>
                        {currentDashboard.categories.map(cat => {
                            const catHref = `/${currentDashboard.slug}/${cat.id}`;
                            const isCatActive = pathname === catHref;
                            return (
                                <Link 
                                    key={cat.id + cat.name}
                                    href={catHref}
                                    className={`nav-item ${isCatActive ? 'active' : ''}`}
                                    style={{ paddingLeft: '24px' }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <DynamicIcon name={cat.icon || 'FileText'} size={18} />
                                    <span>{cat.name}</span>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>
        </aside>
    );
}
