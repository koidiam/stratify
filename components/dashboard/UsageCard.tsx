"use client"

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PLAN_LIMITS } from '@/lib/utils/usage';
import { Plan } from '@/types';

interface Props {
  plan: Plan;
  usage: number;
}

export function UsageCard({ plan = 'free', usage = 0 }: Props) {
  const limit = PLAN_LIMITS[plan] || 3;
  const percentage = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  
  const getBadgeColor = () => {
    if (plan === 'pro') return 'bg-primary text-primary-foreground border-none';
    if (plan === 'basic') return 'bg-emerald-500 text-white border-none';
    return 'bg-secondary text-secondary-foreground border-border border';
  };

  return (
    <Card className="bg-card border-border p-6 shadow-sm relative overflow-hidden rounded-[16px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Weekly Allowance</h2>
          <p className="text-sm text-muted-foreground">Limits reset every Monday.</p>
        </div>
        <Badge className={`mt-2 sm:mt-0 ${getBadgeColor()}`}>
          {plan.toUpperCase()} PLAN
        </Badge>
      </div>

      <div className="space-y-4 relative z-10">
         <div className="flex justify-between items-end text-sm">
          <span className="text-muted-foreground font-medium">Generation Limit</span>
          <span className="text-foreground font-semibold text-lg">
            {usage} <span className="text-muted-foreground/60 text-sm font-normal">/ {limit}</span>
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary border border-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {percentage >= 100 && (
          <p className="text-destructive/90 text-xs mt-2 font-medium">Weekly limit reached. Upgrade your plan to unlock more generations.</p>
        )}
        
        {percentage >= 80 && percentage < 100 && (
          <p className="text-amber-500/90 text-xs mt-2 font-medium">You are approaching your weekly limit.</p>
        )}

        {plan === 'free' && percentage < 100 && (
          <div className="text-[11px] text-muted-foreground mt-2 border border-border/50 bg-secondary/50 px-2 py-1.5 rounded-md flex items-center justify-between w-full">
            <span>Live scraping locked.</span>
            <Link href="/settings" className="text-primary hover:underline font-medium">Upgrade</Link>
          </div>
        )}

        <Link href="/generate" className="block mt-4">
          <Button
            disabled={percentage >= 100}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium disabled:bg-secondary disabled:text-muted-foreground"
          >
            {percentage >= 100 ? 'Limit Reached' : 'Run Stratify Engine'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
