'use client';

import { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardHero({ 
    title = "Wafi Command Centre", 
    description = "All important documents, videos, drawings, images and support data in one place.", 
    bgClass = "", 
    bannerUrl = "",
    dashboardSlug = ""
}) {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const heroStyle = bannerUrl ? {
        backgroundImage: `linear-gradient(to right, rgba(10, 15, 30, 0.85), rgba(10, 15, 30, 0.6)), url('${bannerUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : {};

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const dashParam = dashboardSlug ? `&dash=${encodeURIComponent(dashboardSlug)}` : '';
            router.push(`/search?q=${encodeURIComponent(query.trim())}${dashParam}`);
        }
    };

    const handleAdminClick = () => {
        if (dashboardSlug) {
            router.push(`/admin?dash=${encodeURIComponent(dashboardSlug)}`);
        } else {
            router.push('/admin');
        }
    };

    return (
        <section className={`hero-section ${bgClass}`} style={heroStyle}>
            <div className="hero-content">
                <h1>{title}</h1>
                <p>{description}</p>
                <form className="hero-search" onSubmit={handleSearchSubmit}>
                    <Search size={20} />
                    <input 
                        name="search" 
                        type="text" 
                        placeholder="Search files..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="primary-btn">Search</button>
                </form>
            </div>
        </section>
    );
}
