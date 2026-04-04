"use client"

import { useState, useEffect } from 'react';
import { InsightViewer } from '@/components/generate/InsightViewer';
import { ContentHooks } from '@/components/generate/ContentHooks';
import { FinalPost } from '@/components/generate/FinalPost';
import { Button } from '@/components/ui/button';
import { Loader2, Radar, Zap, AlertCircle, Lock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyGeneration } from '@/types';
import { getApiError, getErrorMessage, isWeeklyGeneration } from '@/lib/utils/parsers';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Plan } from '@/types';
import { PaywallModal } from '@/components/billing/PaywallModal';
import {
  getLoadingMessages,
  getGenerateHeaderDescription,
  getPlanSourceSummary,
  getSignalScanDescription,
} from '@/lib/constants/plan-copy';

const STEPS = [
  { id: 1, label: 'Signals', micro: 'Signals extracted from the current source. Next: Strategy Paths.', completeLabel: 'Extracted' },
  { id: 2, label: 'Strategy Paths', micro: 'Paths compiled from extracted signals. Next: Draft Editor.', completeLabel: 'Compiled' },
  { id: 3, label: 'Draft Editor', micro: 'Selected draft loaded for refinement.', completeLabel: 'Ready' },
];

interface SetupContext {
  niche: string;
  targetAudience: string;
  tone: string;
}

interface LastRunContext {
  weekNumber: number;
  year: number;
  insight: string;
}

