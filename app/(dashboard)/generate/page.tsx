"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InsightViewer } from '@/components/generate/InsightViewer';
import { ContentHooks } from '@/components/generate/ContentHooks';
import { FinalPost } from '@/components/generate/FinalPost';
import { LiveStatus } from '@/components/system/LiveStatus';
import { createClient } from '@/lib/supabase/client';
import { PaywallModal } from '@/components/billing/PaywallModal';
import { getApiError, getErrorMessage, isWeeklyGeneration } from '@/lib/utils/parsers';
import { type StoredCycleRecord } from '@/lib/utils/history';
import {
  buildLearningSummary,
  type StoredFeedbackRecord,
} from '@/lib/utils/learning';
import {
  getLockedLayerHint,
  getPlanSourceSummary,
  getSignalScanDescription,
  getUpgradeButtonLabel,
  getUpgradeTriggerDescription,
} from '@/lib/constants/plan-copy';
import { LearningSummary, Plan, ResearchProvenance, WeeklyGeneration } from '@/types';

interface SetupContext {
  niche: string;
  targetAudience: string;
  tone: string;
}

interface LastRunContext {
  weekNumber: number;
  year: number;
  insight: string;
  createdAt: string;
}

interface PipelineStageItem {
  id: string;
  label: string;
  detail: string;
}

type EngineRunState = 'ready' | 'running' | 'results' | 'limit' | 'error';
type PipelineState = 'done' | 'running' | 'ready' | 'idle' | 'blocked';

function getTopInsight(record?: {
  insights?: Array<{ insight?: string | null }> | null;
} | null): string | null {
  if (
    Array.isArray(record?.insights) &&
    typeof record.insights[0]?.insight === 'string' &&
    record.insights[0].insight.trim()
  ) {
    return record.insights[0].insight.trim();
  }

  return null;
}

function getPipelineState(
  index: number,
  loading: boolean,
  activeIndex: number,
  runState: EngineRunState
): PipelineState {
  if (loading) {
    if (index < activeIndex) return 'done';
    if (index === activeIndex) return 'running';
    return 'idle';
  }

  if (runState === 'results') return 'done';
  if (runState === 'limit') return index === 0 ? 'blocked' : 'idle';
  if (runState === 'error') return index === 0 ? 'ready' : 'idle';
  return index === 0 ? 'ready' : 'idle';
}

function getPipelineStateLabel(state: PipelineState): string {
  if (state === 'done') return 'Done';
  if (state === 'running') return 'Running';
  if (state === 'ready') return 'Ready';
  if (state === 'blocked') return 'Blocked';
  return 'Idle';
}

function getPipelineStateClassName(state: PipelineState): string {
  if (state === 'done') return 'bg-emerald-400';
  if (state === 'running') return 'bg-white';
  if (state === 'ready') return 'bg-white/45';
  if (state === 'blocked') return 'bg-amber-400';
  return 'bg-white/15';
}

function getRunStateBadge(runState: EngineRunState): string {
  if (runState === 'running') return 'Run in progress';
  if (runState === 'results') return 'Run complete';
  if (runState === 'limit') return 'Run limit reached';
  if (runState === 'error') return 'Retry available';
  return 'Run ready';
}

function getRunStateHeadline(runState: EngineRunState): string {
  if (runState === 'running') return 'Run in progress';
  if (runState === 'results') return 'Run complete';
  if (runState === 'limit') return 'Run limit reached';
  if (runState === 'error') return 'Retry the run';
  return 'Run ready';
}

function getRunStateDescription(
  plan: Plan,
  runState: EngineRunState,
  sourceLabel: string,
  sourceDetail: string,
  limitState?: { used: number; limit: number } | null
): string {
  if (runState === 'running') {
    return 'The engine is processing the weekly sequence.';
  }

  if (runState === 'results') {
    return 'Signals, paths, and drafts are attached.';
  }

  if (runState === 'limit') {
    return `The weekly run budget is exhausted${limitState ? ` (${limitState.used}/${limitState.limit})` : ''}. ${getUpgradeTriggerDescription(plan)}`;
  }

  if (runState === 'error') {
    return 'Saved context held. Retry the run.';
  }

  return `${sourceLabel} attached. ${sourceDetail}`;
}

