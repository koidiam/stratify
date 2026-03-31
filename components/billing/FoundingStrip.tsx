import { Sparkles, Users, Loader2 } from 'lucide-react';
import { FoundingStatusType } from '@/hooks/useFoundingStatus';

interface FoundingStripProps {
  plan: 'BASIC' | 'PRO';
  status: FoundingStatusType;
  claimed: number;
  total: number;
}

export function FoundingStrip({ plan, status, claimed, total }: FoundingStripProps) {
  if (status === 'loading') {
    return (
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-center min-h-[110px] shadow-sm">
         <div className="flex items-center gap-2 text-muted-foreground/70 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Checking availability...</span>
         </div>
      </div>
    );
  }

  const foundingPrice = plan === 'BASIC' ? '$9' : '$19';
  const isAvailable = status === 'available';
  const isSoldOut = status === 'sold_out';
  const isError = status === 'error';

  // If sold out, force max fill. If error, don't show dynamic fill just empty state.
  const percentage = isSoldOut ? 100 : isError ? 0 : (claimed / total) * 100;

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden shadow-sm">
      <div 
        className={`absolute top-0 left-0 bottom-0 bg-primary/10 transition-all duration-1000 ease-in-out ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
        style={{ width: `${percentage}%` }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`h-4 w-4 ${isAvailable || isError ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${isAvailable || isError ? 'text-primary' : 'text-muted-foreground'}`}>
              {isSoldOut ? 'Founding Offer Sold Out' : 'Founding Member Access'}
            </span>
          </div>
          {!isError && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-background/60 rounded-full px-2.5 py-1 tracking-tight backdrop-blur-sm">
              <Users className="h-3 w-3" />
              {isSoldOut ? `${total} / ${total}` : `${claimed} / ${total}`} Claimed
            </div>
          )}
        </div>
        
        <p className="text-[13px] text-muted-foreground mb-3 font-medium">
          {isSoldOut 
            ? `All ${total} spots have been claimed. Regular pricing applies.`
            : isError 
            ? `Founding availability temporarily unavailable.`
            : `Only ${Math.max(0, total - claimed)} spots left. Lock in early-adopter pricing forever.`}
        </p>
        
        <div className="flex items-baseline gap-2 mt-auto">
          <span className={`text-2xl font-bold tracking-tight ${isAvailable || isError ? 'text-foreground' : 'text-muted-foreground line-through opacity-70'}`}>
            {foundingPrice}
          </span>
          <span className={`text-sm font-medium ${isAvailable || isError ? 'text-muted-foreground' : 'text-muted-foreground/50 line-through'}`}>
            /mo forever
          </span>
        </div>
      </div>
    </div>
  );
}
