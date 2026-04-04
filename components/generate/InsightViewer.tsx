import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { InsightItem, Plan, ResearchProvenance } from '@/types';
import { getLockedLayerHint } from '@/lib/constants/plan-copy';

interface Props {
  insights: InsightItem[];
  onNext: () => void;
  weekNumber?: number;
  year?: number;
  dataSource?: string;
  researchSummary?: ResearchProvenance;
  userPlan: Plan;
}

const PATTERN_LABELS: Record<NonNullable<InsightItem['format_hint']>, string> = {
  list: 'List Pattern',
  story: 'Story Pattern',
  'hook-question': 'Hook-Question Pattern',
  contrarian: 'Contrarian Pattern',
  'data-driven': 'Data-Driven Pattern',
  other: 'Observed Pattern',
};

function getModeLabel(summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';
  if (summary.sourceMode === 'live') return 'Live research input';
  if (summary.sourceMode === 'cached') return 'Cached research input';
  return 'Profile context only';
}

function getModeDetail(summary?: ResearchProvenance): string {
  if (!summary) return 'Research metadata will appear once extraction completes.';
  if (summary.sourceMode === 'live') {
    return summary.retainedPostCount > 0
      ? 'Signal extraction used a live LinkedIn research set for this run.'
      : 'A live research attempt ran, but no retained market posts were attached.';
  }
  if (summary.sourceMode === 'cached') {
    return summary.retainedPostCount > 0
      ? 'Signal extraction used cached LinkedIn research retained from prior scans.'
      : 'Cached research context was checked, but no retained market posts were attached.';
  }
  return 'No LinkedIn market post set was attached. The engine used onboarding context and recent feedback only.';
}

function getMarketInputLabel(summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';
  if (summary.marketInputStatus === 'trend-and-reference') return 'Trend + reference';
  if (summary.marketInputStatus === 'trend-only') return 'Trend only';
  if (summary.marketInputStatus === 'reference-only') return 'Reference only';
  return 'Profile context only';
}

function getRetainedSampleLabel(summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';
  return `${summary.analyzedPostCount} scanned · ${summary.retainedPostCount} retained`;
}

function formatSourceTypeLabel(sourceType: ResearchProvenance['sourceMode']): string {
  if (sourceType === 'live') return 'Live';
  if (sourceType === 'cached') return 'Cached';
  return 'None';
}

function getTrendLayerLabel(summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';
  if (summary.trendSourceType === 'none') return 'Not attached';
  return `${formatSourceTypeLabel(summary.trendSourceType)} · ${summary.trendPostCount} retained`;
}

function getReferenceLayerLabel(summary: ResearchProvenance | undefined, userPlan: Plan): string {
  if (!summary) return 'Pending';
  if (summary.referencePostCount > 0) {
    return `${formatSourceTypeLabel(summary.referenceSourceType)} · ${summary.referencePostCount} retained`;
  }
  if (summary.referenceInputCount > 0 && userPlan !== 'pro') {
    return 'Sealed above current layer';
  }
  if (summary.referenceInputCount > 0) {
    return 'Provided, not attached';
  }
  return 'Not provided';
}

function getFilterAuditLabel(summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';

  const notes: string[] = [];

  if (summary.lowSignalFilterApplied) {
    notes.push(
      summary.lowSignalPostsFiltered > 0
        ? `${summary.lowSignalPostsFiltered} lower-signal removed`
        : 'Lower-signal filter ran'
    );
  }

  if (summary.jobPostFilterApplied) {
    notes.push(
      summary.jobPostsExcluded > 0
        ? `${summary.jobPostsExcluded} hiring-style removed`
        : 'Hiring-style screen ran'
    );
  }

  return notes.length > 0 ? notes.join(' · ') : 'No post-filter pass ran';
}

function getStrengthLabel(strength?: InsightItem['signal_strength']): string | null {
  if (!strength) return null;
  if (strength === 'strong') return 'Strong signal';
  if (strength === 'moderate') return 'Moderate signal';
  return 'Weak signal';
}

