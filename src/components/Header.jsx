'use client';

import { Menu, Sun, Moon, ArrowLeft, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ toggleSidebar, isDark, toggleDark }) {
    const pathname = usePathname();
    const router = useRouter();

    const pathParts = pathname.split('/').filter(Boolean);
    const isMainHub = pathname === '/';
    const parentSlug = pathParts[0] || '';

    // Show Back arrow icon ONLY on sub-pages (e.g. /wtp/docs), admin, or search
    // Do NOT show back arrow on main internal dashboard overview pages (e.g. /wtp, /ledwalldocs)
    const isSubPage = pathParts.length >= 2 || pathname === '/admin' || pathname.startsWith('/admin') || pathname === '/search';

    const handleBackClick = () => {
        if (pathname === '/admin' || pathname.startsWith('/admin')) {
            let dashSlug = null;
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                dashSlug = params.get('dash');
            }
            if (dashSlug) {
                router.push(`/${dashSlug}`);
            } else {
                router.push('/');
            }
        } else if (pathParts.length >= 2) {
            router.push(`/${parentSlug}`);
        } else {
            router.push('/');
        }
    };

    const handleAdminClick = () => {
        if (parentSlug && parentSlug !== 'admin' && parentSlug !== 'search' && parentSlug !== 'recent') {
            router.push(`/admin?dash=${parentSlug}`);
        } else {
            router.push('/admin');
        }
    };

    return (
        <header className="top-header">
            {/* Show Hamburger Menu button ONLY on Main Hub page */}
            {isMainHub && (
                <button className="menu-btn" onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                }} title="Toggle Sidebar">
                    <Menu size={24} />
                </button>
            )}

            {/* Back button on inside dashboard pages */}
            {isSubPage && (
                <button
                    className="icon-btn"
                    onClick={handleBackClick}
                    title="Back to Previous Page"
                >
                    <ArrowLeft size={22} />
                </button>
            )}

            <div className="spacer" style={{ flex: 1 }}></div>

            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Theme Toggle Button */}
                <button className="icon-btn" onClick={toggleDark} title="Toggle Dark/Light Mode">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
}
