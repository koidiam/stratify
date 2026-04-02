"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PLAN_LIMITS } from '@/lib/utils/usage';
import { Plan } from '@/types';
import { getPlanSourceSummary } from '@/lib/constants/plan-copy';

interface Props {
  plan: Plan;
  usage: number;
}

export function UsageCard({ plan = 'free', usage = 0 }: Props) {
  const limit = PLAN_LIMITS[plan] || 3;
  const percentage = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - usage, 0);
  const sourceSummary = getPlanSourceSummary(plan);
  
  const getBadgeColor = () => {
    if (plan === 'pro') return 'bg-white text-black border-none';
    if (plan === 'basic') return 'bg-emerald-500 text-white border-none';
    return 'bg-white/5 text-white/80 border-white/20 border';
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10">
        <div>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Credits</h2>
        </div>
        <div className={`mt-2 sm:mt-0 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest ${getBadgeColor()}`}>
          {plan}
        </div>
      </div>

      <div className="space-y-4 relative z-10 flex-grow flex flex-col justify-end">
         <div className="flex justify-between items-end">
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest">This Week</span>
          <span className="text-white font-bold text-lg leading-none">
            {usage} <span className="text-white/30 text-sm font-normal">/ {limit}</span>
          </span>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="rounded-sm border border-white/10 bg-white/[0.02] px-3 py-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Remaining Capacity</div>
          <p className="mt-2 text-sm text-white">
            {remaining === 0 ? 'No strategy runs left this week.' : `${remaining} strategy ${remaining === 1 ? 'run' : 'runs'} left this week.`}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/60">
            Progress this cycle: {usage === 0 ? 'not started yet' : `${usage} of ${limit} runs used`}.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/50">
            {sourceSummary.label}: {sourceSummary.detail}
          </p>
        </div>
        
        {percentage >= 100 && (
          <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-2">Limit reached. Upgrade to unlock runs.</p>
        )}
        
        {percentage >= 80 && percentage < 100 && (
          <p className="text-amber-500 text-[10px] uppercase font-bold tracking-widest mt-2">Almost at limit.</p>
        )}

        {plan === 'free' && percentage < 100 && (
          <div className="text-[9px] font-bold tracking-widest uppercase text-white/40 mt-2 border border-white/5 bg-white/[0.02] px-3 py-2 rounded-sm flex items-center justify-between w-full">
            <span>Live Signal Scan Locked</span>
            <Link href="/settings" className="text-white hover:text-white/80 transition-colors">Upgrade</Link>
          </div>
        )}

        <Link href="/generate" className="block mt-4">
          <Button
            disabled={percentage >= 100}
            className="w-full rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold text-[11px] uppercase tracking-widest h-10 disabled:bg-white/10 disabled:text-white/30"
          >
            {percentage >= 100 ? 'Limit Reached' : 'Generate Strategy'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
