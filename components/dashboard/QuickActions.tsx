import Link from 'next/link';
import { Compass, PenTool, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plan } from '@/types';
import { QUICK_ACTIONS_DESCRIPTION, getQuickActionsUpgradeHint } from '@/lib/constants/plan-copy';

export function QuickActions({ plan = 'free' }: { plan?: Plan }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      
      {/* Generate */}
      <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors group flex flex-col justify-between rounded-[16px]">
        <div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
            <PenTool size={20} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Generate Strategy</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {QUICK_ACTIONS_DESCRIPTION}
            {getQuickActionsUpgradeHint(plan) && (
              <span className="block mt-1.5 text-xs text-muted-foreground/70">
                {getQuickActionsUpgradeHint(plan)}
              </span>
            )}
          </p>
        </div>
        <Link href="/generate">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all">Start Generation</Button>
        </Link>
      </Card>

      {/* History */}
      <Card className="bg-card border-border p-6 flex flex-col justify-between rounded-[16px]">
        <div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
            <Compass size={20} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">History Analysis</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Review your previously generated posts, hooks, and historical metrics.
          </p>
        </div>
        <Link href="/history">
          <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-secondary transition-all">
            View History
          </Button>
        </Link>
      </Card>

      {/* Settings */}
      <Card className="bg-card border-border p-6 flex flex-col justify-between rounded-[16px]">
        <div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Update Profile</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Retrain your custom model by tweaking your niche, tone, and account settings.
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-secondary transition-all">
            Open Settings
          </Button>
        </Link>
      </Card>

    </div>
  );
}