function getStrengthClassName(strength?: InsightItem['signal_strength']): string {
  if (strength === 'strong') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  }
  if (strength === 'moderate') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  }
  return 'border-white/10 bg-white/[0.02] text-white/50';
}

function getPatternSignal(item: InsightItem): string {
  if (item.pattern && item.pattern.trim().length > 0) {
    return item.pattern.trim();
  }

  return 'A repeated structure is visible in the retained sample, but the pattern detail was not attached to this record.';
}

function getStrategicImplication(item: InsightItem): string {
  if (item.implication && item.implication.trim().length > 0) {
    return item.implication.trim();
  }

  if (item.why && item.why.trim().length > 0) {
    return item.why.trim();
  }

  return 'No strategic implication was attached to this signal.';
}

function getRecommendedMove(item: InsightItem): string {
  if (item.recommended_move && item.recommended_move.trim().length > 0) {
    return item.recommended_move.trim();
  }

  if (item.format_hint === 'data-driven') {
    return 'Lean into firsthand breakdowns with one metric and one operating lesson.';
  }

  if (item.format_hint === 'story') {
    return 'Lead with the turning point before the outcome so the tension lands first.';
  }

  if (item.format_hint === 'contrarian') {
    return 'Target one familiar default belief, then reframe it with a concrete reason or result.';
  }

  if (item.format_hint === 'hook-question') {
    return 'Test an open-loop entry that delays the answer until after the first tension beat.';
  }

  if (item.format_hint === 'list') {
    return 'Package the idea as a narrow list tied to one repeated audience mistake.';
  }

  return 'Turn the signal into one narrow angle, one concrete example, and one clear test.';
}

function getExecutionConstraints(trigger: string, insight: string): { performsWhen: string; breaksWhen: string } {
  const t = trigger.toLowerCase();
  const i = insight.toLowerCase();

  if (t.includes('curiosity') || i.includes('question') || i.includes('gap')) {
    return {
      performsWhen: 'the hook withholds resolution and forces the reader to keep reading.',
      breaksWhen: 'the answer appears in the first two lines.',
    };
  }
  if (t.includes('social proof') || i.includes('data') || i.includes('metric') || i.includes('result')) {
    return {
      performsWhen: 'the proof is firsthand, specific, and attached to a concrete number or outcome.',
      breaksWhen: 'the claim is implied, secondhand, or missing a verifiable detail.',
    };
  }
  if (t.includes('contrast') || i.includes('contrarian') || i.includes('wrong') || i.includes('mistake')) {
    return {
      performsWhen: 'the opposing view is named clearly before the reframe lands.',
      breaksWhen: 'the contrast is vague or the reframe sounds like generic advice.',
    };
  }
  if (t.includes('relatability') || i.includes('story') || i.includes('founder') || i.includes('personal')) {
    return {
      performsWhen: 'the situation is recognizable to the reader within the first sentence.',
      breaksWhen: 'the story takes more than 3 lines to reach the tension point.',
    };
  }
  if (t.includes('progress') || i.includes('growth') || i.includes('milestone') || i.includes('user')) {
    return {
      performsWhen: 'the progress is tied to a specific timeframe and a single causal change.',
      breaksWhen: 'the metric floats without context or a before-state.',
    };
  }

  return {
    performsWhen: 'the observed shift is visible and specific enough to trigger self-recognition.',
    breaksWhen: 'the framing stays abstract or could apply to any niche.',
  };
}

function getRiskSurface(item: InsightItem): string {
  if (item.risk && item.risk.trim().length > 0) {
    return item.risk.trim();
  }

  const constraints = getExecutionConstraints(item.trigger, item.insight);
  return `Works best when ${constraints.performsWhen} Weakens when ${constraints.breaksWhen}`;
}

