import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stratify | Growth & Strategy Engine',
  description: 'AI-powered LinkedIn growth and content strategy system. Generate weekly insights, hooks, and ready-to-publish drafts tailored to your niche.',
  openGraph: {
    title: 'Stratify | Growth & Strategy Engine',
    description: 'Stop guessing what to post. Generate weekly LinkedIn strategies powered by AI.',
    type: 'website',
    siteName: 'Stratify',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stratify | Growth & Strategy Engine',
    description: 'Stop guessing what to post. Generate weekly LinkedIn strategies powered by AI.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Light mode default for clean SaaS look
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <TooltipProvider>
          {children}
          <Toaster position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
