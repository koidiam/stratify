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
      <DialogContent className="max-w-md bg-card border-border rounded-[20px] p-6 shadow-lg">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="text-muted-foreground w-5 h-5" />
            Weekly Limit Reached
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2 leading-relaxed">
            You have used {used} of {limit} available weekly generations. Processing is currently paused.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary/40 border border-border/50 rounded-xl p-4 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Paused Operations
          </div>
          <ul className="space-y-2.5">
            {blockedStages.map((stage, i) => (
              <li key={i} className="flex items-center text-sm text-muted-foreground/80">
                <Lock className="w-3.5 h-3.5 mr-2.5 opacity-60" />
                {stage}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          To continue this week, review your plan options in Settings.
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={handleUpgradeNavigation}
          >
            Go to Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
