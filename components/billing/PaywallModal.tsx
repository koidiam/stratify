"use client";

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
}

export function PaywallModal({ open, onOpenChange, used, limit }: PaywallModalProps) {
  const router = useRouter();

  const handleUpgradeNavigation = () => {
    onOpenChange(false);
    router.push('/settings');
  };

  const blockedStages = [
    'Signal Scan',
    'Hook Generation',
    'Draft Generation'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md str-panel bg-[#050505] !border-amber-500/20 rounded-sm p-0 shadow-2xl overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-sm font-bold tracking-widest uppercase text-amber-500 flex items-center gap-3">
              <AlertCircle className="w-4 h-4" />
              Usage Limit Reached
            </DialogTitle>
            <DialogDescription className="text-[11px] text-white/50 pt-2 leading-relaxed font-mono">
              Paused: {used} / {limit} weekly queries used.<br/>Generation pipeline is currently locked.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-white/5 bg-white/[0.02] rounded-sm p-4 mb-6">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-4">
              Paused Operations
            </div>
            <ul className="space-y-3">
              {blockedStages.map((stage, i) => (
                <li key={i} className="flex items-center text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  <Lock className="w-3 h-3 mr-3 text-amber-500/50" />
                  {stage}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] font-mono text-emerald-500/80 uppercase tracking-widest mb-2">
            To resume access, expand your license tier in Settings.
          </p>
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
            View Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
