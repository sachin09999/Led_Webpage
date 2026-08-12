import DashboardHero from '@/components/DashboardHero';
import CategoryCards from '@/components/CategoryCards';
import RecentFiles from '@/components/RecentFiles';

export default function Home() {
  return (
    <>
      <DashboardHero />
      <CategoryCards />
      <RecentFiles />
    </>
  );
}
