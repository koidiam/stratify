import { Sparkles, Users } from 'lucide-react';
import { FoundingStatusType } from '@/hooks/useFoundingStatus';

interface FoundingStripProps {
  plan: 'BASIC' | 'PRO';
  status: FoundingStatusType;
  claimed: number;
  total: number;
  isYearly?: boolean;
  isFallback?: boolean;
}

export function FoundingStrip({
  plan,
  status,
  claimed,
  total,
  isYearly = false,
  isFallback = false,
}: FoundingStripProps) {
  if (status === 'loading') {
    // Silent height-matched skeleton instead of "Checking availability" UI
    return (
      <div className="mb-6 rounded-xl border border-border/10 bg-muted/5 p-4 flex flex-col justify-center min-h-[110px] opacity-50 animate-pulse" />
    );
  }

  const foundingPrice = plan === 'BASIC' ? (isYearly ? '$72' : '$9') : (isYearly ? '$144' : '$19');
  const isAvailable = status === 'available';
  const isSoldOut = status === 'sold_out';
  const isError = status === 'error';
  const isPreviewFallback = isFallback && !isError;

  // If sold out, force max fill. If error or preview fallback, don't imply live scarcity.
  const percentage = isSoldOut ? 100 : isError || isPreviewFallback ? 0 : (claimed / total) * 100;

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden shadow-sm">
      <div 
        className={`absolute bottom-0 left-0 top-0 bg-primary/10 transition-[width] duration-700 ease-out ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
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
            <div className="flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1 text-xs font-semibold tracking-tight text-muted-foreground">
              <Users className="h-3 w-3" />
              {isPreviewFallback ? `-- / ${total}` : isSoldOut ? `${total} / ${total}` : `${claimed} / ${total}`} Claimed
            </div>
          )}
        </div>
        
        <p className="text-[13px] text-muted-foreground mb-3 font-medium">
          {isSoldOut 
            ? `All ${total} spots have been claimed. Regular pricing applies.`
            : isError 
            ? `Founding availability temporarily unavailable.`
            : isPreviewFallback
            ? `Availability will appear here once founding access is configured.`
            : `Only ${Math.max(0, total - claimed)} spots left. Lock in early-adopter pricing forever.`}
        </p>

        {isPreviewFallback && (
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            Preview data
          </p>
        )}
        
        <div className="flex items-baseline gap-2 mt-auto">
          <span className={`text-2xl font-bold tracking-tight ${isAvailable || isError ? 'text-foreground' : 'text-muted-foreground line-through opacity-70'}`}>
            {foundingPrice}
          </span>
          <span className={`text-sm font-medium ${isAvailable || isError ? 'text-muted-foreground' : 'text-muted-foreground/50 line-through'}`}>
            {isYearly ? '/yr forever' : '/mo forever'}
          </span>
        </div>
      </div>
    </div>
  );
}
