export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UsageCard } from '@/components/dashboard/UsageCard';
import { createClient } from '@/lib/supabase/server';
import { PLAN_LIMITS } from '@/lib/utils/usage';
import { getISOWeek } from '@/lib/utils/week';
import { Plan } from '@/types';

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
    .select('week_number, year, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const historyRecords = recentHistory ?? [];
  const latestHistory = historyRecords[0] ?? null;
  const currentWeekHistory =
    historyRecords.find(
      (record) => record.week_number === week && record.year === year
    ) ?? null;
  const planLimit = PLAN_LIMITS[plan] ?? 1;
  const remainingRuns = Math.max(planLimit - currentUsage, 0);

  const nextAction = (() => {
    if (remainingRuns === 0) {
      return {
        label: 'Upgrade your weekly capacity',
        href: '/settings',
        description:
          'You have reached this week’s run limit. Move up a plan to keep the weekly flow active.',
      };
    }

    if (!latestHistory) {
      return {
        label: 'Generate this week’s strategy',
        href: '/generate',
        description:
          'Start the first strategy pass for the current week.',
      };
    }

    if (!currentWeekHistory) {
      return {
        label: 'Generate this week’s strategy',
        href: '/generate',
        description:
          'Your last completed run belongs to a previous week. Generate a fresh strategy for the current cycle.',
      };
    }

    return {
      label: 'Review this week’s strategy',
      href: '/history',
      description:
        'This week already has a completed strategy. Open the archive to continue with the current output.',
    };
  })();

  const lastCompletedRun = latestHistory
    ? `Week ${latestHistory.week_number}, ${latestHistory.year}`
    : 'No completed run';
  const lastCompletedRunMeta = latestHistory
    ? new Date(latestHistory.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Archive is empty';
  const weeklyCapacityLabel =
    remainingRuns === 0
      ? 'Limit reached'
      : `${remainingRuns} ${remainingRuns === 1 ? 'run' : 'runs'} left`;
  const weeklyCapacityMeta = `${currentUsage} of ${planLimit} used`;
  const stateBadge =
    remainingRuns === 0
      ? 'Blocked'
      : currentWeekHistory
        ? 'Complete'
        : latestHistory
          ? 'Ready'
          : 'Not started';

  const primaryHeadline =
    remainingRuns === 0
      ? 'This week is blocked'
      : currentWeekHistory
        ? 'Strategy already generated this week'
        : latestHistory
          ? 'No strategy run yet for this week'
          : 'No strategy run yet';

  const primaryDescription =
    remainingRuns === 0
      ? 'You have used all available runs for the current cycle. Increase weekly capacity to generate another strategy now.'
      : currentWeekHistory
        ? 'The current cycle already has a completed strategy. Review the archive to continue with this week’s output instead of starting a new run.'
        : latestHistory
          ? `Your latest completed run was ${lastCompletedRun}. Generate a fresh strategy for week ${week}, ${year}.`
          : 'Your context is ready. Generate the first strategy for this week to produce insights and draft output.';

  return (
    <div className="flex w-full flex-1 flex-col animate-in fade-in duration-500 -mt-2">
      <div className="grid w-full flex-1 grid-cols-1 border-t border-white/5 bg-[#020202] xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="order-1 bg-[#000000] p-6 md:p-8">
          <div className="rounded-sm border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-black/30 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white/58">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Weekly State
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
                  {stateBadge}
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {primaryHeadline}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/68">
                  {primaryDescription}
                </p>
              </div>

              <Link
                href={nextAction.href}
                className="inline-flex h-12 items-center justify-center rounded-sm bg-white px-6 text-[11px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white/90"
              >
                {nextAction.label}
              </Link>
            </div>

            <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-3">
              <div className="bg-black/30 px-4 py-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Current Cycle
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  Week {week}, {year}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                  The cycle currently in focus.
                </p>
              </div>

              <div className="bg-black/30 px-4 py-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Last Completed Run
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  {lastCompletedRun}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                  {lastCompletedRunMeta}
                </p>
              </div>

              <div className="bg-black/30 px-4 py-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Weekly Capacity
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  {weeklyCapacityLabel}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                  {weeklyCapacityMeta}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-white/44">
              {nextAction.description}
            </p>
          </div>
        </div>

        <div className="order-2 border-t border-white/5 bg-[#000000]/20 p-6 xl:border-l xl:border-t-0">
          <div className="space-y-4 xl:sticky xl:top-6">
            <UsageCard plan={plan} usage={currentUsage} />

            <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
                Niche
              </div>
              <p className="mt-2 text-sm text-white">{niche}</p>
            </div>

            <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
                Archive
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                Review previous strategy runs when you need historical context.
              </p>
              <Link
                href="/history"
                className="mt-3 inline-flex text-sm text-white/55 transition-colors hover:text-white"
              >
                Open archive →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
