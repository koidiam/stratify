import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronDown, Lock } from 'lucide-react';
import { LiveStatus } from '@/components/system/LiveStatus';
import { createClient } from '@/lib/supabase/server';
import { RunManifest } from '@/components/system/RunManifest';
import {
  formatLongDate,
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
import { ResearchProvenance, LearningSummary } from '@/types';


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
    .select('id, week_number, year, insights, hooks, posts, created_at, research_summary, learning_summary, run_logic_summary')
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
          <div className="mb-2 text-[13px] font-medium text-white/50">
            History
          </div>
          <h1 className="text-3xl font-medium text-white">
            Memory chain
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/40">
          <span className="rounded-sm border border-white/5 bg-white/[0.02] px-2.5 py-1">
            {currentWeekRecord ? `Week ${week}, ${year} stored` : `Week ${week}, ${year} open`}
          </span>
          <span className="rounded-sm border border-white/5 bg-white/[0.02] px-2.5 py-1">
            {historyRecords.length} retained cycle{historyRecords.length === 1 ? '' : 's'}
          </span>
          {lockedRecords.length > 0 && (
            <span className="rounded-sm border border-white/5 bg-white/[0.02] px-2.5 py-1">
              {lockedRecords.length} protected
            </span>
          )}
        </div>
      </header>

      <section className="str-elevated rounded-sm border border-border-subtle bg-background-panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 text-[13px] font-medium text-white/50">
              System bias
            </div>
            <h2 className="mb-2 text-2xl font-medium text-white">
              Learning state
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
          {learningCells.map((cell) => {
            const isDriftWarning = cell.label === 'Drift detection' && cell.value === 'Repeated bias detected';
            return (
              <div 
                key={cell.label} 
                className={`str-surface-interactive p-4 ${
                  isDriftWarning 
                    ? 'border-l-2 border-amber-400/60 bg-amber-500/5' 
                    : 'bg-background-base'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isDriftWarning ? 'text-amber-300/80' : 'text-white/32'
                }`}>
                  {cell.label}
                </div>
                <p className="mt-3 text-base font-medium text-white">
                  {cell.value}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                  {cell.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 text-[13px] font-medium text-emerald-500/70">
              Continuity chain
            </div>
            <h2 className="mb-2 text-2xl font-medium text-white">
              System evolution
            </h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            {historyRecords.length === 0
              ? 'Timeline empty'
              : `${historyRecords.length} node${historyRecords.length === 1 ? '' : 's'} linked`}
          </div>
        </div>

        {!error && historyRecords.length > 0 ? (
          <div className="relative pl-4 md:pl-8 space-y-10">
            {/* Thread line */}
            <div className="absolute left-[7px] md:left-[15px] top-8 bottom-8 border-l border-white/10" />
            {historyRecords.map((record, index) => {
              const isAccessible = plan !== 'free' || index === 0;
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
              const leadSignal = getCycleLeadSignal(record.insights);
              const implication = getCycleImplication(record.insights);
              const signalStrength = getCycleSignalStrength(record.insights);
              const dominantPath = getDominantPostType(record.posts);
              const previousCycle = historyIndex < historyRecords.length - 1 ? historyRecords[historyIndex + 1] : null;
              const previousDominantPath = previousCycle ? getDominantPostType(previousCycle.posts) : null;
              
              const isDrift = dominantPath && previousDominantPath && dominantPath !== previousDominantPath;
              let crossCycleNote = '';
              if (dominantPath && previousDominantPath) {
                if (dominantPath === previousDominantPath) {
                  crossCycleNote = `Reinforcing prior execution of ${dominantPath} format.`;
                } else {
                  crossCycleNote = `DRIFT DETECTED: Shifted structural bias from last week's ${previousDominantPath} format.`;
                }
              }

              const cycleFeedbackRecords = feedbackRecords.filter((fb) => fb.history_id === record.id);
              const operatorNote = cycleFeedbackRecords.find((fb) => fb.notes)?.notes ?? null;

              let systemShift = 'No measurable change';
              let systemBecause = 'Insufficient feedback data';

              if (cycleFeedbackRecords.length > 0) {
                if (cycleLearning.reinforced && cycleLearning.reinforced !== 'No statistically dominant outlier yet.' && cycleLearning.reinforced !== 'None. Building memory footprint.') {
                  systemShift = cycleLearning.reinforced;
                  systemBecause = `${cycleFeedbackRecords.length} executed paths showed clustered higher engagement on this pattern`;
                } else if (crossCycleNote) {
                  systemShift = crossCycleNote;
                  systemBecause = 'Prior baseline execution maintained consistent trajectory';
                } else {
                  systemShift = 'No measurable change';
                  systemBecause = 'Feedback logged but variance between formats is statistically insignificant';
                }
              }

              const summaryContent = (
                <div className="str-surface-interactive grid gap-4 rounded-sm px-1 py-1 lg:grid-cols-[140px_minmax(0,1fr)_150px] lg:items-start">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                      {isCurrentCycle ? 'Current cycle' : index === 0 ? 'Latest cycle' : isAccessible ? 'Stored cycle' : 'Sealed cycle'}
                    </div>
                    <div className={`mt-2 text-lg font-medium tracking-tight ${isAccessible ? 'text-white' : 'text-white/70'}`}>
                      Week {record.week_number}, {record.year}
                    </div>
                    <div className="mt-2 text-[11px] text-white/42">
                      {formatLongDate(record.created_at)}
                    </div>
                  </div>

                  <div>
                    <p className={`text-[13px] leading-relaxed ${isAccessible ? 'text-white/90' : 'text-white/60'}`}>
                      {leadSignal}
                    </p>
                  </div>

                  <div className="space-y-2 lg:text-right">
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/36 lg:justify-end">
                      <span>{record.insights?.length ?? 0} signals</span>
                      <span>{record.posts?.length ?? 0} drafts</span>
                      {signalStrength && isAccessible && <span>{signalStrength}</span>}
                    </div>
                    <div className={`text-[12px] ${isAccessible ? 'text-white/50' : 'text-white/30'}`}>
                      {dominantPath ?? getCycleOutputSummary(record.hooks, record.posts)}
                    </div>
                    {!isAccessible ? (
                      <Link href="/settings" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 hover:text-white transition-colors lg:justify-end w-full">
                        <Lock className="h-3 w-3" />
                        <span>Continuity Layer</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-white/45 lg:justify-end">
                        <span>Expand memory</span>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <div key={record.id} className="relative">
                  {/* Node */}
                  <div className={`absolute -left-[29px] md:-left-[25px] top-7 h-4 w-4 rounded-full border bg-background-base flex items-center justify-center z-10 ${isDrift ? 'border-red-500/50' : index === 0 ? 'border-accent/40' : 'border-white/10'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isDrift ? 'bg-red-500 animate-pulse' : index === 0 ? 'bg-accent' : 'bg-white/20'}`} />
                  </div>
                  
                  <details
                    open={index === 0}
                    className={`str-elevated group rounded-sm border ${isDrift ? 'border-red-500/30 bg-red-500/5' : 'border-border-subtle bg-background-panel'}`}
                  >
                    <summary className="list-none cursor-pointer px-5 py-5 hover:bg-white/[0.02] transition-colors rounded-sm">
                      {summaryContent}
                    </summary>

                  <div className="border-t border-white/10 px-5 py-6 bg-background-base/80">
                    <div className={`mb-8 overflow-hidden rounded-sm border ${!isAccessible ? 'border-white/5 bg-white/[0.02]' : isDrift ? 'border-red-500/20 bg-red-500/5' : 'border-accent/10 bg-accent/5'}`}>
                      <div className={`px-4 py-2 border-b text-[10px] font-bold uppercase tracking-[0.22em] ${!isAccessible ? 'border-white/5 text-white/30' : isDrift ? 'border-red-500/20 text-red-400' : 'border-accent/10 text-accent'}`}>
                        Run Manifest — Provenance Layer
                      </div>
                      <div className={!isAccessible ? "px-5 py-4" : "p-1"}>
                        {!isAccessible ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-white/30 italic">[ Provenance data protected in memory ]</span>
                            <Link href="/settings" className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50 hover:text-emerald-400 transition-colors">
                              Access full continuity →
                            </Link>
                          </div>
                        ) : (
                          <RunManifest
                            researchSummary={record.research_summary as ResearchProvenance}
                            learningSummary={record.learning_summary as LearningSummary}
                            runLogicSummary={record.run_logic_summary}
                            userPlan={plan}
                            weekNumber={record.week_number}
                            year={record.year}
                            manifestMode="compact"
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
                      {/* 1. Signal Summary */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                          1. Signal Detected
                        </div>
                        <p className={`text-[13px] leading-relaxed ${!isAccessible ? 'text-white/20 italic select-none' : 'text-white/90'}`}>
                          {!isAccessible ? '[ Details sealed in Operating Layer ]' : leadSignal}
                        </p>
                      </div>

                      <div className="col-span-full border-t border-white/5 pt-5 pb-1 flex flex-col gap-4">
                        <div>
                          <span className="block mb-1 text-[10px] tracking-[0.12em] uppercase text-white/50 font-medium not-italic">System shift:</span>
                          <span className="text-sm text-white/60 not-italic">{systemShift}</span>
                        </div>
                        <div>
                          <span className="block mb-1 text-[10px] tracking-[0.12em] uppercase text-white/50 font-medium not-italic">Because:</span>
                          <span className="text-sm text-white/60 not-italic">{systemBecause}</span>
                        </div>
                      </div>

                      {/* 2. Selected Path */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                          2. Selected Path
                        </div>
                        <div className="space-y-2">
                          <p className={`text-[13px] leading-relaxed ${!isAccessible ? 'text-white/20 italic select-none' : 'text-white/90'}`}>
                            {!isAccessible ? (
                              '[ Strategy path protected in memory ]'
                            ) : (
                              <>
                                <span className="font-medium text-white">{dominantPath ? `Format baseline: ${dominantPath}.` : 'Format baseline: Multi-path distribution.'}</span>
                                {' '}
                                <span className="text-white/60">{implication}</span>
                              </>
                            )}
                          </p>
                          {crossCycleNote && !isAccessible ? null : crossCycleNote && (
                            <p className="text-[12px] leading-relaxed text-white/40 italic">
                              {crossCycleNote}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3. Learned */}
                      <div className="space-y-3 border-t border-white/5 pt-5 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] ${!isAccessible ? 'text-white/20' : 'text-emerald-500/80'}`}>
                          3. Learned
                        </div>
                        <p className={`text-[13px] leading-relaxed ${!isAccessible ? 'text-white/20 italic select-none' : 'text-emerald-100/90'}`}>
                          {!isAccessible ? (
                             '[ Learning pattern sealed ]'
                          ) : (
                            <>
                              {cycleLearning.learned}
                              {' '}
                              {cycleLearning.reinforced !== 'None. Building memory footprint.' && (
                                <span className="text-emerald-400 font-medium">
                                  {cycleLearning.reinforced}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>

                      {/* 4. Next Impact */}
                      <div className="space-y-3 lg:border-l lg:border-white/5 lg:pl-8">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] ${!isAccessible ? 'text-white/20' : 'text-emerald-500/80'}`}>
                          4. Next Impact
                        </div>
                        <p className={`text-[13px] leading-relaxed ${!isAccessible ? 'text-white/20 italic select-none' : 'text-emerald-100/60'}`}>
                          {!isAccessible ? '[ Execution bias sealed ]' : cycleLearning.nextImpact}
                        </p>
                      </div>
                    </div>
                    {operatorNote && isAccessible && (
                      <div className="mt-8 border-t border-white/5 pt-5 text-[13px] text-white/80">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
                          Operator Note
                        </div>
                        <p className="italic pl-3 border-l border-white/10 text-emerald-400/80">
                          &quot;{operatorNote}&quot;
                        </p>
                      </div>
                    )}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/5 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>{record.insights?.length ?? 0} signals processed</span>
                        <span>{cycleFeedback ? `${cycleFeedback.count} recorded feedback marks` : 'No feedback loop established'}</span>
                      </div>
                      <div className="text-emerald-500/60 hidden sm:block">
                        This baseline feeds the next run
                      </div>
                    </div>
                  </div>
                </details>
              </div>
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
      </section>
    </div>
  );
}
