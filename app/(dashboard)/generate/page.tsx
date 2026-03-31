"use client"

import { useState, useEffect } from 'react';
import { InsightViewer } from '@/components/generate/InsightViewer';
import { ContentHooks } from '@/components/generate/ContentHooks';
import { FinalPost } from '@/components/generate/FinalPost';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Radar, Sparkles, Zap, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyGeneration } from '@/types';
import { getApiError, getErrorMessage, isWeeklyGeneration } from '@/lib/utils/parsers';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Plan } from '@/types';
import { PaywallModal } from '@/components/billing/PaywallModal';

const STEPS = [
  { id: 1, label: 'Signal scan' },
  { id: 2, label: 'Hook design' },
  { id: 3, label: 'Final draft' },
];

const getLoadingMessages = (plan: Plan) => {
  if (plan === 'free') {
    return [
      "Connecting to Stratify Engine...",
      "Analyzing your niche and audience.",
      "Accessing Stratify Matrix (Niche Cache)...",
      "Designing high-engagement hooks...",
      "Applying psychological triggers...",
      "Polishing drafts to your brand tone...",
      "Finalizing output..."
    ];
  }
  
  return [
    "Connecting to Stratify Engine...",
    "Analyzing your niche and audience...",
    "Gathering real-time LinkedIn signals...",
    "Designing high-engagement hooks...",
    "Applying psychological triggers...",
    "Polishing drafts to your brand tone...",
    "Finalizing output..."
  ];
};

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

  useEffect(() => {
    const fetchPlan = async () => {
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
    };
    fetchPlan();
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

  return (
    <div className="w-full space-y-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-[24px] border border-border bg-card p-6 md:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Radar size={14} className="animate-pulse opacity-70" />
              Weekly Generation Cockpit
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Map your weekly LinkedIn strategy.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {userPlan === 'free'
                ? 'Your onboarding context and generation limits flow into a single pipeline. First insights, then hooks, then final ready-to-publish drafts.'
                : 'Your onboarding context, live LinkedIn signals, and generation limits flow into a single pipeline. First insights, then hooks, then final ready-to-publish drafts.'
              }
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {STEPS.map((item) => {
              const active = step >= item.id;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-xl border px-4 py-3 text-sm transition-all duration-150 ${
                    active
                      ? 'border-primary/30 bg-primary/10 text-primary font-medium'
                      : 'border-border bg-transparent text-muted-foreground'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Step {item.id}</div>
                  <div className="mt-1 font-medium tracking-wide">{item.label}</div>
                  {active && (
                    <motion.div 
                      layoutId="active-step-indicator"
                      className="absolute inset-0 rounded-xl border border-primary/40"
                      initial={false}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {/* Step 0 - Initial State */}
        {step === 0 && (
          <motion.div 
            key="step-0"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
            transition={{ duration: 0.2 }}
            className="mx-auto flex min-h-[50vh] max-w-4xl items-center justify-center rounded-[24px] border border-border bg-card shadow-sm p-8 md:p-12 text-center"
          >
            <div className="max-w-2xl relative z-10">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary border border-border text-muted-foreground">
                {loading ? <Loader2 size={32} className="animate-spin text-primary" /> : <Zap size={32} />}
              </div>
              <h2 className="mb-4 text-2xl md:text-4xl font-semibold tracking-tight text-foreground">
                Activate the Stratify Engine
              </h2>
              <p className="mb-12 text-base leading-relaxed text-muted-foreground">
                Our AI engine analyzes your niche signals, maps them to proven frameworks, 
                and engineers high-engagement hooks and valid drafts matched to your brand tone.
              </p>

              <div className="mx-auto mb-10 grid max-w-3xl gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-secondary p-5 text-left relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">01</div>
                    {userPlan === 'free' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">PRO</span>
                    )}
                  </div>
                  <div className="font-medium text-foreground">Signal scan</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {userPlan === 'free'
                      ? 'Niche patterns analyzed from your Stratify database.'
                      : 'Real-time signals gathered from live LinkedIn data.'
                    }
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-secondary p-5 text-left">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">02</div>
                  <div className="font-medium text-foreground">Hook design</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Attention-grabbing openings and psychological triggers are produced.</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary p-5 text-left">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">03</div>
                  <div className="font-medium text-foreground">Final draft</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Near-publish draft arrives in a cohesive format ready for final tweaks.</p>
                </div>
              </div>
            
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto mb-8 max-w-lg rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-destructive shrink-0" />
                    <div>
                      <h4 className="font-medium text-destructive">Strategy Generation Failed</h4>
                      <p className="mt-1 text-sm text-destructive/90">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {loading ? (
                <div className="w-full text-left animate-in fade-in duration-500">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Loader2 size={20} className="animate-spin text-primary" />
                      </div>
                      <div>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={loadingMsgIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm font-semibold text-foreground"
                          >
                            {getLoadingMessages(userPlan)[loadingMsgIdx]}
                          </motion.div>
                        </AnimatePresence>
                        <div className="text-xs text-muted-foreground">Generating 3 insights, 5 hooks, 3 drafts...</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Insight Skeleton */}
                    <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-4/6 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="pt-2 flex flex-wrap gap-2">
                         <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                         <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                      </div>
                    </div>

                    {/* Hook List Skeleton */}
                    <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                    </div>
                    
                    {/* Post Card Skeleton */}
                    <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm space-y-3 md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-24 w-full bg-muted/50 animate-pulse rounded-md mt-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <Button 
                    onClick={handleGenerate} 
                    size="lg"
                    className="h-14 md:h-12 min-w-[240px] rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 shadow-xl shadow-primary/20 group"
                  >
                    <Sparkles className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    Run Stratify Engine
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  {userPlan === 'free' && (
                    <div className="text-[11px] text-muted-foreground border border-border/50 bg-secondary/50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                      <Lock size={10} className="opacity-70" />
                      Live Web Scraping is locked. Engine will use the Niche Matrix Cache.
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                    <Zap size={12} />
                    Average process time 10-15 seconds
                  </div>
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
            />
          </motion.div>
        )}
      </AnimatePresence>
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} used={paywallData.used} limit={paywallData.limit} />
    </div>
  );
}
