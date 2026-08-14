import { Inter } from 'next/font/google';
import './globals.css';
import DashboardLayout from '@/components/DashboardLayout';
import { FileViewerProvider } from '@/context/FileViewerContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Wafi Command Centre',
    template: '%s | Wafi Command Centre',
  },
  description: 'All essential command centre data, drawings, videos, and project documents in one place.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FileViewerProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </FileViewerProvider>
      </body>
    </html>
  );
}
