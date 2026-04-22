"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, Lock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InsightViewer } from '@/components/generate/InsightViewer';
import { ContentHooks } from '@/components/generate/ContentHooks';
import { FinalPost } from '@/components/generate/FinalPost';
import { LiveStatus } from '@/components/system/LiveStatus';
import { RunManifest } from '@/components/system/RunManifest';
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
  if (runState === 'running') return 'Active';
  if (runState === 'results') return 'Review';
  if (runState === 'limit') return 'Blocked';
  if (runState === 'error') return 'Error';
  return 'Ready';
}

function getRunStateHeadline(runState: EngineRunState): string {
  if (runState === 'running') return 'Cycle running';
  if (runState === 'results') return 'Cycle pending review';
  if (runState === 'limit') return 'Capacity block active';
  if (runState === 'error') return 'Cycle error';
  return 'Ready to run';
}

function getRunStateDescription(
  plan: Plan,
  runState: EngineRunState,
  sourceLabel: string,
  sourceDetail: string,
  limitState?: { used: number; limit: number } | null
): string {
  if (runState === 'running') {
    return 'The system is compiling the current cycle.';
  }

  if (runState === 'results') {
    return 'This week’s strategy is deployed. The system is tracking signals and waiting for your review to close the cycle.';
  }

  if (runState === 'limit') {
    return `Weekly continuity capacity reached${limitState ? ` (${limitState.used}/${limitState.limit})` : ''}. ${getUpgradeTriggerDescription(plan)}`;
  }

  if (runState === 'error') {
    return 'Memory intact. Please retry the compilation.';
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
  const [activeLogic, setActiveLogic] = useState<{ signal: string; shift: string; because: string } | null>(null);

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
          niche: onboarding?.niche || '',
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

        if (latestHistory) {
          const { getCycleLeadSignal, getDominantPostType } = await import('@/lib/utils/history');
          const { getCycleLearningSnapshot } = await import('@/lib/utils/learning');
          const prevHistory = historyRecords[1] ?? null;
          const cycleFeedbackRecords = recentFeedback?.filter((fb) => fb.history_id === latestHistory.id) ?? [];
          const cLearning = getCycleLearningSnapshot(latestHistory, (recentFeedback ?? []) as StoredFeedbackRecord[], prevHistory);
          
          let signal = getCycleLeadSignal(latestHistory.insights);
          let shift = 'Exploration baseline';
          let because = 'No prior data to shift from';
          const dominantPath = getDominantPostType(latestHistory.posts);
          const prevDominantPath = prevHistory ? getDominantPostType(prevHistory.posts) : null;

          if (cLearning.reinforced && cLearning.reinforced !== 'No statistically dominant outlier yet.' && cLearning.reinforced !== 'None. Building memory footprint.') {
            shift = cLearning.reinforced;
            because = cycleFeedbackRecords.length > 0 ? `Engagement clustered on this structural pattern` : 'Pattern reinforced';
          } else if (dominantPath && prevDominantPath && dominantPath !== prevDominantPath) {
            shift = `Bias shifted to ${dominantPath}`;
            because = `System rotated format from ${prevDominantPath} to map engagement surfaces`;
          } else if (dominantPath && prevDominantPath && dominantPath === prevDominantPath) {
            shift = `Maintained ${dominantPath} format`;
            because = `Previous execution maintained established baseline efficiently`;
          } else {
            shift = 'Executing baseline logic';
            because = 'Variance in feedback statistically insignificant';
          }

          setActiveLogic({ signal, shift, because });
        }
      }

      const { getTopInsight } = await import('@/lib/utils/history').then(m => ({ getTopInsight: (r: any) => m.getCycleLeadSignal(r?.insights) }));
      const topInsight = getTopInsight(latestHistory);

      if (!cancelled) {
        if (
          latestHistory &&
          typeof latestHistory.week_number === 'number' &&
          typeof latestHistory.year === 'number'
        ) {
          setLastRunContext({
            weekNumber: latestHistory.week_number,
            year: latestHistory.year,
            insight: topInsight || 'No insight available',
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

    return (
      <div className="space-y-6">
        {/* Step Navigation Bar */}
        {runState === 'results' && step > 0 && (
          <div className="flex items-center gap-3 mb-8">
            <button 
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 transition-colors ${step === 1 ? 'text-white font-medium' : 'text-white/30 hover:text-white/50'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${step === 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />
              <span className="text-[13px]">Signals</span>
            </button>
            <div className="border-t border-white/15 w-16" />
            <button 
              onClick={() => step > 1 && setStep(2)}
              disabled={step < 2}
              className={`flex items-center gap-2 transition-colors ${step === 2 ? 'text-white font-medium' : step > 2 ? 'text-white/30 hover:text-white/50' : 'text-white/10'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${step === 2 ? 'bg-emerald-500' : step > 2 ? 'bg-white/20' : 'bg-white/10'}`} />
              <span className="text-[13px]">Strategy Paths</span>
            </button>
            <div className="border-t border-white/15 w-16" />
            <button 
              onClick={() => step > 2 && setStep(3)}
              disabled={step < 3}
              className={`flex items-center gap-2 transition-colors ${step === 3 ? 'text-white font-medium' : 'text-white/10'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${step === 3 ? 'bg-emerald-500' : 'bg-white/10'}`} />
              <span className="text-[13px]">Draft</span>
            </button>
          </div>
        )}

        {step > 1 && (
          <RunManifest
            researchSummary={data.researchSummary}
            learningSummary={data.learningSummary}
            runLogicSummary={data.run_logic_summary}
            userPlan={userPlan}
            weekNumber={data.week_number}
            year={data.year}
            manifestMode={step === 2 ? 'compact' : 'sentence-only'}
          />
        )}

        {/* Learning Impact Layer */}
        {step > 1 && data.learningSummary && (
          <div className="str-elevated rounded-sm border border-emerald-500/10 bg-[#06140d] px-5 py-4 flex flex-col md:flex-row md:items-start md:gap-6 gap-3">
            <div className="text-[12px] font-medium text-emerald-500 shrink-0 mt-0.5">
              Learning Impact
            </div>
            <div className="text-[13px] leading-relaxed text-emerald-100/80">
              {data.learningSummary.status === 'reinforced'
                ? `Feedback threshold met. System is executing a confirmed structural bias toward ${data.learningSummary.strongestType?.toLowerCase() || 'specific'} formats.`
                : data.learningSummary.status === 'directional'
                ? `Feedback indicates an emerging pattern. System is testing a partial bias toward ${data.learningSummary.strongestType?.toLowerCase() || 'specific'} formats.`
                : 'Feedback threshold unreached. System is executing baseline logic without operator bias.'}
            </div>
          </div>
        )}

        {step === 1 && (
          <InsightViewer
            insights={data.insights}
            onNext={() => setStep(2)}
            weekNumber={data.week_number}
            year={data.year}
            dataSource={dataSource}
            researchSummary={data.researchSummary}
            learningSummary={data.learningSummary}
            runLogicSummary={data.run_logic_summary}
            userPlan={userPlan}
          />
        )}

        {step === 2 && (
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
        )}

        {step === 3 && selectedPostIndex !== null && (
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
        )}

        {sealedDepthHint && runState === 'results' && (
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col md:flex-row md:items-start md:gap-6 gap-3 pl-2 border-l-2 border-transparent hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 text-[12px] font-medium text-white/40 shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
              {sealedDepthHint.eyebrow}
            </div>
            <div>
              <p className="text-[13px] font-medium text-white/80">{sealedDepthHint.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-white/40 max-w-2xl">{sealedDepthHint.detail}</p>
              <Link href="/settings" className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 hover:text-emerald-400 transition-colors bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5 rounded-sm">
                View deeper system layers →
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  })();

  return (
    <div className="mx-auto flex max-w-[1380px] flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 text-[13px] font-medium text-white/50">
            Active week
          </div>
          <h1 className="text-3xl font-medium text-white">
            Workspace
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/40">
          <span className="rounded-sm border border-white/5 bg-white/[0.02] px-2.5 py-1">{getRunStateBadge(runState)}</span>
          <span className="rounded-sm border border-white/5 bg-white/[0.02] px-2.5 py-1">{userPlan} plan</span>
          <span className="rounded-sm border border-white/5 bg-white/[0.02] px-2.5 py-1">{dataSource}</span>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
        {/* CENTER BOX: SYSTEM STATE */}
        <main className="space-y-6">
          <section
            className={`str-elevated rounded-sm border bg-[#090909] p-7 md:p-10 ${
              loading || runState === 'results'
                ? 'border-white/14 shadow-[0_22px_44px_-30px_rgba(255,255,255,0.15),0_18px_38px_-28px_rgba(0,0,0,0.98),inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                : 'border-white/10'
            }`}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 text-[13px] font-medium text-white/50">
                    Current status
                  </div>
                  <h2 className="mb-2 text-3xl font-semibold text-white">
                    {getRunStateHeadline(runState)}
                  </h2>
                  <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/60">
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
                    <div className="mb-2 text-[13px] font-medium text-emerald-400">
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
                    <div className="mt-3 flex justify-between text-[12px] font-medium text-white/50">
                      <span>Progression</span>
                      <span>{pipelineStageIdx + 1}/{pipelineStages.length}</span>
                    </div>
                  </div>
                </div>
              ) : runState === 'limit' ? (
                <div className="space-y-5 rounded-sm border border-amber-500/20 bg-amber-500/5 p-5">
                  <div>
                    <div className="mb-2 text-[13px] font-medium text-amber-400">
                      Capacity block
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
                    className="bg-white text-black font-semibold px-8 py-3 rounded-md hover:bg-white/90 transition-all duration-150 group inline-flex items-center justify-center h-14 text-[13px] uppercase tracking-[0.15em]"
                  >
                    {runState === 'error' ? 'Retry cycle' : 'Run this cycle'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="text-[12px] font-medium text-white/40">
                      Typical runtime: 10-15s
                    </div>
                    <div className="text-[11px] text-white/30">
                      This cycle contributes to system learning
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-white/5 pt-6 pb-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
                  Active Logic
                </div>
                <div className="space-y-4">
                  {activeLogic ? (
                    <div className="flex flex-col gap-3 text-[13px]">
                      <div className="flex items-start gap-4 bg-background-panel border border-white/8 rounded-md p-4">
                        <span className="text-[10px] tracking-[0.12em] uppercase text-white/40 font-medium min-w-[90px] pt-0.5">Signal</span>
                        <span className="text-white/90 leading-relaxed">{activeLogic.signal}</span>
                      </div>
                      <div className="flex items-start gap-4 bg-background-panel border border-white/8 rounded-md p-4">
                        <span className="text-[10px] tracking-[0.12em] uppercase text-white/40 font-medium min-w-[90px] pt-0.5">System Shift</span>
                        <span className="text-white/80 leading-relaxed">{activeLogic.shift}</span>
                      </div>
                      <div className="flex items-start gap-4 bg-background-panel border border-white/8 rounded-md p-4">
                        <span className="text-[10px] tracking-[0.12em] uppercase text-white/40 font-medium min-w-[90px] pt-0.5">Because</span>
                        <span className="text-white/60 leading-relaxed">{activeLogic.because}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-[13px]">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Baseline Running</span>
                      <span className="text-white/60">System requires an initial cycle to establish active logic.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 border-t border-white/5 pt-6 md:grid-cols-3">
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
            </div>
          </section>

          {resultSurface}
        </main>

        <aside className="space-y-6 text-xs xl:sticky xl:top-8 xl:self-start">
          <div className="str-elevated rounded-sm flex flex-col items-start px-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              System Pipeline
            </div>
            <div className="mt-4 space-y-4 border-l border-white/10 pl-4 w-full">
              {pipelineStages.map((stage, index) => {
                const stageState = getPipelineState(index, loading, pipelineStageIdx, runState);
                const isActive = stageState === 'running';

                return (
                  <div
                    key={stage.id}
                    className={`relative str-soft-transition ${isActive ? 'translate-x-0.5' : ''}`}
                  >
                    <span
                      className={`absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full ${isActive ? 'bg-accent shadow-[0_0_8px_var(--color-accent)] animate-pulse' : getPipelineStateClassName(stageState)}`}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className={`${isActive ? 'text-white' : 'text-white/60'} text-[13px]`}>
                        {stage.label}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 hidden sm:block">
                        {getPipelineStateLabel(stageState)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5 pt-5 px-2 mt-2">
            
            <dl className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-[9px] uppercase tracking-[0.1em] text-white/20">Niche</dt>
                <dd className="text-[10px] text-white/50">{setupContext.niche || 'Not set'}</dd>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <dt className="text-[9px] uppercase tracking-[0.1em] text-white/20">Market basis</dt>
                <dd className="text-[10px] text-white/50">{dataSource}</dd>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <dt className="text-[9px] uppercase tracking-[0.1em] text-white/20">Output chain</dt>
                <dd className="text-[10px] text-white/50">Signals → Paths → Drafts</dd>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <dt className="text-[9px] uppercase tracking-[0.1em] text-white/20">Learning context</dt>
                <dd className="text-[10px] text-white/50">{getLearningStateLabel(activeLearningSummary)}</dd>
              </div>
            </dl>
          </div>
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
