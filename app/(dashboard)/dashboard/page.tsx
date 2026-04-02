export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WelcomeGuide } from '@/components/dashboard/WelcomeGuide';
import { UsageCard } from '@/components/dashboard/UsageCard';
import { Plan } from '@/types';
import { redirect } from 'next/navigation';
import { getISOWeek } from '@/lib/utils/week';
import { PLAN_LIMITS } from '@/lib/utils/usage';

function truncateText(text: string | undefined, limit: number): string {
  if (!text) return 'Not available yet.';
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
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
    .select('niche')
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

  const currentUsage = usageData?.generations_used ?? 0;
  const plan: Plan =
    profile.plan === 'basic' || profile.plan === 'pro' ? profile.plan : 'free';
  const niche = onboarding.niche;

  const { data: recentHistory } = await supabase
    .from('content_history')
    .select('id, week_number, year, insights, hooks, posts, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const historyRecords = recentHistory ?? [];
  const latestHistory = historyRecords[0] ?? null;
  const currentWeekHistory =
    historyRecords.find((record) => record.week_number === week && record.year === year) ?? null;
  const planLimit = PLAN_LIMITS[plan] ?? 1;
  const remainingRuns = Math.max(planLimit - currentUsage, 0);

  const nextAction = (() => {
    if (remainingRuns === 0) {
      return {
        label: 'Upgrade your weekly capacity',
        href: '/settings',
        description: 'You have reached this week’s run limit. Move up a plan to keep the weekly flow active.',
      };
    }

    if (!latestHistory) {
      return {
        label: 'Run your first weekly strategy',
        href: '/generate',
        description: 'Start your first signal-backed LinkedIn strategy pass for the current week.',
      };
    }

    if (!currentWeekHistory) {
      return {
        label: 'Generate this week’s strategy',
        href: '/generate',
        description: 'Your latest run is from a previous week. Generate a fresh strategy pass for the current cycle.',
      };
    }

    return {
      label: 'Review the latest strategy output',
      href: '/history',
      description: 'You already have a run for this week. Review the latest hooks, drafts, and archived output.',
    };
  })();

  const currentWeekState = currentWeekHistory
    ? {
        label: `Already run for week ${week}, ${year}`,
        description: `This week already has a strategy pass with ${(currentWeekHistory.insights as unknown[] | null)?.length ?? 0} observed patterns and ${(currentWeekHistory.posts as unknown[] | null)?.length ?? 0} drafts ready to review.`,
      }
    : {
        label: `Not run yet for week ${week}, ${year}`,
        description: remainingRuns === 0
          ? 'This week has no fresh strategy pass yet, and your current plan has no remaining runs available.'
          : 'No strategy has been generated for the current week yet. You can run a fresh pass now.',
      };

  const currentCyclePosition = currentWeekHistory ? 'This week is complete' : remainingRuns === 0 ? 'This week is blocked' : 'This week is ready';
  const whatHappened = latestHistory
    ? `Latest run completed for week ${latestHistory.week_number}, ${latestHistory.year}.`
    : 'No strategy run has been completed yet.';

  const latestInsight = latestHistory
    ? ((latestHistory.insights as Array<{ insight?: string; why?: string; trigger?: string }> | null)?.[0] ?? null)
    : null;
  const latestHook = latestHistory
    ? ((latestHistory.hooks as string[] | null)?.[0] ?? null)
    : null;
  const latestPost = latestHistory
    ? ((latestHistory.posts as Array<{ content?: string; type?: string; explanation?: string }> | null)?.[0] ?? null)
    : null;

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500 -mt-2">
      
      {/* Structural HUD Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 flex-1 w-full border-t border-white/5 relative bg-[#020202]">
        
        {/* Architectural 1px grid lines */}
        <div className="hidden xl:block absolute inset-y-0 left-1/4 w-px bg-white/5 z-0" />
        <div className="hidden xl:block absolute inset-y-0 left-2/4 w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:1px_8px] z-0" />
        <div className="hidden xl:block absolute inset-y-0 left-3/4 w-px bg-white/5 z-0" />

        {/* Column 1: Context & Parameters */}
        <div className="p-6 md:p-8 flex flex-col relative z-10 border-b xl:border-b-0 border-white/5">
          <div className="sticky top-6">
            <h2 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-8 flex items-center gap-2">
              <span className="w-1 h-3 bg-white/20 inline-block" />
              Strategy Profile
            </h2>
            
            <div className="flex flex-col gap-1 mb-10 border-l border-emerald-500/30 pl-4 py-1.5 hover:border-emerald-500 transition-colors">
               <span className="text-[9px] uppercase tracking-widest text-emerald-500/80 font-bold">TARGET NICHE</span>
               <span className="font-mono text-white text-xs">{niche}</span>
            </div>

            <WelcomeGuide
              plan={plan}
              stateLabel={currentWeekState.label}
              stateDescription={currentWeekState.description}
              nextActionLabel={nextAction.label}
              nextActionDescription={nextAction.description}
            />
          </div>
        </div>

        {/* Column 2 & 3: Main Workbench Data */}
        <div className="xl:col-span-2 p-0 flex flex-col relative z-10 bg-gradient-to-b from-[#000000]/40 to-transparent backdrop-blur-xl shrink-0">
          <div className="p-6 md:p-8 flex-1 flex flex-col min-h-[400px]">
            <div className="mb-6 rounded-sm border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Current Week State</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {currentWeekHistory ? 'This week already has a strategy run' : 'This week is still waiting for a run'}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
                    {currentWeekState.description}
                  </p>
                </div>
                <Link
                  href={nextAction.href}
                  className="inline-flex h-10 items-center justify-center rounded-sm border border-white/10 bg-white px-4 text-[11px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                >
                  {nextAction.label}
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">What Happened</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{whatHappened}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Where You Are</div>
                  <p className="mt-2 text-sm text-white">{currentCyclePosition}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{currentWeekState.label}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Next Step</div>
                  <p className="mt-2 text-sm text-white">{nextAction.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{remainingRuns} runs left this week.</p>
                </div>
              </div>
            </div>

            {latestHistory ? (
              <div className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 w-max px-3 py-1 bg-white/[0.02] border border-white/5 rounded-sm">
                    <span className="text-[10px] text-emerald-500 uppercase font-medium tracking-widest">
                      Latest Output · {new Date(latestHistory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                    Week {latestHistory.week_number}, {latestHistory.year}
                  </h4>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Latest Strategic Signal</div>
                    <p className="mt-3 text-lg font-medium leading-snug text-white">
                      {latestInsight?.insight ?? 'No insight available yet.'}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                        <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Trigger</div>
                        <p className="mt-2 text-sm text-white/80">{latestInsight?.trigger ?? 'Not available yet.'}</p>
                      </div>
                      <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                        <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Why It Matters</div>
                        <p className="mt-2 text-sm leading-relaxed text-white/60">
                          {truncateText(latestInsight?.why, 140)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Latest Draft Preview</div>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-white">
                      {latestHook ?? 'No hook available yet.'}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-[12px] leading-relaxed text-white/60">
                      {truncateText(latestPost?.content, 220)}
                    </p>
                    {latestPost?.type && (
                      <div className="mt-4 inline-flex rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        {latestPost.type}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-sm overflow-hidden">
                  <div className="flex flex-col items-center bg-[#050505] p-6 cursor-default">
                    <span className="text-4xl font-bold text-white font-mono mb-2">
                      {(latestHistory.insights as unknown[] | null)?.length ?? 0}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Insights</span>
                  </div>
                  <div className="flex flex-col items-center bg-[#050505] p-6 cursor-default">
                    <span className="text-4xl font-bold text-white font-mono mb-2">
                      {(latestHistory.posts as unknown[] | null)?.length ?? 0}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Drafts</span>
                  </div>
                </div>

                {historyRecords.length > 1 && (
                  <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Recent Weeks</div>
                    <div className="mt-4 space-y-3">
                      {historyRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm text-white/70">
                          <span>Week {record.week_number}, {record.year}</span>
                          <span className="text-[10px] uppercase tracking-widest text-white/35">
                            {(record.posts as unknown[] | null)?.length ?? 0} drafts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <div className="flex flex-col justify-center w-full max-w-2xl mx-auto h-full">
                 <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                   <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">System Ready</div>
                   <h4 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                     The weekly engine has not produced output yet
                   </h4>
                   <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
                     Your niche and onboarding context are in place. Run the first weekly strategy pass to generate insights, hook options, and draft output grounded in your LinkedIn focus.
                   </p>
                   <div className="mt-5 grid gap-3 md:grid-cols-3">
                     <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                       <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Niche</div>
                       <p className="mt-2 text-sm text-white">{niche}</p>
                     </div>
                     <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                       <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Current Week</div>
                       <p className="mt-2 text-sm text-white">Week {week}, {year}</p>
                     </div>
                     <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                       <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Remaining Runs</div>
                       <p className="mt-2 text-sm text-white">{remainingRuns}</p>
                     </div>
                   </div>
                 </div>
               </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-[#000000]/60 w-full flex items-center justify-between mt-auto">
            <Link href="/history" className="text-xs font-medium text-white/40 hover:text-white transition-colors">
              Access Full History Archive →
            </Link>
          </div>
        </div>

        {/* Column 4: Telemetry & Hard Controls */}
        <div className="p-6 md:p-8 flex flex-col relative z-10 border-t xl:border-t-0 border-white/5 bg-[#000000]/20">
          <div className="sticky top-6 flex flex-col h-full gap-10">
            <div>
              <h2 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-8 flex items-center gap-2">
                <span className="w-1 h-3 bg-white/20 inline-block" />
                Usage Metrics
              </h2>
              <UsageCard plan={plan} usage={currentUsage} />
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
              <h2 className="text-[9px] font-bold tracking-widest text-white/30 uppercase mb-4">Quick Commands</h2>
              <QuickActions
                plan={plan}
                primaryActionLabel={nextAction.label}
                primaryActionHref={nextAction.href}
                primaryActionDescription={nextAction.description}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
