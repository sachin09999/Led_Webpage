import Link from 'next/link';
import DynamicIcon from '@/components/IconHelper';
import { getDashboards } from '@/actions/dashboardActions';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MainHub() {
  const dashboards = await getDashboards();

  const colors = ['blue-icon', 'purple-icon', 'green-icon', 'orange-icon', 'yellow-icon'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '2rem 1rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>Wafi Command Centre Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '600px' }}>
        Choose the system you want to manage or view documentation for.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        maxWidth: '900px',
        width: '100%'
      }}>
        {dashboards.map((dash, index) => {
          const colorClass = colors[index % colors.length];
          return (
            <Link key={dash.id || dash.slug} href={`/${dash.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="category-card" style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}>
                <div className={`card-icon ${colorClass}`} style={{ marginBottom: '1.5rem', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DynamicIcon name={dash.icon || 'MonitorPlay'} size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 600 }}>{dash.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{dash.description}</p>
              </div>
            </Link>
          );
        })}

        {/* Add New Dashboard Card */}
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="category-card" style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            borderStyle: 'dashed',
            opacity: 0.85,
            transition: 'all 0.3s'
          }}>
            <div className="card-icon blue-icon" style={{ marginBottom: '1.5rem', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 600 }}>Add New Dashboard</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>Create a custom dashboard & template from Admin Panel.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
