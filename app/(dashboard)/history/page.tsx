import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronDown, Lock } from 'lucide-react';
import { LiveStatus } from '@/components/system/LiveStatus';
import { HISTORY_LOCK_MESSAGE } from '@/lib/constants/plan-copy';
import { createClient } from '@/lib/supabase/server';
import {
  formatLongDate,
  formatShortDate,
  getCycleImplication,
  getCycleLeadSignal,
  getCycleOutputSummary,
  getCycleSignalStrength,
  getDominantPostType,
  type StoredCycleRecord,
} from '@/lib/utils/history';
import {
  buildLearningSummary,
  formatPathTypeLabel,
  getCycleLearningSnapshot,
  type StoredFeedbackRecord,
} from '@/lib/utils/learning';
import { getISOWeek } from '@/lib/utils/week';

function truncateText(value: string, limit: number = 180): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).trimEnd()}...`;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .maybeSingle();

  const plan =
    profile?.plan === 'basic' || profile?.plan === 'pro' ? profile.plan : 'free';

  const { data: history, error } = await supabase
    .from('content_history')
    .select('id, week_number, year, insights, hooks, posts, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: feedback } = await supabase
    .from('post_feedback')
    .select('history_id, post_index, views, likes, comments, reposts, notes, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const historyRecords = (history ?? []) as StoredCycleRecord[];
  const feedbackRecords = (feedback ?? []) as StoredFeedbackRecord[];
  const { week, year } = getISOWeek();
  const currentWeekRecord =
    historyRecords.find(
      (record) => record.week_number === week && record.year === year
    ) ?? null;
  const accessibleRecords = plan === 'free' ? historyRecords.slice(0, 1) : historyRecords;
  const lockedRecords = plan === 'free' ? historyRecords.slice(1) : [];
  const learningSummary = buildLearningSummary(historyRecords, feedbackRecords);

  const feedbackSummary = feedbackRecords.reduce<
    Record<string, { count: number; lastSubmittedAt: string }>
  >((acc, item) => {
    const current = acc[item.history_id];

    acc[item.history_id] = {
      count: current ? current.count + 1 : 1,
      lastSubmittedAt: current?.lastSubmittedAt ?? item.created_at,
    };

    return acc;
  }, {});

  const learningStatusLabel =
    learningSummary.status === 'directional'
      ? 'Directional learning live'
      : learningSummary.status === 'early'
        ? 'Early learning live'
        : 'Learning idle';

  const performanceGapNote =
    learningSummary.feedbackEntryCount === 0
      ? 'Log reviewed post results to compare cycles.'
      : learningSummary.comparisonBasis === 'insufficient'
        ? 'Log reviewed posts across more cycles to compare gaps.'
        : learningSummary.latestOperatorNote
          ? `Latest operator note: ${learningSummary.latestOperatorNote}`
          : `Keep logging reviewed results to sharpen the layer beyond ${learningSummary.annotatedCycleCount} annotated cycle${learningSummary.annotatedCycleCount === 1 ? '' : 's'}.`;

  const learningCells = [
    {
      label: 'Stronger patterns',
      value: learningSummary.strongestType
        ? `${formatPathTypeLabel(learningSummary.strongestType)} paths`
        : 'Awaiting results',
      detail:
        learningSummary.bestPerformanceNote ??
        'Log reviewed posts to surface stronger patterns.',
    },
    {
      label: 'Weaker patterns',
      value: learningSummary.weakestType
        ? `${formatPathTypeLabel(learningSummary.weakestType)} paths`
        : 'Need more cycles',
      detail:
        learningSummary.cautionNote ??
        'The system needs more reviewed cycles before it can call a weaker pattern.',
    },
    {
      label: 'Drift detection',
      value:
        learningSummary.driftStatus === 'repeating'
          ? 'Repeated bias detected'
        : learningSummary.driftStatus === 'emerging'
            ? 'Drift emerging'
            : 'Watch more cycles',
      detail:
        learningSummary.driftNote ??
        'Drift appears after repeated cycle behavior, not a single run.',
    },
    {
      label: 'Performance gaps',
      value:
        learningSummary.feedbackEntryCount === 0
          ? 'Review posts first'
          : `${learningSummary.feedbackEntryCount} reviewed post${learningSummary.feedbackEntryCount === 1 ? '' : 's'}`,
      detail: performanceGapNote,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
            History
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            System memory
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Learning first. Timeline below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
          <span className="rounded-sm border border-white/10 px-2.5 py-1">
            {currentWeekRecord ? `Week ${week}, ${year} stored` : `Week ${week}, ${year} open`}
          </span>
          <span className="rounded-sm border border-white/10 px-2.5 py-1">
            {historyRecords.length} retained cycle{historyRecords.length === 1 ? '' : 's'}
          </span>
          {lockedRecords.length > 0 && (
            <span className="rounded-sm border border-white/10 px-2.5 py-1">
              {lockedRecords.length} protected
            </span>
          )}
        </div>
      </header>

      <section className="str-elevated rounded-sm border border-white/10 bg-[#020202] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              Learning layer
            </div>
            <h2 className="mt-2 text-2xl font-medium text-white">
              System learning
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LiveStatus
                label="Memory updated"
                timestamp={historyRecords[0]?.created_at ?? null}
                fallback="No cycle signal"
                justNowLabel="Memory updated just now"
                pulse={Boolean(historyRecords[0]?.created_at)}
              />
              <LiveStatus
                label="Feedback synced"
                timestamp={learningSummary.lastFeedbackAt}
                fallback="No feedback signal"
                justNowLabel="Feedback synced just now"
              />
            </div>
          </div>

          <div className="rounded-sm border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            {learningStatusLabel}
          </div>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 md:grid-cols-2">
          {learningCells.map((cell) => (
            <div key={cell.label} className="str-surface-interactive bg-[#020202] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/32">
                {cell.label}
              </div>
              <p className="mt-3 text-base font-medium text-white">
                {cell.value}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                {cell.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              Memory timeline
            </div>
            <h2 className="mt-2 text-2xl font-medium text-white">
              Retained weekly cycles
            </h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            {historyRecords.length === 0
              ? 'Timeline empty'
              : `${accessibleRecords.length} cycle${accessibleRecords.length === 1 ? '' : 's'} visible`}
          </div>
        </div>

        {!error && historyRecords.length > 0 ? (
          <div className="str-elevated overflow-hidden rounded-sm border border-white/10 bg-[#020202]">
            {accessibleRecords.map((record, index) => {
              const isCurrentCycle =
                record.week_number === week && record.year === year;
              const historyIndex = historyRecords.findIndex((item) => item.id === record.id);
              const followingCycle =
                historyIndex > 0 ? historyRecords[historyIndex - 1] ?? null : null;
              const cycleFeedback = feedbackSummary[record.id];
              const cycleLearning = getCycleLearningSnapshot(
                record,
                feedbackRecords,
                followingCycle
              );
              const leadSignal = truncateText(getCycleLeadSignal(record.insights), 170);
              const implication = truncateText(getCycleImplication(record.insights), 160);
              const signalStrength = getCycleSignalStrength(record.insights);
              const dominantPath = getDominantPostType(record.posts);

              return (
                <details
                  key={record.id}
                  open={index === 0}
                  className="group border-b border-white/10 last:border-b-0"
                >
                  <summary className="list-none cursor-pointer px-5 py-5">
                    <div className="str-surface-interactive grid gap-4 rounded-sm px-1 py-1 lg:grid-cols-[140px_minmax(0,1fr)_150px] lg:items-start">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                          {isCurrentCycle ? 'Current cycle' : index === 0 ? 'Latest cycle' : 'Stored cycle'}
                        </div>
                        <div className="mt-2 text-lg font-medium text-white">
                          Week {record.week_number}, {record.year}
                        </div>
                        <div className="mt-2 text-[11px] text-white/42">
                          {formatLongDate(record.created_at)}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm leading-relaxed text-white">
                          {leadSignal}
                        </p>
                      </div>

                      <div className="space-y-2 lg:text-right">
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/36 lg:justify-end">
                          <span>{record.insights?.length ?? 0} signals</span>
                          <span>{record.hooks?.length ?? 0} hooks</span>
                          <span>{record.posts?.length ?? 0} drafts</span>
                          {signalStrength && <span>{signalStrength} signal</span>}
                        </div>
                        <div className="text-[12px] text-white/50">
                          {dominantPath ?? getCycleOutputSummary(record.hooks, record.posts)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/45 lg:justify-end">
                          <span>Expand cycle</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                        </div>
                      </div>
                    </div>
                  </summary>

                  <div className="border-t border-white/10 px-5 py-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_240px]">
                      <div className="space-y-3">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">
                          Signal memory
                        </div>
                        <p className="text-sm leading-relaxed text-white/86">{leadSignal}</p>
                        <p className="text-[12px] leading-relaxed text-white/48">{implication}</p>
                        <div className="space-y-4 border-l border-white/5 pl-4">
                          {(record.insights ?? []).slice(0, 3).map((item, insightIndex) => (
                            <div key={`${record.id}-insight-${insightIndex}`}>
                              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                                Signal {insightIndex + 1}
                              </div>
                              <p className="mt-1 text-[12px] leading-relaxed text-white/72">
                                {item.pattern || item.insight || 'Stored signal summary unavailable.'}
                              </p>
                              <p className="mt-1 text-[11px] leading-relaxed text-white/42">
                                {item.implication || item.recommended_move || item.why || 'No additional implication note is attached.'}
                              </p>
                            </div>
                          ))}

                          {(record.insights ?? []).length === 0 && (
                            <p className="text-sm leading-relaxed text-white/50">
                              No retained signal layer is attached to this cycle.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                            Recommended move
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/66">
                            {truncateText(getCycleImplication(record.insights), 180)}
                          </p>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                            Output bias
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/48">
                            {dominantPath ?? getCycleOutputSummary(record.hooks, record.posts)}
                          </p>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                            Stored summary
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/48">
                            {getCycleOutputSummary(record.hooks, record.posts)}
                          </p>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                            Retained hooks
                          </div>
                          <div className="mt-1 space-y-1">
                            {(record.hooks ?? []).slice(0, 3).map((hook, hookIndex) => (
                              <p
                                key={`${record.id}-hook-${hookIndex}`}
                                className="text-[12px] leading-relaxed text-white/60"
                              >
                                {hook}
                              </p>
                            ))}
                            {(record.hooks ?? []).length === 0 && (
                              <p className="text-[11px] leading-relaxed text-white/40">
                                No hooks retained.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 border-t border-white/5 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">
                          Cycle record
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                            Feedback layer
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/66">
                            {cycleFeedback
                              ? `${cycleFeedback.count} feedback note${cycleFeedback.count === 1 ? '' : 's'} attached`
                              : 'No feedback notes attached to this cycle yet.'}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-white/42">
                            {cycleFeedback?.lastSubmittedAt
                              ? `Last sync ${formatShortDate(cycleFeedback.lastSubmittedAt)}`
                              : 'Feedback continuity begins after the first reviewed post.'}
                          </p>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">
                            Learning from this cycle
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/66">
                            {cycleLearning.summary}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-white/42">
                            {cycleLearning.progressionNote ?? 'No following retained cycle exists yet to show the next shift.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        ) : error ? (
          <div className="rounded-sm border border-white/10 bg-[#020202] px-6 py-10 text-center text-white/58">
            History records are temporarily unavailable.
          </div>
        ) : (
          <div className="rounded-sm border border-white/10 bg-[#020202] px-6 py-10 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              Memory timeline empty
            </div>
            <p className="mt-3 text-lg text-white">Run the first cycle.</p>
            <p className="mt-2 mx-auto max-w-2xl text-sm leading-relaxed text-white/58">
              That creates memory and unlocks comparison and drift detection.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/generate"
                className="str-cta inline-flex h-11 items-center justify-center rounded-sm bg-white px-5 text-[11px] font-bold uppercase tracking-widest text-black hover:bg-white/90"
              >
                Run first cycle
              </Link>
              <Link
                href="/dashboard"
                className="str-soft-transition inline-flex h-11 items-center justify-center rounded-sm border border-white/10 px-5 text-[11px] font-bold uppercase tracking-widest text-white/72 hover:border-white/20 hover:text-white"
              >
                Return to dashboard
              </Link>
            </div>
          </div>
        )}

        {lockedRecords.length > 0 && (
          <div className="border-t border-white/5 pt-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">
                  <Lock className="h-3.5 w-3.5 text-white/40" />
                  Protected memory
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {HISTORY_LOCK_MESSAGE}. {lockedRecords.length} older cycle{lockedRecords.length === 1 ? '' : 's'} remain stored in this workspace even though only the newest retained cycle is currently visible.
                </p>
              </div>
              <Link
                href="/settings"
                className="str-soft-transition inline-flex h-10 items-center justify-center rounded-sm border border-white/10 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/64 hover:border-white/20 hover:text-white"
              >
                Review plans
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">
              {lockedRecords.slice(0, 6).map((record) => (
                <span
                  key={record.id}
                  className="rounded-sm border border-white/10 px-2.5 py-1"
                >
                  Week {record.week_number}, {record.year}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
