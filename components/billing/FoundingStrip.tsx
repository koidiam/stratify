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
      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-center min-h-[110px] opacity-50 animate-pulse" />
    );
  }

  const foundingPrice = plan === 'BASIC' ? (isYearly ? '$72' : '$9') : (isYearly ? '$144' : '$19');
  const isAvailable = status === 'available';
  const isSoldOut = status === 'sold_out';
  const isError = status === 'error';
  const isUnavailable = isError || isFallback;

  // If sold out, force max fill. If unavailable, don't imply live scarcity.
  const percentage = isSoldOut ? 100 : isUnavailable ? 0 : (claimed / total) * 100;

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden shadow-sm">
      <div 
        className={`absolute bottom-0 left-0 top-0 bg-primary/10 transition-[width] duration-700 ease-out ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
        style={{ width: `${percentage}%` }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`h-4 w-4 ${isAvailable || isUnavailable ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${isAvailable || isUnavailable ? 'text-primary' : 'text-white/60'}`}>
              {isSoldOut ? 'Founding Offer Sold Out' : 'Founding Member Access'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1 text-xs font-semibold tracking-tight text-white/65">
              <Users className="h-3 w-3" />
              {isUnavailable ? 'Availability unavailable' : isSoldOut ? `${total} / ${total} claimed` : `${claimed} / ${total} claimed`}
            </div>
        </div>
        
        <p className="text-[13px] text-white/72 mb-3 font-medium">
          {isSoldOut 
            ? `All ${total} spots have been claimed. Regular pricing applies.`
            : isUnavailable
            ? `Founding availability is not available right now. The strip stays visible, but live founding counts are hidden until configuration is ready.`
            : `Only ${Math.max(0, total - claimed)} spots left. Lock in early-adopter pricing for the full weekly Stratify workflow.`}
        </p>

        {isUnavailable && (
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Neutral placeholder
          </p>
        )}
        
        <div className="flex items-baseline gap-2 mt-auto">
          <span className={`text-2xl font-bold tracking-tight ${isAvailable || isUnavailable ? 'text-foreground' : 'text-muted-foreground line-through opacity-70'}`}>
            {foundingPrice}
          </span>
          <span className={`text-sm font-medium ${isAvailable || isUnavailable ? 'text-white/60' : 'text-muted-foreground/50 line-through'}`}>
            {isYearly ? '/yr forever' : '/mo forever'}
          </span>
        </div>
      </div>
    </div>
  );
}
