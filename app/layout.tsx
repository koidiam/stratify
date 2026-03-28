import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stratify | Büyüme ve Strateji Motoru',
  description: 'AI destekli içerik üreterek profilinizi büyütün.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Forced dark mode
    <html lang="tr" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
