import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Insight {
  insight: string;
  why: string;
  trigger: string;
}

interface Props {
  insights: Insight[];
  onNext: () => void;
  weekNumber?: number;
  year?: number;
  dataSource?: string;
}

function getDecisionSupport(trigger: string, insight: string): { bestFor: string; useWhen: string } {
  const t = trigger.toLowerCase();
  const i = insight.toLowerCase();

  if (t.includes('curiosity') || i.includes('question')) {
    return { bestFor: 'Higher saves and shares', useWhen: 'You want a sharper opening' };
  }
  if (t.includes('social proof') || i.includes('proof') || i.includes('personal')) {
    return { bestFor: 'Trust building', useWhen: 'You can share a real result or experience' };
  }
  if (t.includes('scarcity') || t.includes('contrast') || i.includes('contrarian')) {
    return { bestFor: 'Contrarian positioning', useWhen: 'You have a strong opinion backed by proof' };
  }
  if (t.includes('relatability') || i.includes('story') || i.includes('authentic')) {
    return { bestFor: 'Story-led posts', useWhen: 'You want a more personal, trust-building post' };
  }
  if (t.includes('progress') || i.includes('data') || i.includes('metric')) {
    return { bestFor: 'Authority building', useWhen: 'You can support the claim with data' };
  }
  return { bestFor: 'Authority building', useWhen: 'You want to establish credibility' };
}

export function InsightViewer({ insights, onNext, weekNumber, year, dataSource }: Props) {
  if (insights.length === 0) return null;

  const sourceLabel = dataSource ?? 'Niche signals';
  const timeLabel = weekNumber && year ? `Week ${weekNumber}, ${year}` : 'This week';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="str-panel rounded-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Extracted Signals</h2>
          <p className="mt-2 text-sm text-white/50 max-w-xl font-light">
            Psychological patterns validated for your niche to guide strategy creation.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1.5">
          <div className="str-mono text-emerald-500/80 uppercase">
            <CheckCircle2 className="inline-block h-3 w-3 mr-1 mb-0.5" />
            Analysis Complete
          </div>
          <div className="str-mono text-white/40">
            {insights.length} {insights.length === 1 ? 'PATTERN' : 'PATTERNS'} IDENTIFIED
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item, idx) => {
          const decision = getDecisionSupport(item.trigger, item.insight);
          return (
          <Card 
            key={idx} 
            className="flex flex-col rounded-sm str-panel p-5 transition-colors hover:border-white/20 hover:bg-white/[0.02]"
          >
            <div className="flex-1 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="str-mono text-white/60">SIGNAL_{String(idx + 1).padStart(2, '0')}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/50">
                  Pattern {String.fromCharCode(65 + idx)}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white/90 leading-snug">{item.insight}</h3>
              </div>
              
              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Underlying Mechanism</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white/80">{item.trigger}</div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-light mt-2">{item.why}</p>
              </div>

              {/* Decision Support */}
              <div className="pt-3 border-t border-white/5 space-y-2.5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/20">Decision support</div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 shrink-0 pt-px">Best for</span>
                  <span className="text-xs text-white/60">{decision.bestFor}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 shrink-0 pt-px">Use when</span>
                  <span className="text-xs text-white/60">{decision.useWhen}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="str-mono">DATA SOURCE:</span>
                <span className="str-mono text-white/70">{sourceLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="str-mono">TIME WINDOW:</span>
                <span className="str-mono text-white/70">{timeLabel}</span>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext}
          className="rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold text-[11px] uppercase tracking-widest px-8 h-11"
        >
          View Strategy & Drafts
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