export default function GeneratePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [data, setData] = useState<WeeklyGeneration | null>(null);
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallData, setPaywallData] = useState({ used: 0, limit: 0 });
  const [userPlan, setUserPlan] = useState<Plan>('free');
  const [showSetupDetails, setShowSetupDetails] = useState(false);
  const [setupContext, setSetupContext] = useState<SetupContext>({
    niche: '',
    targetAudience: '',
    tone: '',
  });
  const [lastRunContext, setLastRunContext] = useState<LastRunContext | null>(null);

  useEffect(() => {
    const fetchSetup = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data?.plan) {
        setUserPlan(data.plan as Plan);
      }

      const { data: onboarding } = await supabase
        .from('onboarding')
        .select('niche, target_audience, tone')
        .eq('user_id', user.id)
        .maybeSingle();

      setSetupContext({
        niche: onboarding?.niche ?? '',
        targetAudience: onboarding?.target_audience ?? '',
        tone: onboarding?.tone ?? '',
      });

      const { data: latestHistory } = await supabase
        .from('content_history')
        .select('week_number, year, insights')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const topInsight =
        Array.isArray(latestHistory?.insights) &&
        typeof latestHistory.insights[0] === 'object' &&
        latestHistory.insights[0] !== null &&
        'insight' in latestHistory.insights[0] &&
        typeof latestHistory.insights[0].insight === 'string' &&
        latestHistory.insights[0].insight.trim()
          ? latestHistory.insights[0].insight.trim()
          : null;

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
        });
      } else {
        setLastRunContext(null);
      }
    };
    fetchSetup();
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIdx(0);
      return;
    }
    const messages = getLoadingMessages(userPlan);
    const timer = setInterval(() => {
      setLoadingMsgIdx((prev) => Math.min(prev + 1, messages.length - 1));
    }, 1200);
    return () => clearInterval(timer);
  }, [loading, userPlan]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const json: unknown = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          const payload = json as Record<string, unknown>;
          if (payload.code === 'limit_reached') {
             setPaywallData({ used: Number(payload.used) || 0, limit: Number(payload.limit) || 0 });
             setShowPaywall(true);
             return;
          }
        }
        const error = getApiError(json);
        throw new Error(error ?? 'An error occurred');
      }

      if (!isWeeklyGeneration(json)) {
        throw new Error('AI response format was invalid.');
      }

      setData(json);
      setStep(1); // Show insights
      toast.success('Weekly analysis completed successfully!');
      
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

      setData(prev => {
        if (!prev) return prev;
        const newPosts = [...prev.posts];
        newPosts[index] = { ...newPosts[index], content: result.content };
        return { ...prev, posts: newPosts };
      });
      
      toast.success('Post refined successfully!', { id: toastId });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

  const dataSource = userPlan === 'free' ? 'Cached Niche Signals' : 'Live LinkedIn Signals';
  const sourceSummary = getPlanSourceSummary(userPlan);
  const currentStepMeta = step > 0 ? STEPS[step - 1] : null;
  const topBarMeta = loading
    ? 'Pipeline running'
    : step === 0
      ? 'Ready'
      : `Step ${step} of 3 · ${currentStepMeta?.label ?? ''}`;
  const inspectorStage = loading
    ? getLoadingMessages(userPlan)[loadingMsgIdx]
    : step === 0
      ? 'Ready to generate'
      : step === 1
        ? 'Signals extracted'
        : step === 2
          ? 'Strategy paths compiled'
          : 'Draft selected for refinement';
  const transformationPreview = [
    {
      label: 'Signal Source',
      value: sourceSummary.label,
      detail: getSignalScanDescription(userPlan),
    },
    {
      label: 'Pattern Logic',
      value: 'Observed shift + trigger',
      detail: 'Each signal is explained before it is carried into hooks and draft directions.',
    },
    {
      label: 'Weekly Output',
      value: 'Hooks + full drafts',
      detail: 'One strategy pass produces openings, draft directions, and editable LinkedIn posts.',
    },
  ];

  return (
    <div className="w-full flex flex-col xl:flex-row relative min-h-[calc(100vh-6rem)] items-stretch border border-white/10 bg-white/10 rounded-none shadow-2xl">
      
      {/* LEFT PANE: Context & Tracking Rail (Fixed 280px) */}
      <div className={`w-full xl:w-[220px] shrink-0 flex-col bg-[#020202] relative z-10 border-b xl:border-b-0 xl:border-r border-white/5 order-2 xl:order-1 overflow-y-auto ${step > 0 ? 'hidden md:flex' : 'hidden'}`}>
        <div className="p-5 border-b border-white/5 bg-[#000000]/40 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-emerald-500/5 blur-[30px] pointer-events-none" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500 relative z-10">
            <Radar size={12} className="animate-spin-slow" />
            Strategy Engine
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white mb-2 leading-snug relative z-10">
            Strategy <br/>Pipeline
          </h1>
          <p className="text-[10px] text-white/40 leading-relaxed font-mono relative z-10">
            {getGenerateHeaderDescription(userPlan)}
          </p>
        </div>

        <div className="p-5 flex-1 bg-[#050505]">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-5 flex items-center gap-2">
            <span className="w-1 h-3 bg-white/20" />
            Progress
          </div>
          <div className="relative flex flex-col pt-2">
            <div className="absolute left-[3px] top-4 bottom-4 w-px bg-white/5" />
            
            {STEPS.map((item) => {
              const isCompleted = step > item.id;
              const isActive = step === item.id;
              
              return (
                <div key={item.id} className="relative flex flex-col pb-8 group">
                  {(isCompleted || isActive) && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="absolute left-[3px] top-4 w-[2px] bg-emerald-500 z-10" 
                    />
                  )}
                  
                  <div className="flex items-start gap-4 relative z-20">
                     <div className={`mt-1.5 w-2 h-2 rounded-[1px] rotate-45 shrink-0 transition-all duration-500 ${
                       isCompleted ? 'bg-emerald-500' : 
                       isActive ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 
                       'bg-white/10'
                     }`} />
                     
                     <div className="flex flex-col -mt-0.5 w-full pr-4">
                       <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors duration-300 ${
                         isCompleted || isActive ? 'text-white/30' : 'text-white/15'
                       }`}>
                         Step 0{item.id}
                       </span>

                       <span className={`mt-1 text-[12px] font-medium tracking-wide transition-colors duration-300 ${
                         isCompleted || isActive ? 'text-white' : 'text-white/30'
                       }`}>
                         {item.label}
                       </span>
                       
                       <AnimatePresence>
                         {isActive && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             exit={{ opacity: 0, height: 0 }}
                             className="overflow-hidden mt-1.5 flex flex-col gap-1"
                           >
                              <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-500">Current</span>
                              <span className="text-[10px] font-mono text-white/45">{item.micro}</span>
                           </motion.div>
                         )}
                         {isCompleted && (
                           <motion.div
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="mt-1.5 flex items-center gap-1.5 text-[9px] font-mono text-emerald-500 uppercase tracking-widest"
                           >
                             <Check size={10} className="stroke-2" />
                             {item.completeLabel}
                           </motion.div>
                         )}
                         {!isActive && !isCompleted && (
                           <motion.div
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-white/20 uppercase tracking-widest"
                           >
                             Up Next
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* MIDDLE PANE: Main Execution Sandbox (Flexible) */}
      <div className="flex-grow min-h-0 flex flex-col w-full min-w-0 relative bg-[#000000] order-1 xl:order-2 overflow-y-auto">
        <div className="sticky top-0 z-20 w-full h-12 bg-[#000000]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 gap-4">
          <div className="text-[10px] font-mono text-white/40 flex items-center gap-3 w-full min-w-0">
            <span className="text-emerald-500/80 uppercase tracking-widest font-bold shrink-0">Generate</span>
            <span className="shrink-0">/</span>
            <span className={`${step === 0 ? "text-white" : ""} shrink-0`}>Setup</span>
            {step > 0 && <span className="shrink-0">/</span>}
            {step > 0 && <span className={`${step === 1 ? "text-white" : ""} shrink-0`}>Signals</span>}
            {step > 1 && <span className="shrink-0">/</span>}
            {step > 1 && <span className={`${step === 2 ? "text-white" : ""} shrink-0`}>Strategy Paths</span>}
            {step > 2 && <span className="shrink-0">/</span>}
            {step > 2 && <span className={`${step === 3 ? "text-white" : ""} shrink-0`}>Draft Editor</span>}
          </div>
          <div className="rounded-sm border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-white/55 shrink-0">
            {topBarMeta}
          </div>
        </div>
      <AnimatePresence mode="wait">
        {/* Step 0 - Initial State */}
        {step === 0 && (
          <motion.div 
            key="step-0"
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full min-h-[500px] p-8 md:p-12 relative flex flex-col items-center justify-start md:justify-center"
          >
            <div className="absolute inset-0 bg-[#000000]/60 z-0 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 w-full rounded-sm border border-red-500/30 bg-[#0A0A0A] p-5 shadow-inner flex items-start gap-4 text-left"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 text-red-500 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-[10px] tracking-widest text-red-500 uppercase">Request Error</h4>
                    <p className="text-red-500/80 text-sm font-mono">{error}</p>
                  </div>
                </motion.div>
              )}

              {loading ? (
                <div className="w-full flex flex-col items-center">
                  <div className="mb-8 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full" />
                    <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-emerald-500/10 border border-emerald-500/30">
                      <Loader2 size={28} className="animate-spin text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="text-center mb-10 w-full h-16 relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loadingMsgIdx}
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        transition={{ duration: 0.3 }}
                        className="text-lg md:text-xl font-mono tracking-tight text-emerald-500 uppercase absolute inset-0 flex items-center justify-center"
                      >
                        [ {getLoadingMessages(userPlan)[loadingMsgIdx]} ]
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="w-full max-w-sm">
                    <div className="h-1 w-full rounded-none bg-white/10 overflow-hidden relative">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                        initial={{ width: '5%' }}
                        animate={{ width: `${Math.max(10, ((loadingMsgIdx + 1) / getLoadingMessages(userPlan).length) * 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between text-[9px] font-mono tracking-widest uppercase text-white/40">
                      <span>In Progress</span>
                      <span>{Math.round(((loadingMsgIdx + 1) / getLoadingMessages(userPlan).length) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center w-full max-w-3xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500">
                    Primary Action
                  </div>
                  <div className="w-16 h-16 mb-5 rounded-sm bg-[#000000]/60 border border-white/5 flex items-center justify-center shadow-inner">
                    <Zap size={24} className="text-white/80" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase">
                    Generate Strategy
                  </h2>
                  <p className="mt-3 mb-8 text-sm text-white/50 max-w-xl leading-relaxed">
                    Run this week&apos;s LinkedIn strategy pass from your saved context.
                  </p>

                  <Button 
                    onClick={handleGenerate} 
                    className="h-16 w-full max-w-md rounded-sm bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-[0.22em] text-[12px] shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                  >
                    Generate Strategy
                  </Button>

                  <div className="mt-4 inline-flex items-center justify-center gap-2 text-[10px] text-white/35 border border-white/5 bg-white/[0.02] px-3 py-1.5 rounded-sm">
                    <span className="w-1 h-1 rounded-full bg-white/30 animate-pulse" />
                    Typical time: 10-15s
                  </div>

                  {lastRunContext && (
                    <div className="w-full max-w-3xl mt-6 rounded-sm border border-white/10 bg-white/[0.02] p-4 text-left">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                          Last run · Week {lastRunContext.weekNumber}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                          {lastRunContext.year}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-white/75">
                        {lastRunContext.insight}
                      </p>
                    </div>
                  )}

                  <div className="w-full max-w-3xl mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-4 text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Niche</div>
                      <p className="mt-2 text-sm text-white/75">{setupContext.niche || 'Loading context...'}</p>
                    </div>
                    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-4 text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Audience</div>
                      <p className="mt-2 text-sm text-white/75">{setupContext.targetAudience || 'Loading context...'}</p>
                    </div>
                    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-4 text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tone</div>
                      <p className="mt-2 text-sm text-white/75">{setupContext.tone || 'Loading context...'}</p>
                    </div>
                    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-4 text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Source</div>
                      <p className="mt-2 text-sm text-white/75">{sourceSummary.label}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSetupDetails((prev) => !prev)}
                    className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/45 transition-colors hover:text-white/70"
                  >
                    {showSetupDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showSetupDetails ? 'Hide secondary details' : 'Show secondary details'}
                  </button>

                  <AnimatePresence initial={false}>
                    {showSetupDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-3xl overflow-hidden"
                      >
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          {transformationPreview.map((item) => (
                            <div key={item.label} className="rounded-sm border border-white/10 bg-white/[0.02] p-4 text-left">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{item.label}</div>
                              <div className="mt-2 text-sm font-medium text-white">{item.value}</div>
                              <p className="mt-2 text-xs leading-relaxed text-white/55">{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {userPlan === 'free' && (
                    <div className="mt-6 text-[10px] font-mono text-amber-500 border border-amber-500/20 bg-amber-500/5 px-4 py-2 rounded-sm inline-flex items-center gap-2 uppercase tracking-widest">
                      <Lock size={12} className="opacity-80" />
                      Live signals are unavailable on the free plan
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 1 - Insight Viewer */}
        {step === 1 && data && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <InsightViewer 
              insights={data.insights} 
              onNext={() => setStep(2)}
              weekNumber={data.week_number}
              year={data.year}
              dataSource={dataSource}
              researchUsed={data.researchUsed ?? false}
              trendPostCount={data.trendPostCount ?? 0}
            />
          </motion.div>
        )}

        {/* Step 2 - Content Hooks */}
        {step === 2 && data && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ContentHooks 
              historyId={data.history_id}
              hooks={data.hooks} 
              ideas={data.ideas} 
              posts={data.posts} 
              onRefine={handleRefine}
              onSelectPost={(post: string, index: number) => {
                setSelectedPost(post);
                setSelectedPostIndex(index);
                setStep(3);
              }} 
              onBack={() => setStep(1)}
              userPlan={userPlan}
              weekNumber={data.week_number}
              year={data.year}
              dataSource={dataSource}
            />
          </motion.div>
        )}

        {/* Step 3 - Final Post */}
        {step === 3 && data && selectedPost && selectedPostIndex !== null && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* RIGHT PANE: System Inspector (Fixed 280px) */}
      <div className={`w-full xl:w-[220px] shrink-0 flex-col bg-[#020202] relative z-20 border-t xl:border-t-0 xl:border-l border-white/5 order-3 overflow-y-auto ${step === 3 ? 'hidden xl:flex' : 'hidden'}`}>
        <div className="p-5 border-b border-white/5 bg-[#000000]/40 flex items-center justify-between">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">Details</div>
        </div>

        <div className="p-5 flex-1 flex flex-col gap-6">
          
          {/* Metadata Block */}
          <div>
             <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Run Details</div>
             <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden text-[9px] font-mono">
                <div className="bg-[#050505] p-3 text-white/50">STATUS</div>
                <div className="bg-[#050505] p-3 text-white">{loading ? 'RUNNING' : step === 0 ? 'READY' : 'ACTIVE'}</div>
                <div className="bg-[#050505] p-3 text-white/50">STAGE</div>
                <div className="bg-[#050505] p-3 text-white">{inspectorStage}</div>
                <div className="bg-[#050505] p-3 text-white/50">FORMAT</div>
                <div className="bg-[#050505] p-3 text-white">SIGNALS → PATHS → DRAFT EDITOR</div>
             </div>
          </div>

          {/* Data Source Block */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Data Source</div>
            <div className="p-3 border border-white/5 bg-[#050505] rounded-sm flex items-start gap-3">
               <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white uppercase">{dataSource}</span>
                  <span className="text-[9px] text-white/40 font-mono mt-1">{sourceSummary.detail}</span>
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Context</div>
            <div className="space-y-3">
              <div className="rounded-sm border border-white/5 bg-[#050505] p-3">
                <div className="text-[9px] uppercase tracking-widest text-white/30">Niche</div>
                <p className="mt-1 text-[11px] text-white/75">{setupContext.niche || 'Loading context...'}</p>
              </div>
              <div className="rounded-sm border border-white/5 bg-[#050505] p-3">
                <div className="text-[9px] uppercase tracking-widest text-white/30">Audience</div>
                <p className="mt-1 text-[11px] text-white/75">{setupContext.targetAudience || 'Loading context...'}</p>
              </div>
              <div className="rounded-sm border border-white/5 bg-[#050505] p-3">
                <div className="text-[9px] uppercase tracking-widest text-white/30">Tone</div>
                <p className="mt-1 text-[11px] text-white/75">{setupContext.tone || 'Loading context...'}</p>
              </div>
            </div>
          </div>

          {data && (
            <div className="pt-6 border-t border-white/5">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Output Snapshot</div>
              <div className="space-y-3">
                <div className="rounded-sm border border-white/5 bg-[#050505] p-3 text-[11px] text-white/75">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Signals</span>
                  <p className="mt-2">{data.insights.length} extracted for this run.</p>
                </div>
                <div className="rounded-sm border border-white/5 bg-[#050505] p-3 text-[11px] text-white/75">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Primary Trigger</span>
                  <p className="mt-2">{data.insights[0]?.trigger ?? 'Not available yet.'}</p>
                </div>
                <div className="rounded-sm border border-white/5 bg-[#050505] p-3 text-[11px] text-white/75">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Draft Output</span>
                  <p className="mt-2">{data.posts.length} drafts compiled and ready for refinement.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        used={paywallData.used}
        limit={paywallData.limit}
        plan={userPlan}
        trendPostCount={data?.trendPostCount ?? 0}
        niche={setupContext?.niche ?? ''}
      />
    </div>
  );
}
