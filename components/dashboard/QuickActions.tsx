import Link from 'next/link';
import { Compass, PenTool, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plan } from '@/types';
import { getQuickActionsUpgradeHint } from '@/lib/constants/plan-copy';

interface QuickActionsProps {
  plan?: Plan;
  primaryActionLabel: string;
  primaryActionHref: string;
  primaryActionDescription: string;
}

export function QuickActions({
  plan = 'free',
  primaryActionLabel,
  primaryActionHref,
  primaryActionDescription,
}: QuickActionsProps) {
  const upgradeHint = getQuickActionsUpgradeHint(plan);
  const PrimaryIcon = primaryActionHref === '/settings'
    ? Settings
    : primaryActionHref === '/history'
      ? Compass
      : PenTool;

  return (
    <div className="w-full space-y-4 bg-[#050505] py-2">
      <div>
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
          Recommended Action
        </div>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          {primaryActionDescription}
        </p>
      </div>

      <Link href={primaryActionHref} className="block w-full">
        <Button className="w-full gap-2 rounded-sm bg-white text-black font-bold uppercase tracking-widest text-[11px] h-10 px-6 transition-all hover:bg-white/90">
          <PrimaryIcon size={14} />
          <span>{primaryActionLabel}</span>
        </Button>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/history" className="w-full">
          <Button variant="outline" className="w-full gap-2 rounded-sm border-white/10 bg-transparent hover:bg-white/5 text-white/90 font-bold uppercase tracking-widest text-[11px] h-10 px-6 transition-colors">
            <Compass size={14} />
            <span>View Archive</span>
          </Button>
        </Link>

        <Link href="/settings" className="w-full">
          <Button variant="outline" className="w-full gap-2 rounded-sm border-white/10 bg-transparent hover:bg-white/5 text-white/90 font-bold uppercase tracking-widest text-[11px] h-10 px-6 transition-colors">
            <Settings size={14} />
            <span>Settings</span>
          </Button>
        </Link>
      </div>

      {upgradeHint && (
        <div className="rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] text-white/45">
          {upgradeHint}
        </div>
      )}
    </div>
  );
}
