import { RefreshCw, ArrowRight } from 'lucide-react';
import { Plan } from '@/types';

export function WelcomeGuide({ plan = 'free' }: { plan?: Plan }) {
  const steps = [
    'Scan Signals', 
    'Review Hooks', 
    'Shape Drafts', 
    'Track Performance'
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/30 border border-border/60 rounded-xl px-5 py-3.5 w-full text-xs sm:text-sm mt-4">
      <div className="flex items-center gap-2 text-primary font-medium uppercase tracking-wider text-[10px] md:text-xs">
        <RefreshCw size={14} className="text-primary hidden sm:block" />
        <span>Weekly Operation Loop:</span>
      </div>
      
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 text-muted-foreground w-full flex-grow">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-foreground/80 font-medium">{step}</span>
            {idx < steps.length - 1 && (
              <ArrowRight size={12} className="opacity-30" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
