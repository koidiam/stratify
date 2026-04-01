'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PlanManager({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: 'basic' | 'pro') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
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
    <div className="grid gap-3 sm:grid-cols-2">
       {/* BASIC CHECKOUT BUTTON */}
       <Button 
         onClick={() => handleCheckout('basic')} 
         disabled={loading !== null || currentPlan === 'basic' || currentPlan === 'pro'}
         className={`font-medium ${currentPlan === 'basic' ? 'bg-primary/50 text-white cursor-default' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
       >
         {loading === 'basic' ? 'Redirecting...' : currentPlan === 'basic' ? 'Current Plan: Basic' : 'Upgrade to Basic'}
       </Button>

       {/* PRO CHECKOUT BUTTON */}
       <Button 
         onClick={() => handleCheckout('pro')} 
         disabled={loading !== null || currentPlan === 'pro'} 
         variant="outline" 
         className={`border-border font-medium ${currentPlan === 'pro' ? 'cursor-default text-primary border-primary/50' : 'text-foreground hover:bg-secondary'}`}
       >
         {loading === 'pro' ? 'Redirecting...' : currentPlan === 'pro' ? 'Current Plan: Pro' : 'Upgrade to Pro'}
       </Button>
    </div>
  );
}
