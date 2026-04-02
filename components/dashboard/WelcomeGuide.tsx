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
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] border border-white/5 rounded-sm px-5 py-4 w-full mt-4">
      <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
        <RefreshCw size={14} className="hidden sm:block" />
        <span>System Loop:</span>
      </div>
      
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-white/50 w-full flex-grow text-[11px] font-mono uppercase tracking-wider">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="text-white/80">{step}</span>
            {idx < steps.length - 1 && (
              <ArrowRight size={10} className="text-white/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
