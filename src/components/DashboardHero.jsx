'use client';
import { Search } from 'lucide-react';

export default function DashboardHero() {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>LED Wall Docs</h1>
                <p>All important documents, videos, drawings, images<br/>and support data in one place.</p>
                <form className="hero-search" onSubmit={(e) => {
                    e.preventDefault();
                    const query = e.target.search.value;
                    if (query) window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }}>
                    <Search size={20} />
                    <input name="search" type="text" placeholder="Search..." />
                    <button type="submit" className="primary-btn">Search</button>
                </form>
            </div>
        </section>
    );
}
