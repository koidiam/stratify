import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
  researchUsed?: boolean;
  trendPostCount?: number;
}

function normalizeSystemTone(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bThis works because\b/gi, '')
    .replace(/\bThis pattern emerges when\b/gi, 'Emerges when ')
    .replace(/\bThis is great for\b/gi, '')
    .replace(/\bThis is best for\b/gi, '')
    .replace(/\bThis means\b/gi, '')
    .replace(/\bThis indicates that\b/gi, '')
    .replace(/\bYou should\b/gi, '')
    .replace(/\bYou can\b/gi, '')
    .replace(/\bUse when\b/gi, 'Rises when ')
    .replace(/\bhelps build trust by\b/gi, 'trust rises from ')
    .replace(/\bbuilds trust by\b/gi, 'trust rises from ')
    .replace(/\bpeople\b/gi, 'audience')
    .trim();
}

function getSupportingNote(why: string): string | null {
  const normalized = normalizeSystemTone(why);
  const lower = normalized.toLowerCase();

  if (!normalized) return null;
  if (/(proof|result|evidence|example|case|experience)/.test(lower)) return 'Proof load is visible.';
  if (/(data|metric|number|specific|concrete)/.test(lower)) return 'Concrete detail carries weight.';
  if (/(recent|current|now|shift|trend|timing)/.test(lower)) return 'Usually tied to recent movement.';
  if (/(story|personal|relatable|authentic|familiar)/.test(lower)) return 'Identity match is present.';
  if (/(question|gap|unknown|curiosity)/.test(lower)) return 'Open loop remains active.';
  if (/(contrast|contrarian|wrong|default|myth)/.test(lower)) return 'Contrast load is high.';

  const firstSentence = normalized.split(/[.!?]/)[0]?.trim();
  if (!firstSentence) return null;

  const compact = firstSentence
    .replace(/^(Emerges when|Rises when)\s+/i, '')
    .replace(/^that\s+/i, '')
    .trim();

  if (!compact) return null;
  return `${compact.charAt(0).toUpperCase()}${compact.slice(1)}.`;
}

function getSignalInterpretation(trigger: string, why: string): string {
  const t = trigger.toLowerCase();
  const detail = getSupportingNote(why);
  const parts: string[] = [];

  if (t.includes('curiosity')) {
    parts.push('Signals preference for unresolved gaps.');
  } else if (t.includes('social proof')) {
    parts.push('Signals preference for visible proof.');
  } else if (t.includes('scarcity')) {
    parts.push('Signals response to constrained access or timing.');
  } else if (t.includes('contrast')) {
    parts.push('Signals response to position contrast.');
  } else if (t.includes('relatability')) {
    parts.push('Signals self-recognition in the audience.');
  } else if (t.includes('progress')) {
    parts.push('Signals preference for visible progress.');
  } else {
    parts.push('Signals emerging audience preference.');
  }

  if (detail) parts.push(detail);
  return parts.join(' ');
}

function getExecutionConstraints(trigger: string, insight: string): { performsWhen: string; breaksWhen: string } {
  const t = trigger.toLowerCase();
  const i = insight.toLowerCase();

  if (t.includes('curiosity') || i.includes('question')) {
    return {
      performsWhen: 'open loops stay unresolved at the start.',
      breaksWhen: 'resolution lands too early.',
    };
  }
  if (t.includes('social proof') || i.includes('proof') || i.includes('personal')) {
    return {
      performsWhen: 'proof is firsthand and visible.',
      breaksWhen: 'proof is implied or generic.',
    };
  }
  if (t.includes('scarcity') || t.includes('contrast') || i.includes('contrarian')) {
    return {
      performsWhen: 'category framing deviates from the default.',
      breaksWhen: 'contrast lacks support.',
    };
  }
  if (t.includes('relatability') || i.includes('story') || i.includes('authentic')) {
    return {
      performsWhen: 'self-recognition is immediate.',
      breaksWhen: 'story weight exceeds signal value.',
    };
  }
  if (t.includes('progress') || i.includes('data') || i.includes('metric')) {
    return {
      performsWhen: 'movement is concrete and recent.',
      breaksWhen: 'progress stays abstract.',
    };
  }

  return {
    performsWhen: 'the shift is already visible in-market.',
    breaksWhen: 'the observation stays generic.',
  };
}

export function InsightViewer({
  insights,
  onNext,
  weekNumber,
  year,
  dataSource,
  researchUsed,
  trendPostCount,
}: Props) {
  if (insights.length === 0) return null;

  const sourceLabel = dataSource ?? 'Niche signals';
  const timeLabel = weekNumber && year ? `Week ${weekNumber}, ${year}` : 'This week';

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
      <div className="str-panel rounded-sm p-5 lg:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-l-4 border-l-emerald-500">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80">Step 1 of 3 · Signals</div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white">Signals</h2>
          <p className="mt-2 max-w-xl text-sm text-white/65">
            Signals extracted from the current run. Next: Strategy Paths.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest">
            <span className="rounded-sm border border-white/10 bg-white/[0.02] px-2.5 py-1 text-white/65">
              {sourceLabel}
            </span>
            <span className="rounded-sm border border-white/10 bg-white/[0.02] px-2.5 py-1 text-white/65">
              {timeLabel}
            </span>
          </div>
          <Button
            onClick={onNext}
            className="rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold text-[11px] uppercase tracking-widest px-6 h-10"
          >
            Continue to Strategy Paths
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((item, idx) => {
          const interpretation = getSignalInterpretation(item.trigger, item.why);
          const constraints = getExecutionConstraints(item.trigger, item.insight);
          const patternLabel = `Pattern ${String.fromCharCode(65 + idx)}`;

          return (
            <Card key={idx} className="flex flex-col rounded-sm str-panel p-5 transition-colors hover:border-white/20">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="str-mono text-white/65">SIGNAL_{String(idx + 1).padStart(2, '0')}</div>
                  <div className="rounded-sm border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-white/45">
                    {item.trigger}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Pattern</div>
                  <div className="mt-2 text-sm font-medium text-white/84">{patternLabel}</div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Observed Shift</div>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-white/92">{item.insight}</h3>
                </div>

                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Signal Interpretation</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/68">{interpretation}</p>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Execution Constraints</div>
                  <p className="text-xs leading-relaxed text-white/72">
                    Rises when {constraints.performsWhen}
                  </p>
                  <p className="text-xs leading-relaxed text-white/55">
                    Breaks when {constraints.breaksWhen}
                  </p>
                </div>

                {researchUsed && (trendPostCount ?? 0) > 0 && (
                  <p className="mt-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    {trendPostCount} LinkedIn post analiz edildi
                  </p>
                )}
                {!researchUsed && (
                  <p className="mt-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Niche profili baz alındı · Canlı sinyal: Pro planda
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          className="rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold text-[11px] uppercase tracking-widest px-8 h-11"
        >
          Continue to Strategy Paths
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
