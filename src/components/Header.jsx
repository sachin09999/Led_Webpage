'use client';

import { Menu, Sun, Moon, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ toggleSidebar, isDark, toggleDark }) {
    const pathname = usePathname();
    const router = useRouter();

    const pathParts = pathname.split('/').filter(Boolean);
    const parentSlug = pathParts[0] || '';

    // Show Back arrow icon on category sub-pages (e.g. /ledwalldocs/videos), admin, and search
    const isSubPage = pathParts.length >= 2 || pathname === '/admin' || pathname.startsWith('/admin') || pathname === '/search';

    const handleBackClick = () => {
        if (pathname === '/admin' || pathname.startsWith('/admin')) {
            let dashSlug = null;
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                dashSlug = params.get('dash');
            }
            if (dashSlug) {
                // Navigate back to the specific dashboard overview (e.g. /ledwalldocs or /wtp)
                router.push(`/${dashSlug}`);
            } else {
                // Navigate back to Main Hub /
                router.push('/');
            }
        } else if (pathParts.length >= 2) {
            // Navigate back to parent dashboard (e.g. /ledwalldocs/videos -> /ledwalldocs)
            router.push(`/${parentSlug}`);
        } else {
            router.back();
        }
    };

    return (
        <header className="top-header">
            <button className="menu-btn" onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
            }} title="Toggle Sidebar">
                <Menu size={24} />
            </button>

            {isSubPage && (
                <button
                    className="icon-btn"
                    onClick={handleBackClick}
                    title="Back"
                >
                    <ArrowLeft size={22} />
                </button>
            )}

            <div className="spacer" style={{ flex: 1 }}></div>
            <div className="header-actions">
                <button className="icon-btn" onClick={toggleDark} title="Toggle Theme">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
}
