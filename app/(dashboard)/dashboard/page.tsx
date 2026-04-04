export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { LiveStatus } from '@/components/system/LiveStatus';
import { createClient } from '@/lib/supabase/server';
import { getPlanSourceSummary } from '@/lib/constants/plan-copy';
import {
  formatLongDate,
  formatShortDate,
  getCycleImplication,
  getCycleLeadSignal,
  getCycleOutputSummary,
  getDominantPostType,
  type StoredCycleRecord,
} from '@/lib/utils/history';
import {
  buildLearningSummary,
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

function formatContextValue(value: string | null | undefined): string {
  if (!value || !value.trim()) {
    return 'Not set';
  }

  return value;
}

function getStateBadgeTone(state: 'blocked' | 'active' | 'ready' | 'idle') {
  if (state === 'blocked') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
  }

  if (state === 'active') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }

  if (state === 'ready') {
    return 'border-white/10 bg-white/[0.04] text-white/72';
  }

  return 'border-white/10 bg-white/[0.02] text-white/52';
}

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
  const latestHistory = historyRecords[0] ?? null;
  const currentWeekHistory =
    historyRecords.find(
      (record) => record.week_number === week && record.year === year
    ) ?? null;
  const planSource = getPlanSourceSummary(plan);
  const learningSummary = buildLearningSummary(historyRecords, feedbackRecords);
  const protectedCycleCount = plan === 'free' ? Math.max(historyRecords.length - 1, 0) : 0;
  const accessibleMemory = plan === 'free' ? historyRecords.slice(0, 1) : historyRecords.slice(0, 3);

  const dashboardState = (() => {
    if (currentWeekHistory) {
      return {
        tone: 'active' as const,
        badge: 'Cycle stored',
        headline: 'Cycle already captured',
        description:
          'Signals, direction, and drafts are attached. Review memory before another run.',
      };
    }

    if (!hasRunsRemaining) {
      return {
        tone: 'blocked' as const,
        badge: 'Capacity gate',
        headline: 'Run limit reached',
        description:
          'This week is paused until capacity resets or access changes.',
      };
    }

    if (latestHistory) {
      return {
        tone: 'ready' as const,
        badge: 'Run Ready',
        headline: 'Ready for this week',
        description: `Last retained cycle: Week ${latestHistory.week_number}, ${latestHistory.year}. Run the next cycle.`,
      };
    }

    return {
        tone: 'idle' as const,
        badge: 'Memory idle',
        headline: 'Start the first cycle',
        description:
          'No memory exists yet. The first run creates it.',
      };
  })();

  const primaryAction = (() => {
    if (currentWeekHistory) {
      return {
        label: 'Open memory',
        href: '/history',
      };
    }

    if (!hasRunsRemaining) {
      return {
        label: 'Open access',
        href: '/settings',
      };
    }

    return {
      label: 'Run engine',
      href: '/generate',
    };
  })();

  const secondaryAction = (() => {
    if (currentWeekHistory) {
      return {
        label: 'Open run surface',
        href: '/generate',
      };
    }

    if (historyRecords.length > 0) {
      return {
        label: 'Open memory',
        href: '/history',
      };
    }

    return {
      label: 'Open settings',
      href: '/settings',
    };
  })();

  const recommendation = (() => {
    if (currentWeekHistory) {
      return {
        title: 'Review this cycle',
        description:
          learningSummary.adjustmentContext[0] ??
          'Open memory before you rerun.',
        href: '/history',
        label: 'Open current cycle',
      };
    }

    if (!hasRunsRemaining) {
      return {
        title: 'Clear the gate',
        description:
          'Open access settings to unblock this week.',
        href: '/settings',
        label: 'Open access',
      };
    }

    if (latestHistory) {
      return {
        title: 'Run from memory',
        description:
          learningSummary.adjustmentContext[0] ??
          'Review memory, then run.',
        href: '/generate',
        label: 'Open engine',
      };
    }

    return {
        title: 'Create first memory',
        description:
          'Run once to create memory.',
        href: '/generate',
        label: 'Start engine',
      };
  })();

  const compactContext = [
    `Niche: ${formatContextValue(onboarding.niche)}`,
    `Audience: ${formatContextValue(onboarding.target_audience)}`,
    `Tone: ${formatContextValue(onboarding.tone)}`,
    `Source: ${planSource.label}`,
  ].join('  /  ');

  const statusFacts = [
    {
      label: 'Current cycle',
      value: currentWeekHistory ? `Week ${week}, ${year} retained` : `Week ${week}, ${year} open`,
    },
    {
      label: 'Run capacity',
      value: `${currentUsage} / ${planLimit} used`,
    },
    {
      label: 'Retained memory',
      value:
        historyRecords.length === 0
          ? 'No retained cycles'
          : plan === 'free' && protectedCycleCount > 0
            ? `${accessibleMemory.length} visible + ${protectedCycleCount} protected`
            : `${historyRecords.length} cycles retained`,
    },
  ];

  const learningNote =
    learningSummary.adjustmentContext[0] ??
    (historyRecords.length === 0
      ? 'Run the first cycle to create memory.'
      : 'Log post results to start learning.');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
            Dashboard
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            System state
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Current state. Main action. Next step.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
          <span className="rounded-sm border border-white/10 px-2.5 py-1">Week {week}, {year}</span>
          <span className="rounded-sm border border-white/10 px-2.5 py-1">{plan} plan</span>
        </div>
      </header>

      <section className="str-elevated grid gap-6 rounded-sm border border-white/10 bg-[#020202] p-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-8">
        <div className="space-y-5">
          <div
            className={`inline-flex items-center rounded-sm border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${getStateBadgeTone(dashboardState.tone)}`}
          >
            {dashboardState.badge}
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              System state
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-[2.8rem]">
              {dashboardState.headline}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/56">
              {dashboardState.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LiveStatus
                label={currentWeekHistory ? 'Cycle updated' : 'Last run'}
                timestamp={currentWeekHistory?.created_at ?? latestHistory?.created_at ?? null}
                fallback="No cycle signal"
                justNowLabel={currentWeekHistory ? 'Cycle updated just now' : 'Last run just now'}
                pulse={Boolean(currentWeekHistory?.created_at ?? latestHistory?.created_at)}
              />
              <LiveStatus
                label="Feedback synced"
                timestamp={learningSummary.lastFeedbackAt}
                fallback="No feedback signal"
                justNowLabel="Feedback synced just now"
              />
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={primaryAction.href}
              className="str-cta inline-flex h-14 items-center justify-center rounded-sm bg-white px-7 text-[12px] font-bold uppercase tracking-[0.24em] text-black shadow-[0_10px_30px_-20px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/92"
            >
              {primaryAction.label}
            </Link>
            <div className="mt-3">
              <Link
                href={secondaryAction.href}
                className="str-soft-transition inline-flex h-10 items-center justify-center rounded-sm border border-white/10 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/64 hover:border-white/20 hover:text-white"
              >
                {secondaryAction.label}
              </Link>
            </div>
          </div>
        </div>

        <aside className="border-t border-white/5 pt-5 text-xs lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">
            Next action
          </div>
          <p className="mt-2 text-sm font-medium text-white/88">
            {recommendation.title}
          </p>
          <Link
            href={recommendation.href}
            className="str-soft-transition mt-3 inline-flex items-center gap-2 text-[11px] text-white/60 hover:text-white"
          >
            {recommendation.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            {statusFacts.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/26">
                  {item.label}
                </dt>
                <dd className="text-right text-[11px] text-white/54">{item.value}</dd>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-b border-white/5 pb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Current context
          </div>
          <p className="mt-3 text-sm text-white/66">{compactContext}</p>
        </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="str-elevated rounded-sm border border-white/10 bg-[#020202] p-6">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                Memory snapshot
              </div>
              <h3 className="mt-2 text-xl font-medium text-white">System memory</h3>
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
              {historyRecords.length === 0
                ? 'No retained cycles'
                : latestHistory
                  ? `Latest stored ${formatShortDate(latestHistory.created_at)}`
                  : 'Memory ready'}
            </div>
          </div>

          {accessibleMemory.length > 0 ? (
            <div className="mt-2 divide-y divide-white/10">
              {accessibleMemory.map((record, index) => {
                const isCurrentCycle =
                  record.week_number === week && record.year === year;
                const leadSignal = truncateText(getCycleLeadSignal(record.insights), 96);
                const implication = truncateText(getCycleImplication(record.insights), 150);
                const summary = dominantPathOrSummary(record.hooks, record.posts);

                return (
                <details key={record.id} className="group py-4">
                  <summary className="list-none cursor-pointer">
                      <div className="str-surface-interactive grid gap-3 rounded-sm px-1 py-1 md:grid-cols-[140px_minmax(0,1fr)_120px] md:items-start">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                            {isCurrentCycle ? 'Current cycle' : index === 0 ? 'Latest memory' : 'Retained cycle'}
                          </div>
                          <div className="mt-1 text-base font-medium text-white">
                            Week {record.week_number}, {record.year}
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed text-white/82 line-clamp-1">
                          {leadSignal}
                        </p>

                        <div className="text-right text-[11px] text-white/46">
                          <div>Expand</div>
                          <div className="mt-1">{summary}</div>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-3 border-t border-white/5 pt-3">
                      <div className="text-[11px] text-white/50">
                        {formatLongDate(record.created_at)}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/58">
                        {implication}
                      </p>
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 border border-dashed border-white/10 px-4 py-6 text-sm leading-relaxed text-white/55">
              No cycle memory exists yet. Run the engine once to create the first retained system state for this workspace.
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-[11px] text-white/45">
            <span>
              {historyRecords.length === 0
                ? 'Retained cycles: 0'
                : `Retained cycles: ${historyRecords.length}`}
            </span>
            <span>
              {learningSummary.annotatedCycleCount === 0
                ? 'Feedback-linked cycles: 0'
                : `Feedback-linked cycles: ${learningSummary.annotatedCycleCount}`}
            </span>
            {plan === 'free' && protectedCycleCount > 0 && (
              <span>Protected cycles: {protectedCycleCount}</span>
            )}
          </div>
        </section>

        <aside className="space-y-4 border-t border-white/5 pt-4 text-xs xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">
              Recommendation
            </div>
            <p className="mt-2 text-sm font-medium text-white/88">
              {recommendation.title}
            </p>
            <Link
              href={recommendation.href}
              className="str-soft-transition mt-3 inline-flex items-center gap-2 text-[11px] text-white/60 hover:text-white"
            >
              {recommendation.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="border-t border-white/5 pt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">
              Learning note
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/48">
              {learningNote}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function dominantPathOrSummary(
  hooks: StoredCycleRecord['hooks'],
  posts: StoredCycleRecord['posts']
) {
  return getDominantPostType(posts) ?? getCycleOutputSummary(hooks, posts);
}