function getRunSourceLabel(plan: Plan, summary?: ResearchProvenance): string {
  if (summary?.sourceMode === 'live') return 'Live research set';
  if (summary?.sourceMode === 'cached') return 'Cached research set';
  if (summary?.sourceMode === 'none') return 'Profile context only';
  return plan === 'free' ? 'Cached niche signals' : 'Live LinkedIn signals';
}

function getRunSourceDetail(plan: Plan, summary?: ResearchProvenance): string {
  if (!summary) {
    return getPlanSourceSummary(plan).detail;
  }

  if (summary.sourceMode === 'live') {
    return summary.retainedPostCount > 0
      ? 'Live LinkedIn research is attached before extraction.'
      : 'Live research ran, but no retained posts were attached.';
  }

  if (summary.sourceMode === 'cached') {
    return summary.retainedPostCount > 0
      ? 'Cached research is attached before extraction.'
      : 'Cached research was checked, but no retained posts were attached.';
  }

  return 'No market post set is attached. The engine is using saved context and feedback.';
}

function getMarketInputLabel(summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';
  if (summary.marketInputStatus === 'trend-and-reference') return 'Trend + reference';
  if (summary.marketInputStatus === 'trend-only') return 'Trend only';
  if (summary.marketInputStatus === 'reference-only') return 'Reference only';
  return 'Profile context only';
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

function getReferenceLayerLabel(plan: Plan, summary?: ResearchProvenance): string {
  if (!summary) return 'Pending';
  if (summary.referencePostCount > 0) {
    return `${formatSourceTypeLabel(summary.referenceSourceType)} · ${summary.referencePostCount} retained`;
  }
  if (summary.referenceInputCount > 0 && plan !== 'pro') {
    return 'Sealed above current plan';
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
        ? `Low-signal filtered: ${summary.lowSignalPostsFiltered}`
        : 'Low-signal filter ran'
    );
  }

  if (summary.jobPostFilterApplied) {
    notes.push(
      summary.jobPostsExcluded > 0
        ? `Hiring-style excluded: ${summary.jobPostsExcluded}`
        : 'Hiring-style screen ran'
    );
  }

  return notes.length > 0 ? notes.join(' · ') : 'No post-filter pass ran';
}

function getLearningStateLabel(summary?: LearningSummary | null): string {
  if (!summary || summary.feedbackEntryCount === 0) {
    return 'Learning idle';
  }

  if (summary.status === 'directional') {
    return 'Directional learning live';
  }

  return 'Early learning live';
}

function getLearningStateDetail(summary?: LearningSummary | null): string {
  if (!summary || summary.feedbackEntryCount === 0) {
    return 'Log reviewed posts to activate learning.';
  }

  return (
    summary.bestPerformanceNote ??
    summary.cautionNote ??
    'Feedback is attached, but it is still too sparse to support a stronger adjustment claim.'
  );
}

