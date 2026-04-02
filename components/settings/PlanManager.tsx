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
         className={`h-10 rounded-sm font-bold uppercase tracking-widest text-[11px] shadow-none transition-all ${currentPlan === 'basic' ? 'bg-white/5 text-white/40 cursor-default' : 'bg-white hover:bg-white/90 text-black'}`}
       >
         {loading === 'basic' ? 'Processing...' : currentPlan === 'basic' ? 'Current: Basic' : 'Select Basic'}
       </Button>

       {/* PRO CHECKOUT BUTTON */}
       <Button 
         onClick={() => handleCheckout('pro')} 
         disabled={loading !== null || currentPlan === 'pro'} 
         variant="outline" 
         className={`h-10 rounded-sm font-bold uppercase tracking-widest text-[11px] shadow-none border border-white/10 transition-colors ${currentPlan === 'pro' ? 'cursor-default text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-white hover:bg-white/5 bg-transparent'}`}
       >
         {loading === 'pro' ? 'Processing...' : currentPlan === 'pro' ? 'Current: Pro' : 'Select Pro'}
       </Button>
    </div>
  );
}
