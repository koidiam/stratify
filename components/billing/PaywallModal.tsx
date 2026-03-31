"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { useFoundingStatus } from '@/hooks/useFoundingStatus';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
}

export function PaywallModal({ open, onOpenChange, used, limit }: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { loaded, available, remaining } = useFoundingStatus();

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
      <DialogContent className="max-w-[42rem] bg-card border-border rounded-[24px]">
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
            {loaded && (
               <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm ${available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                 {available ? `Founding Offer — ${remaining} Spots Left` : 'Founding Sold Out'}
               </div>
            )}
            <h3 className="font-bold text-xl mb-1 text-foreground mt-2">Basic</h3>
            <p className="text-sm text-muted-foreground mb-4">Steady professional growth</p>
            <div className="mb-6 font-semibold flex items-baseline flex-wrap gap-2">
              {available ? (
                <>
                  <div className="flex items-baseline">
                    <span className="text-4xl tracking-tight">$9</span>
                    <span className="text-muted-foreground font-normal ml-1">/mo</span>
                  </div>
                  <span className="text-sm text-muted-foreground line-through ml-1">$15/mo</span>
                </>
              ) : (
                <div className="flex items-baseline">
                  <span className="text-4xl tracking-tight">$15</span>
                  <span className="text-muted-foreground font-normal ml-1">/mo</span>
                </div>
              )}
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
            {loaded && (
               <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm ${available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                 {available ? `Founding Offer — ${remaining} Spots Left` : 'Founding Sold Out'}
               </div>
            )}
            <h3 className="font-bold text-xl mb-1 text-foreground flex items-center gap-2 mt-2">
               Pro {available && <Sparkles className="h-4 w-4 text-primary" />}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Complete scaling solution</p>
            <div className="mb-6 font-semibold flex items-baseline flex-wrap gap-2">
              {available ? (
                <>
                  <div className="flex items-baseline">
                    <span className="text-4xl tracking-tight">$19</span>
                    <span className="text-muted-foreground font-normal ml-1">/mo</span>
                  </div>
                  <span className="text-sm text-muted-foreground line-through ml-1">$29/mo</span>
                </>
              ) : (
                <div className="flex items-baseline">
                  <span className="text-4xl tracking-tight">$29</span>
                  <span className="text-muted-foreground font-normal ml-1">/mo</span>
                </div>
              )}
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
