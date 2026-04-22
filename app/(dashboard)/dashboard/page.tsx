export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getCycleLeadSignal,
  getDominantPostType,
  type StoredCycleRecord,
} from '@/lib/utils/history';
import {
  buildLearningSummary,
  getCycleLearningSnapshot,
  type StoredFeedbackRecord,
} from '@/lib/utils/learning';
import { PLAN_LIMITS } from '@/lib/utils/usage';
import { getISOWeek } from '@/lib/utils/week';
import { Plan } from '@/types';

function truncateText(value: string, limit: number = 160): string {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit).trimEnd()}...`;
}

type DashboardState = 'no_memory' | 'new_cycle_window' | 'cycle_ready' | 'cycle_completed';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      plan: 'free',
      onboarding_completed: false,
    });
    redirect('/onboarding');
  }

  if (!profile.onboarding_completed) {
    redirect('/onboarding');
  }

  const { data: onboarding } = await supabase
    .from('onboarding')
    .select('niche, target_audience, tone')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!onboarding?.niche) {
    redirect('/onboarding');
  }

  const { week, year } = getISOWeek();
  const { data: usageData } = await supabase
    .from('usage_tracking')
    .select('generations_used')
    .eq('user_id', user.id)
    .eq('week_number', week)
    .eq('year', year)
    .maybeSingle();

  const plan: Plan =
    profile.plan === 'basic' || profile.plan === 'pro' ? profile.plan : 'free';
  const currentUsage = usageData?.generations_used ?? 0;
  const planLimit = PLAN_LIMITS[plan] ?? 1;
  const hasRunsRemaining = currentUsage < planLimit;

  const { data: recentHistory } = await supabase
    .from('content_history')
    .select('id, week_number, year, created_at, insights, hooks, posts')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: feedback } = await supabase
    .from('post_feedback')
    .select('history_id, post_index, views, likes, comments, reposts, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const historyRecords = (recentHistory ?? []) as StoredCycleRecord[];
  const feedbackRecords = (feedback ?? []) as StoredFeedbackRecord[];
  const currentWeekHistory =
    historyRecords.find(
      (record) => record.week_number === week && record.year === year
    ) ?? null;
  
  const learningSummary = buildLearningSummary(historyRecords, feedbackRecords);
  
  const isCurrentCycleClosed = currentWeekHistory 
    ? feedbackRecords.some(fb => fb.history_id === currentWeekHistory.id) 
    : false;

  const dashboardState: DashboardState = (() => {
    if (historyRecords.length === 0) {
      return 'no_memory';
    }
    
    if (currentWeekHistory) {
      if (!isCurrentCycleClosed) {
        return 'cycle_ready';
      }
      return 'cycle_completed';
    }
    
    return 'new_cycle_window';
  })();



  const latestCycle = historyRecords[0] ?? null;
  const cycleFeedbackRecords = latestCycle 
    ? feedbackRecords.filter((fb) => fb.history_id === latestCycle.id) 
    : [];
  const latestLearning = latestCycle 
    ? getCycleLearningSnapshot(latestCycle, feedbackRecords, historyRecords[1] ?? null) 
    : null;
  
  let systemShift = 'No measurable change';
  let systemBecause = 'Insufficient feedback data to establish pattern';

  if (latestCycle && cycleFeedbackRecords.length > 0 && latestLearning) {
    if (latestLearning.reinforced && latestLearning.reinforced !== 'No statistically dominant outlier yet.' && latestLearning.reinforced !== 'None. Building memory footprint.') {
      systemShift = latestLearning.reinforced;
      systemBecause = `${cycleFeedbackRecords.length} executed paths showed clustered engagement on this pattern.`;
    } else {
      const dominantPath = getDominantPostType(latestCycle.posts);
      const previousDominantPath = historyRecords[1] ? getDominantPostType(historyRecords[1].posts) : null;
      if (dominantPath && previousDominantPath && dominantPath !== previousDominantPath) {
        systemShift = `Shifted structural bias from last week's ${previousDominantPath} format to ${dominantPath}`;
        systemBecause = `Prior baseline execution indicated a need for variation towards ${dominantPath}`;
      } else if (dominantPath && previousDominantPath && dominantPath === previousDominantPath) {
        systemShift = `Reinforcing prior execution of ${dominantPath} format`;
        systemBecause = `Prior baseline execution maintained consistent trajectory without negative signals`;
      } else {
        systemShift = 'Baseline logic running';
        systemBecause = 'Variance between formats is currently statistically insignificant';
      }
    }
  } else if (latestCycle && historyRecords.length > 1) {
    const dominantPath = getDominantPostType(latestCycle.posts);
    const previousDominantPath = historyRecords[1] ? getDominantPostType(historyRecords[1].posts) : null;
    if (dominantPath && previousDominantPath && dominantPath !== previousDominantPath) {
      systemShift = `Shifted bias toward ${dominantPath} formats`;
      systemBecause = `System exploration expanded from previous ${previousDominantPath} baseline`;
    } else if (dominantPath) {
      systemShift = `Maintaining ${dominantPath} baseline`;
      systemBecause = `Gathering data for initial pattern recognition`;
    }
  }

  const uiMap = {
    no_memory: {
      stateTitle: 'No cycle yet',
      direction: 'Awaiting structural baseline',
      reasoning: 'System memory requires an initial compilation cycle to begin tracking patterns.',
      ctaLabel: 'Run first cycle',
      ctaAction: '/generate',
    },
    new_cycle_window: {
      stateTitle: 'Cycle ready',
      direction: systemShift,
      reasoning: systemBecause,
      ctaLabel: !hasRunsRemaining ? 'Access full continuity' : 'Run this cycle',
      ctaAction: !hasRunsRemaining ? '/settings' : '/generate',
    },
    cycle_ready: {
      stateTitle: 'Cycle ready',
      direction: systemShift,
      reasoning: systemBecause,
      ctaLabel: 'Review this cycle',
      ctaAction: '/generate',
    },
    cycle_completed: {
      stateTitle: 'Cycle completed',
      direction: systemShift,
      reasoning: systemBecause,
      ctaLabel: 'Review this cycle',
      ctaAction: '/generate',
    }
  }[dashboardState];

  return (
    <main className="min-h-screen bg-background-base px-6 pb-20 pt-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 animate-in fade-in duration-500">
         
         {/* Dominant State Block */}
         <section className="flex flex-col items-center justify-center text-center py-10 min-h-[50vh]">
            {/* System Context Bar */}
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono tracking-widest text-white/40 uppercase mb-8 pb-4 border-b border-white/[0.06] w-full max-w-md">
               <span>Last run: {latestCycle ? new Date(latestCycle.created_at).toLocaleDateString() : 'Never'}</span>
               <span className="w-1 h-1 rounded-full bg-white/20" />
               <span>Cycles: {historyRecords.length}</span>
               <span className="w-1 h-1 rounded-full bg-white/20" />
               <span className="text-accent/80">{plan} plan</span>
            </div>

            <h1 className="mb-4 text-4xl font-medium text-white tracking-tight">{uiMap.stateTitle}</h1>
            <div className="flex flex-col items-center gap-1.5 mb-10 text-[14px]">
              <div className="text-white/70">{uiMap.direction}</div>
              <div className="text-white/70">{uiMap.reasoning}</div>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <Link 
                href={uiMap.ctaAction} 
                className="bg-white text-black font-semibold text-sm px-8 py-3 rounded-md hover:bg-neutral-100 transition-all duration-150 inline-flex items-center justify-center"
              >
                 {uiMap.ctaLabel}
              </Link>

              {/* System State Indicator */}
              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SIGNAL ACTIVE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                  <span>MEMORY: {historyRecords.length} CYCLE{historyRecords.length !== 1 && 'S'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>LEARNING: {learningSummary.status === 'none' ? 'IDLE' : 'LIVE'}</span>
                </div>
              </div>
            </div>
         </section>
         
         {/* Strategic Ledger */}
         {historyRecords.length > 0 && (
           <section className="flex flex-col gap-8 w-full border-t border-white/10 pt-16">
             <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-white/50 px-2">
               Strategic Ledger
             </div>
             
             <div className="flex flex-col gap-6">
               {historyRecords.map((record, index) => {
                 const prevCycle = historyRecords[index + 1] ?? null;
                 const leadSignal = getCycleLeadSignal(record.insights);
                 const dominantPath = getDominantPostType(record.posts);
                 const prevDominantPath = prevCycle ? getDominantPostType(prevCycle.posts) : null;
                 
                 const fbRecords = feedbackRecords.filter((fb) => fb.history_id === record.id);
                 const cLearning = getCycleLearningSnapshot(record, feedbackRecords, prevCycle);
                 
                 let localShift = 'Exploration baseline';
                 let localBecause = 'No prior data to shift from';
                 
                 if (index < historyRecords.length - 1) {
                   if (cLearning.reinforced && cLearning.reinforced !== 'No statistically dominant outlier yet.' && cLearning.reinforced !== 'None. Building memory footprint.') {
                     localShift = cLearning.reinforced;
                     localBecause = fbRecords.length > 0 ? `Engagement clustered on this structural pattern` : 'Pattern reinforced';
                   } else if (dominantPath && prevDominantPath && dominantPath !== prevDominantPath) {
                     localShift = `Bias shifted to ${dominantPath}`;
                     localBecause = `System rotated format from ${prevDominantPath} to map engagement surfaces`;
                   } else if (dominantPath && prevDominantPath && dominantPath === prevDominantPath) {
                     localShift = `Maintained ${dominantPath} format`;
                     localBecause = `Previous execution maintained established baseline efficiently`;
                   } else {
                     localShift = 'Executing baseline';
                     localBecause = 'Variance in feedback statistically insignificant';
                   }
                 }

                 let nextImpact = cLearning.nextImpact;
                 if (nextImpact.includes('impact sealed') || nextImpact.includes('execution bias sealed')) {
                   nextImpact = 'Standard baseline paths selected';
                 }

                 return (
                   <div key={record.id} className="bg-[#111111] border border-white/8 rounded-xl p-6 lg:p-8">
                      <div className="text-xs text-white/30 mb-4">
                        Week {record.week_number}, {record.year}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium mb-1">SIGNAL</div>
                            <div className="text-sm text-white/80 leading-relaxed">{leadSignal}</div>
                          </div>
                          <div>
                            <div className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium mb-1">DECISION</div>
                            <div className="text-sm text-white/80 leading-relaxed">{localShift}</div>
                          </div>
                          <div>
                            <div className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium mb-1">BECAUSE</div>
                            <div className="text-sm text-white/80 leading-relaxed">{localBecause}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 md:border-l md:border-white/5 md:pl-8 lg:pl-12">
                          <div>
                            <div className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium mb-1">CHANGE FROM LAST WEEK</div>
                            <div className="text-sm text-white/80 leading-relaxed">
                              {prevDominantPath && dominantPath && dominantPath !== prevDominantPath 
                                ? `Decreased ${prevDominantPath}, increased ${dominantPath}` 
                                : `Sustained output structure`}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium mb-1">NEXT IMPACT</div>
                            <div className="text-sm text-white/80 leading-relaxed">{nextImpact}</div>
                          </div>
                        </div></div>
                     </div>
                 );
               })}
             </div>
           </section>
         )}
      </div>
    </main>
  );
}
