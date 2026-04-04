'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plan } from '@/types';
import { getPlanDepthCard } from '@/lib/constants/plan-copy';

const PLAN_ORDER: Plan[] = ['free', 'basic', 'pro'];

function isCurrentOrHigher(currentPlan: Plan, candidatePlan: Plan): boolean {
  return PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(candidatePlan);
}

export function PlanManager({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const normalizedPlan: Plan =
    currentPlan === 'basic' || currentPlan === 'pro' ? currentPlan : 'free';

  const handleCheckout = async (plan: 'basic' | 'pro') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Checkout URL not returned');
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast.error('Could not initiate checkout: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
        {PLAN_ORDER.map((planKey) => {
          const card = getPlanDepthCard(planKey);
          const isCurrent = normalizedPlan === planKey;
          const isLockedAbove = planKey !== 'free' && isCurrentOrHigher(normalizedPlan, planKey);

          return (
            <div
              key={card.plan}
              className={`rounded-sm border p-4 ${
                isCurrent
                  ? 'border-white/15 bg-white/[0.03]'
                  : 'border-white/10 bg-transparent'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-medium text-white">
                      {card.name}
                    </h4>
                    <span className="rounded-sm border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                      {card.depthLabel}
                    </span>
                    {isCurrent && (
                      <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-medium leading-relaxed text-white">
                    {card.headline}
                  </p>
                  <div className="mt-1 text-[11px] leading-relaxed text-white/45">
                    {card.capacityLabel}
                  </div>
                </div>

                <div className="lg:w-56">
                  {planKey === 'free' ? (
                    <Button
                      disabled
                      className="h-10 w-full rounded-sm bg-white/5 text-white/35 shadow-none uppercase tracking-widest text-[11px] cursor-default"
                    >
                      Active
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout(planKey)}
                      disabled={loading !== null || isLockedAbove}
                      variant={planKey === 'pro' ? 'outline' : 'default'}
                      className={`h-10 w-full rounded-sm font-bold uppercase tracking-widest text-[11px] shadow-none ${
                        isLockedAbove
                          ? planKey === 'pro'
                            ? 'border-white/10 bg-white/[0.03] text-white/45 cursor-default'
                            : 'bg-white/5 text-white/40 cursor-default'
                          : planKey === 'pro'
                            ? 'border-white/10 bg-transparent text-white hover:bg-white/5'
                            : 'bg-white text-black hover:bg-white/90'
                      }`}
                    >
                      {loading === planKey
                        ? 'Processing...'
                        : isCurrent
                          ? 'Active'
                          : isLockedAbove
                            ? 'Included'
                            : planKey === 'basic'
                              ? 'Upgrade to Basic'
                              : 'Upgrade to Pro'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 text-[12px] leading-relaxed text-white/55">
                {card.capabilities[0]}
              </div>
              <div className="mt-1 text-[12px] leading-relaxed text-white/42">
                {card.capabilities[1]}
              </div>
              <div className="mt-1 text-[12px] leading-relaxed text-white/42">
                {card.capabilities[2]}
              </div>
            </div>
          );
        })}
    </div>
  );
}
