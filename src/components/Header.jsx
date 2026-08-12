'use client';
import { Menu, Search, Bell, Sun, Moon, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ toggleSidebar, isDark, toggleDark }) {
    const pathname = usePathname();
    const router = useRouter();
    return (
        <header className="top-header">
            <button className="menu-btn" onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
            }}>
                <Menu size={24} />
            </button>

            {pathname !== '/' && (
                <button 
                    className="icon-btn" 
                    onClick={() => router.push('/')} 
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={22} />
                </button>
            )}

            <form className="search-bar" onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value;
                if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
            }}>
                <Search className="search-icon" size={20} />
                <input name="search" type="text" placeholder="Search documents, videos, drawings, images..." />
            </form>
            <div className="header-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                </button>
                <button className="icon-btn" onClick={toggleDark}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
}
