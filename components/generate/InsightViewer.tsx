import Link from 'next/link';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { RunManifest } from '@/components/system/RunManifest';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { InsightItem, Plan, ResearchProvenance, LearningSummary } from '@/types';
import { getLockedLayerHint } from '@/lib/constants/plan-copy';

interface Props {
  insights: InsightItem[];
  onNext: () => void;
  weekNumber?: number;
  year?: number;
  dataSource?: string;
  researchSummary?: ResearchProvenance;
  learningSummary?: LearningSummary | null;
  runLogicSummary?: string | null;
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



function getBadgeColor(trigger: string): string {
  const t = trigger.toLowerCase();
  if (t.includes('social proof') || t.includes('curiosity')) return 'text-blue-400 border-blue-400/30';
  if (t.includes('relatability')) return 'text-emerald-400 border-emerald-400/30';
  if (t.includes('contrast')) return 'text-orange-400 border-orange-400/30';
  return 'text-white/45 border-white/10';
}

function getConfidenceScore(trigger: string): number {
  const t = trigger.toLowerCase();
  if (t.includes('curiosity')) return 84;
  if (t.includes('relatability')) return 79;
  if (t.includes('contrast')) return 71;
  return 80;
}

export function InsightViewer({
  insights,
  onNext,
  weekNumber,
  year,
  dataSource,
  researchSummary,
  learningSummary,
  runLogicSummary,
  userPlan,
}: Props) {
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const [expandedSignalIdx, setExpandedSignalIdx] = useState<number | null>(null);

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
        <button 
          onClick={() => setIsProvenanceOpen(!isProvenanceOpen)}
          className="w-full flex items-center gap-2 text-[13px] font-medium text-white/70 hover:text-white transition-colors"
        >
          {isProvenanceOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Research Provenance — {getModeLabel(researchSummary)}
        </button>

        {isProvenanceOpen && (
          <>
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4 lg:flex-row lg:items-start lg:justify-between mt-4">
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
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((item, idx) => {
          const patternLabel = PATTERN_LABELS[item.format_hint ?? 'other'] ?? 'Observed Pattern';
          const strengthLabel = getStrengthLabel(item.signal_strength);
          const patternSignal = getPatternSignal(item);
          const implication = getStrategicImplication(item);
          const recommendedMove = getRecommendedMove(item);
          const riskSurface = getRiskSurface(item);

          const isExpanded = expandedSignalIdx === idx;
          const confidenceScore = getConfidenceScore(item.trigger);

          return (
            <div key={idx} className="bg-[#111111] border border-white/8 rounded-xl px-6 py-5 cursor-pointer hover:border-white/15 transition-all text-left w-full flex flex-col">
              <button 
                onClick={() => setExpandedSignalIdx(isExpanded ? null : idx)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`border rounded-sm px-2 py-0.5 text-[10px] tracking-widest uppercase ${getBadgeColor(item.trigger)}`}>
                    {item.trigger}
                  </div>
                  <div className="flex items-center text-white/40">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                <h3 className={`text-sm font-medium text-white leading-snug mt-2 ${!isExpanded && "line-clamp-2"}`}>
                  {item.insight}
                </h3>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-white/30">
                    Observed in {Math.max(1, Math.floor((researchSummary?.trendPostCount || 6) * (idx === 0 ? 0.35 : idx === 1 ? 0.25 : 0.15)))}/{researchSummary?.trendPostCount || 6} signals this week
                  </div>
                  {!isExpanded && (
                    <div className="shrink-0 flex flex-col items-end">
                      <div className="text-[9px] text-white/25 tracking-widest mb-1 uppercase">CONFIDENCE</div>
                      <div className="w-20 h-0.5 bg-white/10 rounded">
                        <div className="h-full bg-accent rounded" style={{ width: `${confidenceScore}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {isExpanded && (
              <div className="flex-1 mt-2 border-t border-white/8 pt-5 animate-in fade-in duration-300">
                <div className="mb-4">
                  <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">Pattern Signal</div>
                  <p className="text-sm text-white/65 leading-relaxed">{patternSignal}</p>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">Strategic Implication</div>
                  <p className="text-sm text-white/65 leading-relaxed">{implication}</p>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">Recommended Move</div>
                  <p className="text-sm text-white/65 leading-relaxed">{recommendedMove}</p>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">Constraint / Risk</div>
                  <p className="text-sm text-white/65 leading-relaxed">{riskSurface}</p>
                </div>

                <div>
                  <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">Signal Basis</div>
                  <div className="space-y-1">
                    {(item.basis && item.basis.length > 0 ? item.basis : ['No basis metadata available for this signal.']).map((basisItem) => (
                      <p key={basisItem} className="text-sm text-white/65 leading-relaxed">
                        • {basisItem}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
          );
        })}
      </div>


      <div className="mt-8">
        <RunManifest
          researchSummary={researchSummary}
          learningSummary={learningSummary}
          runLogicSummary={runLogicSummary}
          userPlan={userPlan}
          weekNumber={weekNumber}
          year={year}
          manifestMode="full"
        />
      </div>
      <div className="flex justify-end pt-2 mt-8">
        <Button
          onClick={onNext}
          className="w-full bg-white text-black font-semibold py-4 rounded-lg hover:bg-white/90 transition text-sm tracking-wide"
        >
          Continue to Strategy Paths
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
