import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Light mode default for clean SaaS look
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        suppressHydrationWarning
      >
        <TooltipProvider>
          {children}
          <Toaster position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