export function InsightViewer({
  insights,
  onNext,
  weekNumber,
  year,
  dataSource,
  researchSummary,
  userPlan,
}: Props) {
  if (insights.length === 0) return null;

  const sourceLabel = dataSource ?? 'Niche signals';
  const timeLabel = weekNumber && year ? `Week ${weekNumber}, ${year}` : 'This week';
  const sealedDepthHint = (() => {
    if (userPlan === 'pro') return null;
    if (researchSummary?.referenceInputCount) {
      return getLockedLayerHint(userPlan, 'reference');
    }
    return getLockedLayerHint(userPlan, 'cached');
  })();

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

      <div className="str-panel rounded-sm border border-white/10 p-5 lg:p-6">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80">
              Signal extraction complete
            </div>
            <h3 className="mt-2 text-base font-semibold text-white">Research Provenance</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
              {getModeDetail(researchSummary)}
            </p>
          </div>
          <div className="rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white/60">
            {sourceLabel}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-sm border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Research Mode</div>
            <p className="mt-2 text-sm font-medium text-white/84">{getModeLabel(researchSummary)}</p>
          </div>
          <div className="rounded-sm border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Market Input</div>
            <p className="mt-2 text-sm font-medium text-white/84">{getMarketInputLabel(researchSummary)}</p>
          </div>
          <div className="rounded-sm border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Retained Sample</div>
            <p className="mt-2 text-sm font-medium text-white/84">{getRetainedSampleLabel(researchSummary)}</p>
          </div>
          <div className="rounded-sm border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Trend Layer</div>
            <p className="mt-2 text-sm font-medium text-white/84">{getTrendLayerLabel(researchSummary)}</p>
          </div>
          <div className="rounded-sm border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Reference Layer</div>
            <p className="mt-2 text-sm font-medium text-white/84">
              {getReferenceLayerLabel(researchSummary, userPlan)}
            </p>
          </div>
          <div className="rounded-sm border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Filter Audit</div>
            <p className="mt-2 text-sm font-medium text-white/84">{getFilterAuditLabel(researchSummary)}</p>
          </div>
        </div>

        {sealedDepthHint && (
          <div className="mt-4 rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-300/90">
                  {sealedDepthHint.eyebrow}
                </div>
                <p className="mt-2 text-sm font-medium text-white">{sealedDepthHint.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  {sealedDepthHint.detail}
                </p>
              </div>

              <Link
                href="/settings"
                className="inline-flex h-10 items-center justify-center rounded-sm border border-white/10 px-4 text-[11px] font-bold uppercase tracking-widest text-white/72 transition-colors hover:border-white/20 hover:text-white"
              >
                Review System Depth
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((item, idx) => {
          const patternLabel = PATTERN_LABELS[item.format_hint ?? 'other'] ?? 'Observed Pattern';
          const strengthLabel = getStrengthLabel(item.signal_strength);
          const patternSignal = getPatternSignal(item);
          const implication = getStrategicImplication(item);
          const recommendedMove = getRecommendedMove(item);
          const riskSurface = getRiskSurface(item);

          return (
            <Card key={idx} className="flex flex-col rounded-sm str-panel p-5 transition-colors hover:border-white/20">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="str-mono text-white/65">SIGNAL_{String(idx + 1).padStart(2, '0')}</div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {strengthLabel && (
                      <div className={`rounded-sm border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${getStrengthClassName(item.signal_strength)}`}>
                        {strengthLabel}
                      </div>
                    )}
                    <div className="rounded-sm border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-white/45">
                      {item.trigger}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Strategic Signal</div>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-white/92">{item.insight}</h3>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Pattern Signal</div>
                    <div className="rounded-sm border border-white/10 bg-black/20 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-white/50">
                      {patternLabel}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-white/76">{patternSignal}</p>
                </div>

                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Strategic Implication</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/68">{implication}</p>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Recommended Move</div>
                  <p className="text-sm leading-relaxed text-white/76">{recommendedMove}</p>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Constraint / Risk</div>
                  <p className="text-sm leading-relaxed text-white/60">{riskSurface}</p>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Signal Basis</div>
                  <div className="space-y-2">
                    {(item.basis && item.basis.length > 0 ? item.basis : ['No basis metadata available for this signal.']).map((basisItem) => (
                      <div key={basisItem} className="rounded-sm border border-white/10 bg-black/20 px-3 py-2 text-xs leading-relaxed text-white/72">
                        {basisItem}
                      </div>
                    ))}
                  </div>
                </div>
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
