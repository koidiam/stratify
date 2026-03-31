"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { useFoundingStatus } from '@/hooks/useFoundingStatus';
import { FoundingStrip } from '@/components/billing/FoundingStrip';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
}

export function PaywallModal({ open, onOpenChange, used, limit }: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { loaded, available, claimed, total } = useFoundingStatus();

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize checkout');
      if (data.url) {
         window.location.href = data.url;
      } else {
         throw new Error('Checkout URL missing');
      }
    } catch (e: unknown) {
      const err = e as Error;
      alert('Could not start checkout: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[44rem] bg-card border-border rounded-[24px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            Weekly limit reached
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            You have used {used} of {limit} weekly generations. Upgrade your plan to produce more winning strategies.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Basic Card */}
          <div className="border border-border bg-secondary/30 rounded-2xl p-6 relative flex flex-col">
            <FoundingStrip plan="BASIC" loaded={loaded} available={available} claimed={claimed} total={total} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl mb-1 text-foreground">Basic</h3>
                <p className="text-sm text-muted-foreground">Steady professional growth</p>
              </div>
            </div>
            <div className="mb-6 font-semibold flex items-baseline">
              <span className="text-4xl tracking-tight">$15</span>
              <span className="text-muted-foreground font-normal ml-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center text-sm font-medium"><Check className="text-primary mr-2 h-4 w-4" /> 3 Generations / week</li>
               <li className="flex items-center text-sm text-muted-foreground"><Check className="text-muted-foreground mr-2 h-4 w-4" /> Custom Niche Tuning</li>
            </ul>
            <Button
              className="w-full bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
              onClick={() => handleCheckout(available ? 'founding_basic' : 'basic')}
              disabled={loading !== null || !loaded}
            >
              {loading === (available ? 'founding_basic' : 'basic') ? <Loader2 className="animate-spin h-4 w-4" /> : available ? 'Claim Founding Offer ($9)' : 'Upgrade to Basic'}
            </Button>
          </div>

          {/* Pro Card */}
          <div className="border border-primary/40 bg-primary/5 rounded-2xl p-6 relative flex flex-col shadow-sm">
            <FoundingStrip plan="PRO" loaded={loaded} available={available} claimed={claimed} total={total} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl mb-1 text-foreground flex items-center gap-2">
                  Pro <Sparkles className="h-4 w-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground">Complete scaling solution</p>
              </div>
            </div>
            <div className="mb-6 font-semibold flex items-baseline">
              <span className="text-4xl tracking-tight">$29</span>
              <span className="text-muted-foreground font-normal ml-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center text-sm font-medium"><Check className="text-primary mr-2 h-4 w-4" /> 50 Generations / week</li>
               <li className="flex items-center text-sm text-muted-foreground"><Check className="text-muted-foreground mr-2 h-4 w-4" /> Advanced Hooks Strategy</li>
            </ul>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-primary/20"
              onClick={() => handleCheckout(available ? 'founding_pro' : 'pro')}
              disabled={loading !== null || !loaded}
            >
              {loading === (available ? 'founding_pro' : 'pro') ? <Loader2 className="animate-spin h-4 w-4" /> : available ? 'Claim Founding Offer ($19)' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
