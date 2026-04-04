"use client";

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';
import { Plan } from '@/types';
import {
  PAYWALL_BASIC_FEATURES,
  PAYWALL_PRO_FEATURES,
  PAYWALL_WHY_UPGRADE,
  getImmediateUnlocks,
  getMissingCapabilities,
  getPaywallTeaser,
} from '@/lib/constants/plan-copy';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
  plan: Plan;
  trendPostCount: number;
  niche: string;
}

export function PaywallModal({
  open,
  onOpenChange,
  used,
  limit,
  plan,
  trendPostCount,
  niche,
}: PaywallModalProps) {
  const router = useRouter();

  const handleUpgradeNavigation = () => {
    onOpenChange(false);
    router.push('/settings');
  };

  const immediateUnlocks = getImmediateUnlocks(plan);
  const missingNow = getMissingCapabilities(plan);
  const comparisonCards =
    plan === 'basic'
      ? [{ name: 'Pro', items: PAYWALL_PRO_FEATURES }]
      : plan === 'free'
        ? [
            { name: 'Basic', items: PAYWALL_BASIC_FEATURES },
            { name: 'Pro', items: PAYWALL_PRO_FEATURES },
          ]
        : [];
  const upgradeTitle =
    plan === 'basic' ? 'Upgrade to Pro to keep momentum' : 'Upgrade to remove this weekly limit';
  const upgradeDescription =
    plan === 'pro'
      ? 'You have reached this week’s current run capacity. Manage your plan in Settings to review options.'
      : PAYWALL_WHY_UPGRADE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl str-panel bg-[#050505] !border-amber-500/20 rounded-sm p-0 shadow-2xl overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-sm font-bold tracking-widest uppercase text-amber-500 flex items-center gap-3">
              <AlertCircle className="w-4 h-4" />
              {upgradeTitle}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-white/55 pt-2 leading-relaxed">
              You have used {used} of {limit} weekly strategy runs.
              <span className="block mt-2">{upgradeDescription}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 border border-white/10 rounded-sm bg-white/[0.02] p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
              This week on Pro
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {getPaywallTeaser(trendPostCount, niche)}
            </p>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-sm border border-white/5 bg-black/30 p-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Right Now</div>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                The current flow stops here, so this week&apos;s signals cannot become another fresh strategy pass until capacity resets or the plan changes.
              </p>
            </div>
            <div className="rounded-sm border border-emerald-500/15 bg-emerald-500/5 p-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-500/70">After Upgrade</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                The limitation lifts immediately, so you can continue this week&apos;s workflow with more capacity and a stronger signal layer as soon as the plan change takes effect.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border border-white/5 bg-white/[0.02] rounded-sm p-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-4">
                Currently Missing
              </div>
              <ul className="space-y-3">
                {missingNow.map((item) => (
                  <li key={item} className="flex items-start text-[11px] leading-relaxed text-white/60">
                    <Lock className="w-3 h-3 mr-3 mt-0.5 shrink-0 text-amber-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-white/5 bg-white/[0.02] rounded-sm p-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-4">
                Unlock Immediately
              </div>
              {immediateUnlocks.length > 0 ? (
                <ul className="space-y-3">
                  {immediateUnlocks.map((item) => (
                    <li key={item} className="text-[11px] leading-relaxed text-white/75">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] leading-relaxed text-white/60">
                  Your current plan is already the highest tier available. Settings is the best place to review billing and timing.
                </p>
              )}
            </div>
          </div>

          {comparisonCards.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {comparisonCards.map((card) => (
                <div key={card.name} className="rounded-sm border border-white/5 bg-black/30 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">{card.name}</div>
                  <ul className="mt-3 space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="text-[11px] leading-relaxed text-white/65">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#000000]/40">
          <Button
            className="w-full sm:w-auto text-[9px] uppercase tracking-widest font-bold h-9 rounded-sm bg-transparent border border-transparent text-white/40 hover:text-white hover:bg-white/5 shadow-none"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="w-full sm:w-auto text-[9px] uppercase tracking-widest font-bold h-9 rounded-sm bg-white text-black hover:bg-white/90 shadow-none border border-transparent"
            onClick={handleUpgradeNavigation}
          >
            Review Plans in Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
