"use client"

import { PLAN_LIMITS } from '@/lib/utils/usage';
import { Plan } from '@/types';

interface Props {
  plan: Plan;
  usage: number;
}

export function UsageCard({ plan = 'free', usage = 0 }: Props) {
  const limit = PLAN_LIMITS[plan] || 3;
  const percentage = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - usage, 0);

  const getBadgeColor = () => {
    if (plan === 'pro') return 'bg-white text-black border-none';
    if (plan === 'basic') return 'bg-emerald-500 text-white border-none';
    return 'bg-white/5 text-white/80 border-white/20 border';
  };

  const getProgressTone = () => {
    if (percentage >= 100) return 'bg-amber-500';
    if (percentage >= 80) return 'bg-white';
    return 'bg-emerald-500';
  };

  return (
    <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[9px] font-bold text-white/30 uppercase tracking-[0.22em]">
            Weekly Capacity
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-white/40">
            Current run budget for the active cycle.
          </p>
        </div>
        <div className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest ${getBadgeColor()}`}>
          {plan}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-4">
          <span className="text-[11px] font-mono text-white/45 uppercase tracking-widest">
            Cycle Usage
          </span>
          <span className="text-white font-semibold text-lg leading-none">
            {usage} <span className="text-white/30 text-sm font-normal">/ {limit}</span>
          </span>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-[width] duration-300 ${getProgressTone()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-4 text-sm leading-relaxed text-white">
          {remaining === 0
            ? 'The run console is blocked until capacity resets or the plan changes.'
            : `${remaining} ${remaining === 1 ? 'run remains' : 'runs remain'} in the current cycle.`}
        </div>

        {percentage >= 100 && (
          <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-amber-400">
            Capacity blocked.
          </p>
        )}

        {percentage >= 80 && percentage < 100 && (
          <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-white/55">
            Approaching cycle limit.
          </p>
        )}
      </div>
    </div>
  );
}
