import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex w-16 h-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-3xl text-primary font-bold mb-8">
        S
      </div>
      
      <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
      <h2 className="text-xl font-medium text-muted-foreground mb-8">Page not found</h2>
      
      <p className="text-sm text-muted-foreground mb-10 max-w-sm text-center leading-relaxed">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        <ArrowLeft size={16} />
        Return to Dashboard
      </Link>
    </div>
  );
}
