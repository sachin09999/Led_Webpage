import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardAdminRedirect({ params }) {
    const { slug } = await params;
    if (slug) {
        redirect(`/admin?dash=${encodeURIComponent(slug)}`);
    }
    redirect('/admin');
}
