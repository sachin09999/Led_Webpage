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

            <div className="spacer" style={{ flex: 1 }}></div>
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
