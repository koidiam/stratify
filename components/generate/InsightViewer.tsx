import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Insight {
  insight: string;
  why: string;
  trigger: string;
}

interface Props {
  insights: Insight[];
  onNext: () => void;
}

export function InsightViewer({ insights, onNext }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[24px] border border-border bg-card p-6 lg:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Sparkles className="text-primary w-5 h-5 opacity-80" />
          Weekly Strategy Report
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Latest trends, psychological frameworks, and audience analysis in your niche. 
          These patterns form the foundation for your hooks and drafts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item, idx) => (
          <Card 
            key={idx} 
            className="flex flex-col rounded-[20px] border-border bg-card shadow-sm p-6 transition-all hover:-translate-y-1 hover:border-primary/30"
          >
            <div className="flex-1">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-primary">Insight 0{idx + 1}</div>
              <h3 className="mb-3 text-base font-semibold leading-snug text-foreground">{item.insight}</h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{item.why}</p>
              
              <div className="rounded-xl border border-border bg-secondary p-4 text-xs text-muted-foreground">
                <span className="mb-1.5 block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Psychological Trigger</span>
                {item.trigger}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                Based on patterns in your niche
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext}
          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium text-sm px-6 h-10"
        >
          View Hooks & Drafts
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
