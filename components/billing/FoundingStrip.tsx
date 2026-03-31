import { Sparkles, Users } from 'lucide-react';

interface FoundingStripProps {
  plan: 'BASIC' | 'PRO';
  loaded: boolean;
  available: boolean;
  claimed: number;
  total: number;
}

export function FoundingStrip({ plan, loaded, available, claimed, total }: FoundingStripProps) {
  if (!loaded) return null;

  const foundingPrice = plan === 'BASIC' ? '$9' : '$19';
  const percentage = (claimed / total) * 100;

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden shadow-sm">
      <div 
        className="absolute top-0 left-0 bottom-0 bg-primary/10 transition-all duration-1000 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`h-4 w-4 ${available ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${available ? 'text-primary' : 'text-muted-foreground'}`}>
              {available ? 'Founding Member Access' : 'Founding Offer Sold Out'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-background/60 rounded-full px-2.5 py-1 tracking-tight backdrop-blur-sm">
            <Users className="h-3 w-3" />
            {claimed} / {total} Claimed
          </div>
        </div>
        
        <p className="text-[13px] text-muted-foreground mb-3 font-medium">
          {available 
            ? `Limited to the first ${total} users. Lock in early-adopter pricing forever.` 
            : `All ${total} spots have been claimed. Regular pricing applies.`}
        </p>
        
        <div className="flex items-baseline gap-2 mt-auto">
          <span className={`text-2xl font-bold tracking-tight ${available ? 'text-foreground' : 'text-muted-foreground line-through opacity-70'}`}>
            {foundingPrice}
          </span>
          <span className={`text-sm font-medium ${available ? 'text-muted-foreground' : 'text-muted-foreground/50 line-through'}`}>
            /mo forever
          </span>
        </div>
      </div>
    </div>
  );
}
