import { notFound } from 'next/navigation';
import DashboardHero from '@/components/DashboardHero';
import DynamicCategoryCards from '@/components/DynamicCategoryCards';
import { getDashboardBySlug } from '@/actions/dashboardActions';

export const dynamic = 'force-dynamic';

export default async function DynamicDashboardPage({ params }) {
    const { slug } = await params;
    const dashboard = await getDashboardBySlug(slug);

    if (!dashboard) {
        notFound();
    }

    return (
        <>
            <DashboardHero 
                title={dashboard.headerTitle || dashboard.name} 
                description={dashboard.heroSubtitle} 
                bgClass={dashboard.bgClass || ''}
                bannerUrl={dashboard.bannerUrl || ''}
                dashboardSlug={dashboard.slug}
            />
            <DynamicCategoryCards 
                dashboardSlug={dashboard.slug} 
                categories={dashboard.categories || []} 
            />
        </>
    );
}
