import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Planner - Proje Yönetim Aracı',
  description: 'Ekip projelerinizi yönetin, görevleri planlayın ve takip edin.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-dark-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
