import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}
