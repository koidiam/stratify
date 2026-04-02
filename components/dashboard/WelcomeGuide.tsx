import { RefreshCw } from 'lucide-react';
import { Plan } from '@/types';
import { getPlanSourceSummary } from '@/lib/constants/plan-copy';

interface WelcomeGuideProps {
  plan?: Plan;
  stateLabel: string;
  stateDescription: string;
  nextActionLabel: string;
  nextActionDescription: string;
}

export function WelcomeGuide({
  plan = 'free',
  stateLabel,
  stateDescription,
  nextActionLabel,
  nextActionDescription,
}: WelcomeGuideProps) {
  const sourceSummary = getPlanSourceSummary(plan);

  return (
    <div className="w-full mt-4 rounded-sm border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
        <RefreshCw size={14} className="hidden sm:block" />
        <span>Weekly System State</span>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-sm border border-white/10 bg-black/30 p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Current Week</div>
          <p className="mt-2 text-sm font-medium text-white">{stateLabel}</p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">{stateDescription}</p>
        </div>

        <div className="rounded-sm border border-white/10 bg-black/30 p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Next Action</div>
          <p className="mt-2 text-sm font-medium text-white">{nextActionLabel}</p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">{nextActionDescription}</p>
        </div>

        <div className="rounded-sm border border-white/10 bg-black/30 p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Signal Source</div>
          <p className="mt-2 text-sm font-medium text-white">{sourceSummary.label}</p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">{sourceSummary.detail}</p>
        </div>
      </div>
    </div>
  );
}
