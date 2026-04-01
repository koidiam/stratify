"use client"

import { useState, useEffect } from 'react';
import { InsightViewer } from '@/components/generate/InsightViewer';
import { ContentHooks } from '@/components/generate/ContentHooks';
import { FinalPost } from '@/components/generate/FinalPost';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Radar, Sparkles, Zap, AlertCircle, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyGeneration } from '@/types';
import { getApiError, getErrorMessage, isWeeklyGeneration } from '@/lib/utils/parsers';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Plan } from '@/types';
import { PaywallModal } from '@/components/billing/PaywallModal';
import { getLoadingMessages, getGenerateHeaderDescription } from '@/lib/constants/plan-copy';

const STEPS = [
  { id: 1, label: 'Signal scan' },
  { id: 2, label: 'Hook design' },
  { id: 3, label: 'Final draft' },
];



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

  const dataSource = userPlan === 'free' ? 'Cached Niche Signals' : 'Live LinkedIn Signals';

  return (
    <div className="w-full space-y-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[20px] border border-border bg-card p-4 md:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Radar size={12} />
              Strategy Engine
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Map your weekly LinkedIn strategy.
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xl">
              {getGenerateHeaderDescription(userPlan)}
            </p>
          </div>

          <div className="flex gap-1.5 shrink-0">
            {STEPS.map((item) => {
              const isCompleted = step > item.id;
              const isActive = step === item.id;
              const isUpcoming = step < item.id;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-200 min-w-[100px] ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600'
                      : isActive
                        ? 'border-primary/40 bg-primary/10 text-primary font-medium'
                        : 'border-border bg-transparent text-muted-foreground/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isCompleted && <Check size={10} className="text-emerald-500" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Step {item.id}</span>
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium tracking-wide">{item.label}</div>
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
            className="mx-auto max-w-3xl rounded-[20px] border border-border bg-card shadow-sm p-6 md:p-8"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-left"
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
              <div className="w-full animate-in fade-in duration-500">
                {/* Stage-based progress bar */}
                <div className="mb-6 h-1 w-full rounded-full bg-primary/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '5%' }}
                    animate={{ width: `${Math.max(10, ((loadingMsgIdx + 1) / getLoadingMessages(userPlan).length) * 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                  <div className="min-w-0">
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
                    <div className="text-xs text-muted-foreground mt-0.5">Generating signals, hooks, and drafts...</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-4/6 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-8 w-full bg-muted animate-pulse rounded-lg" />
                    <div className="h-8 w-full bg-muted animate-pulse rounded-lg" />
                    <div className="h-8 w-full bg-muted animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground">
                  <Zap size={24} />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                  Run the Strategy Engine
                </h2>
                <p className="mt-2 mb-8 text-sm text-muted-foreground max-w-md">
                  Generate this week&apos;s signals, hooks, and ready-to-publish drafts from your niche data.
                </p>

                <Button 
                  onClick={handleGenerate} 
                  size="lg"
                  className="h-12 min-w-[260px] rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 shadow-lg shadow-primary/15 group"
                >
                  <Sparkles className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Run Stratify Engine
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                {userPlan === 'free' && (
                  <div className="mt-4 text-[11px] text-muted-foreground border border-border/50 bg-secondary/50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <Lock size={10} className="opacity-70" />
                    Live Web Scraping is locked. Engine will use the Niche Matrix Cache.
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
                  ~ 10–15 sec · Signal extraction + hook design
                </div>
              </div>
            )}
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
            />
          </motion.div>
        )}
      </AnimatePresence>
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} used={paywallData.used} limit={paywallData.limit} />
    </div>
  );
}