export default function GeneratePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineStageIdx, setPipelineStageIdx] = useState(0);
  const [data, setData] = useState<WeeklyGeneration | null>(null);
  const [selectedPost, setSelectedPost] = useState('');
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallData, setPaywallData] = useState({ used: 0, limit: 0 });
  const [limitState, setLimitState] = useState<{ used: number; limit: number } | null>(null);
  const [userPlan, setUserPlan] = useState<Plan>('free');
  const [setupContext, setSetupContext] = useState<SetupContext>({
    niche: '',
    targetAudience: '',
    tone: '',
  });
  const [lastRunContext, setLastRunContext] = useState<LastRunContext | null>(null);
  const [learningSummary, setLearningSummary] = useState<LearningSummary | null>(null);

  const sourceSummary = getPlanSourceSummary(userPlan);
  const pipelineStages: PipelineStageItem[] = [
    {
      id: 'context',
      label: 'Load context',
      detail: 'Read saved profile, memory, feedback, and plan limits.',
    },
    {
      id: 'signals',
      label: 'Gather signals',
      detail: `${getSignalScanDescription(userPlan)} Saved context stays available if input thins out.`,
    },
    {
      id: 'patterns',
      label: 'Extract patterns',
      detail: 'Drop weak noise. Keep repeatable structures.',
    },
    {
      id: 'strategy',
      label: 'Form strategy',
      detail: 'Convert retained patterns into direction.',
    },
    {
      id: 'outputs',
      label: 'Generate outputs',
      detail: 'Compile signals, paths, and drafts.',
    },
  ];

  useEffect(() => {
    let cancelled = false;

    const fetchSetup = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      if (!cancelled && profile?.plan) {
        setUserPlan(profile.plan as Plan);
      }

      const { data: onboarding } = await supabase
        .from('onboarding')
        .select('niche, target_audience, tone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cancelled) {
        setSetupContext({
          niche: onboarding?.niche ?? '',
          targetAudience: onboarding?.target_audience ?? '',
          tone: onboarding?.tone ?? '',
        });
      }

      const { data: recentHistory } = await supabase
        .from('content_history')
        .select('id, week_number, year, created_at, insights, hooks, posts')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      const historyRecords = (recentHistory ?? []) as StoredCycleRecord[];
      const latestHistory = historyRecords[0] ?? null;

      const { data: recentFeedback } = await supabase
        .from('post_feedback')
        .select('history_id, post_index, views, likes, comments, reposts, notes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!cancelled) {
        setLearningSummary(
          buildLearningSummary(
            historyRecords,
            (recentFeedback ?? []) as StoredFeedbackRecord[]
          )
        );
      }

      const topInsight = getTopInsight(latestHistory);

      if (!cancelled) {
        if (
          latestHistory &&
          typeof latestHistory.week_number === 'number' &&
          typeof latestHistory.year === 'number' &&
          topInsight
        ) {
          setLastRunContext({
            weekNumber: latestHistory.week_number,
            year: latestHistory.year,
            insight: topInsight,
            createdAt: latestHistory.created_at,
          });
        } else {
          setLastRunContext(null);
        }
      }
    };

    void fetchSetup();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setPipelineStageIdx(0);
      return;
    }

    const timer = window.setInterval(() => {
      setPipelineStageIdx((prev) => Math.min(prev + 1, pipelineStages.length - 1));
    }, 1300);

    return () => window.clearInterval(timer);
  }, [loading, pipelineStages.length]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setLimitState(null);
    setData(null);
    setStep(0);
    setSelectedPost('');
    setSelectedPostIndex(null);

    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const json: unknown = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const payload = json as Record<string, unknown>;
          if (payload.code === 'limit_reached') {
            const nextLimitState = {
              used: Number(payload.used) || 0,
              limit: Number(payload.limit) || 0,
            };
            setPaywallData(nextLimitState);
            setLimitState(nextLimitState);
            setShowPaywall(true);
            return;
          }
        }

        const apiError = getApiError(json);
        throw new Error(apiError ?? 'An error occurred');
      }

      if (!isWeeklyGeneration(json)) {
        throw new Error('AI response format was invalid.');
      }

      setData(json);
      const nextCreatedAt = new Date().toISOString();
      const nextInsight = getTopInsight(json);

      if (nextInsight) {
        setLastRunContext({
          weekNumber: json.week_number,
          year: json.year,
          insight: nextInsight,
          createdAt: nextCreatedAt,
        });
      }

      setStep(1);
      toast.success('Weekly analysis completed successfully!');
    } catch (nextError: unknown) {
      const message = getErrorMessage(nextError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = (post: string, index: number) => {
    setSelectedPost(post);
    setSelectedPostIndex(index);
    setStep(3);
  };

  const handleRefine = async (prompt: string, index: number) => {
    if (!data) return;

    const originalPost = data.posts[index].content;
    const toastId = toast.loading('Refining post...');

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: originalPost, instruction: prompt }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to refine');

      setData((prev) => {
        if (!prev) return prev;
        const newPosts = [...prev.posts];
        newPosts[index] = { ...newPosts[index], content: result.content };
        return { ...prev, posts: newPosts };
      });

      toast.success('Post refined successfully!', { id: toastId });
    } catch (nextError: unknown) {
      toast.error(getErrorMessage(nextError), { id: toastId });
    }
  };

  const activeResearchSummary = data?.researchSummary;
  const activeLearningSummary = data?.learningSummary ?? learningSummary;
  const dataSource = getRunSourceLabel(userPlan, activeResearchSummary);
  const activeSourceDetail = getRunSourceDetail(userPlan, activeResearchSummary);
  const runState: EngineRunState = loading
    ? 'running'
    : limitState
      ? 'limit'
      : step > 0 && data
        ? 'results'
        : error
          ? 'error'
          : 'ready';

  const activePipelineStage = pipelineStages[Math.min(pipelineStageIdx, pipelineStages.length - 1)];
  const pipelineProgressPercent = loading
    ? Math.round(((pipelineStageIdx + 1) / pipelineStages.length) * 100)
    : runState === 'results'
      ? 100
      : 0;

  const surfaceFocus =
    loading
      ? activePipelineStage.label
      : step === 1
        ? 'Signals ready for review'
        : step === 2
          ? 'Strategy paths ready for selection'
          : step === 3
            ? 'Draft editor active'
            : runState === 'limit'
              ? 'Capacity gate active'
              : runState === 'error'
                ? 'Retry available'
                : 'Waiting for run';

  const sealedDepthHint = (() => {
    if (userPlan === 'pro') return null;
    if (activeResearchSummary?.referenceInputCount) {
      return getLockedLayerHint(userPlan, 'reference');
    }
    if (activeLearningSummary?.feedbackEntryCount) {
      return getLockedLayerHint(userPlan, 'learning');
    }
    return getLockedLayerHint(userPlan, 'cached');
  })();

  const resultSurface = (() => {
    if (!data) return null;

    if (step === 1) {
      return (
        <InsightViewer
          insights={data.insights}
          onNext={() => setStep(2)}
          weekNumber={data.week_number}
          year={data.year}
          dataSource={dataSource}
          researchSummary={data.researchSummary}
          userPlan={userPlan}
        />
      );
    }

    if (step === 2) {
      return (
        <ContentHooks
          historyId={data.history_id}
          hooks={data.hooks}
          ideas={data.ideas}
          posts={data.posts}
          onSelectPost={handleSelectPost}
          onRefine={handleRefine}
          onBack={() => setStep(1)}
          userPlan={userPlan}
          weekNumber={data.week_number}
          year={data.year}
          dataSource={dataSource}
        />
      );
    }

    if (step === 3 && selectedPostIndex !== null) {
      return (
        <FinalPost
          initialContent={selectedPost}
          historyId={data.history_id}
          postIndex={selectedPostIndex}
          onBack={() => setStep(2)}
          userPlan={userPlan}
          weekNumber={data.week_number}
          year={data.year}
          postType={data.posts[selectedPostIndex]?.type}
          hook={data.hooks[selectedPostIndex] ?? data.hooks[0]}
          idea={data.ideas[selectedPostIndex]?.idea}
          explanation={data.posts[selectedPostIndex]?.explanation}
        />
      );
    }

    return null;
  })();

  return (
    <div className="mx-auto flex max-w-[1380px] flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
            Generate
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Engine run
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Current state. Main action. Next stage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
          <span className="rounded-sm border border-white/10 px-2.5 py-1">{getRunStateBadge(runState)}</span>
          <span className="rounded-sm border border-white/10 px-2.5 py-1">{userPlan} plan</span>
          <span className="rounded-sm border border-white/10 px-2.5 py-1">{dataSource}</span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="str-elevated rounded-sm border border-white/10 bg-[#020202] p-4 xl:sticky xl:top-8 xl:self-start">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Run pipeline
          </div>
          <div className="mt-4 space-y-4 border-l border-white/10 pl-4">
            {pipelineStages.map((stage, index) => {
              const stageState = getPipelineState(index, loading, pipelineStageIdx, runState);
              const isActive = stageState === 'running';

              return (
                <div
                  key={stage.id}
                  className={`relative str-soft-transition ${isActive ? 'translate-x-0.5' : ''}`}
                >
                  <span
                    className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${getPipelineStateClassName(stageState)}`}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className={`${isActive ? 'text-white' : 'text-white/78'} text-sm`}>
                      {stage.label}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                      {getPipelineStateLabel(stageState)}
                    </div>
                  </div>
                  {isActive && (
                    <p className="mt-1 text-[11px] leading-relaxed text-white/42">{stage.detail}</p>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="space-y-6">
          <section
            className={`str-elevated rounded-sm border bg-[#020202] p-7 md:p-10 ${
              loading || runState === 'results'
                ? 'border-white/14 shadow-[0_22px_44px_-30px_rgba(255,255,255,0.15),0_18px_38px_-28px_rgba(0,0,0,0.98),inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                : 'border-white/10'
            }`}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Active state
                  </div>
                  <h2 className="mt-3 text-5xl font-semibold tracking-tight text-white md:text-[3.6rem]">
                    {getRunStateHeadline(runState)}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/58">
                    {getRunStateDescription(
                      userPlan,
                      runState,
                      sourceSummary.label,
                      sourceSummary.detail,
                      limitState
                    )}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {loading && (
                      <div className="str-live-row">
                        <span className="str-live-dot" />
                        <span>Engine active</span>
                      </div>
                    )}
                    <LiveStatus
                      label={runState === 'results' ? 'Updated' : 'Last run'}
                      timestamp={lastRunContext?.createdAt ?? null}
                      fallback="No retained run"
                      justNowLabel={runState === 'results' ? 'Updated just now' : 'Last run just now'}
                      pulse={Boolean(lastRunContext?.createdAt)}
                    />
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  {surfaceFocus}
                </div>
              </div>

              {error && runState !== 'limit' && !loading && (
                <div className="rounded-sm border border-red-500/25 bg-red-500/5 px-4 py-4 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
                        Run error
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-red-200/85">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                      Running
                    </div>
                    <p className="mt-2 text-lg font-medium text-white">
                      {activePipelineStage.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/56">{activePipelineStage.detail}</p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-emerald-500/25 bg-black/20">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
                  </div>
                </div>

                  <div className="mt-5">
                    <div className="h-1 overflow-hidden rounded-sm bg-white/10">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.max(8, pipelineProgressPercent)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                      <span>Weekly sequence</span>
                      <span>{pipelineStageIdx + 1}/{pipelineStages.length}</span>
                    </div>
                  </div>
                </div>
              ) : runState === 'limit' ? (
                <div className="space-y-5 rounded-sm border border-amber-500/20 bg-amber-500/5 p-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                      Capacity gate
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {limitState?.used ?? 0} / {limitState?.limit ?? 0}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/56">
                      {userPlan === 'pro'
                        ? 'The intelligence layer is active, but this week’s run budget is exhausted.'
                        : getUpgradeTriggerDescription(userPlan)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPaywall(true)}
                    className="str-cta h-14 rounded-sm bg-white px-7 text-[12px] font-bold uppercase tracking-[0.24em] text-black shadow-[0_10px_30px_-20px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/92"
                  >
                    {getUpgradeButtonLabel(userPlan)}
                  </Button>
                </div>
              ) : runState === 'results' ? (
                <div className="pt-1">
                  <Button
                    onClick={handleGenerate}
                    className="str-cta h-14 rounded-sm bg-white px-7 text-[12px] font-bold uppercase tracking-[0.24em] text-black shadow-[0_10px_30px_-20px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/92"
                  >
                    Run again
                  </Button>
                  <div className="mt-3">
                    <Link
                      href="/history"
                      className="str-soft-transition inline-flex h-10 items-center justify-center rounded-sm border border-white/10 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/64 hover:border-white/20 hover:text-white"
                    >
                      Open memory
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <Button
                    onClick={handleGenerate}
                    className="str-cta group h-14 rounded-sm bg-white px-7 text-[12px] font-bold uppercase tracking-[0.24em] text-black shadow-[0_10px_30px_-20px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/92"
                  >
                    {runState === 'error' ? 'Retry run' : 'Run engine'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/36">
                    Typical runtime: 10-15s
                  </div>
                </div>
              )}

              <div className="grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                    Current focus
                  </div>
                  <p className="mt-2 text-sm text-white/78">{surfaceFocus}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                    Market basis
                  </div>
                  <p className="mt-2 text-sm text-white/78">{dataSource}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                    Output set
                  </div>
                  <p className="mt-2 text-sm text-white/78">
                    {data
                      ? `${data.insights.length} signals • ${data.posts.length} drafts`
                      : 'Outputs not attached'}
                  </p>
                </div>
              </div>

              {lastRunContext && !loading && (
                <div className="border-t border-white/10 pt-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                    Stored cycle
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">
                    Week {lastRunContext.weekNumber}, {lastRunContext.year}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {lastRunContext.insight}
                  </p>
                </div>
              )}
            </div>
          </section>

          {resultSurface}
        </main>

        <aside className="space-y-4 border-t border-white/5 pt-4 text-xs xl:sticky xl:top-8 xl:self-start xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <section>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/26">
              Context
            </div>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Niche
                </dt>
                <dd className="mt-1 text-[11px] text-white/48">{setupContext.niche || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Audience
                </dt>
                <dd className="mt-1 text-[11px] text-white/48">{setupContext.targetAudience || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Tone
                </dt>
                <dd className="mt-1 text-[11px] text-white/48">{setupContext.tone || 'Not set'}</dd>
              </div>
            </dl>
          </section>

          <section className="border-t border-white/5 pt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/26">
              Market basis
            </div>
            <p className="mt-2 text-[11px] font-medium text-white/78">{dataSource}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/44">{activeSourceDetail}</p>

            <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Market input
                </div>
                <p className="mt-1 text-[11px] text-white/48">{getMarketInputLabel(activeResearchSummary)}</p>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Trend layer
                </div>
                <p className="mt-1 text-[11px] text-white/48">{getTrendLayerLabel(activeResearchSummary)}</p>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Reference layer
                </div>
                <p className="mt-1 text-[11px] text-white/48">{getReferenceLayerLabel(userPlan, activeResearchSummary)}</p>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/24">
                  Filter audit
                </div>
                <p className="mt-1 text-[11px] text-white/48">{getFilterAuditLabel(activeResearchSummary)}</p>
              </div>
            </div>
          </section>

          <section className="border-t border-white/5 pt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/26">
              Fallback logic
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/44">
              Thin input falls back to saved context.
            </p>
          </section>

          <section className="border-t border-white/5 pt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/26">
              Output chain
            </div>
            <p className="mt-2 text-[11px] font-medium text-white/78">
              Signals → Strategy paths → Drafts
            </p>
          </section>

          <section className="border-t border-white/5 pt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/26">
              Learning context
            </div>
            <p className="mt-2 text-[11px] font-medium text-white/78">
              {getLearningStateLabel(activeLearningSummary)}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/44">
              {getLearningStateDetail(activeLearningSummary)}
            </p>
          </section>

          {sealedDepthHint && (
            <section className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300/70">
                <Lock className="h-3.5 w-3.5" />
                {sealedDepthHint.eyebrow}
              </div>
              <p className="mt-2 text-[11px] font-medium text-white/78">{sealedDepthHint.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/44">{sealedDepthHint.detail}</p>
            </section>
          )}
        </aside>
      </div>

      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        used={paywallData.used}
        limit={paywallData.limit}
        plan={userPlan}
        trendPostCount={activeResearchSummary?.trendPostCount ?? data?.trendPostCount ?? 0}
        niche={setupContext.niche}
      />
    </div>
  );
}
