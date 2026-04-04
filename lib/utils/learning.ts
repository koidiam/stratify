import {
  LearningComparisonBasis,
  LearningSummary,
} from '@/types';

import {
  StoredCycleRecord,
  getCycleLeadSignal,
  getDominantPostTypeKey,
} from './history';

export interface StoredFeedbackRecord {
  history_id: string;
  post_index: number;
  views: number | null;
  likes: number | null;
  comments: number | null;
  reposts: number | null;
  notes: string | null;
  created_at: string;
}

export interface CycleLearningSnapshot {
  summary: string;
  progressionNote: string | null;
  latestNote: string | null;
}

interface EnrichedFeedbackEntry {
  historyId: string;
  postIndex: number;
  createdAt: string;
  notes: string | null;
  postType: string | null;
  cycleLabel: string;
  performanceRate: number | null;
  performanceScore: number;
}

function safeMetric(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function formatPathTypeLabel(type: string | null | undefined): string {
  if (!hasText(type)) {
    return 'stored';
  }

  if (type === 'How-to') return 'How-To';
  if (type === 'Soft Sell') return 'Offer';

  return type;
}

function getPerformanceScore(row: StoredFeedbackRecord): number {
  return safeMetric(row.likes) + safeMetric(row.comments) * 2 + safeMetric(row.reposts) * 3;
}

function getPerformanceRate(row: StoredFeedbackRecord): number | null {
  const views = safeMetric(row.views);

  if (views === 0) {
    return null;
  }

  return getPerformanceScore(row) / views;
}

function enrichFeedbackRows(
  historyRecords: StoredCycleRecord[],
  feedbackRecords: StoredFeedbackRecord[]
): EnrichedFeedbackEntry[] {
  const historyById = new Map(historyRecords.map((record) => [record.id, record]));

  return feedbackRecords.map((row) => {
    const cycle = historyById.get(row.history_id);
    const post = cycle?.posts?.[row.post_index];

    return {
      historyId: row.history_id,
      postIndex: row.post_index,
      createdAt: row.created_at,
      notes: hasText(row.notes) ? row.notes.trim() : null,
      postType: hasText(post?.type) ? post.type : null,
      cycleLabel:
        cycle && typeof cycle.week_number === 'number' && typeof cycle.year === 'number'
          ? `Week ${cycle.week_number}, ${cycle.year}`
          : 'Unknown cycle',
      performanceRate: getPerformanceRate(row),
      performanceScore: getPerformanceScore(row),
    };
  });
}

function getComparisonBasis(
  entries: EnrichedFeedbackEntry[]
): {
  basis: LearningComparisonBasis;
  comparableEntries: EnrichedFeedbackEntry[];
} {
  const rateComparable = entries.filter(
    (entry) => typeof entry.performanceRate === 'number' && Number.isFinite(entry.performanceRate)
  );

  if (rateComparable.length >= 2) {
    return {
      basis: 'engagement-rate',
      comparableEntries: rateComparable,
    };
  }

  const scoreComparable = entries.filter((entry) => entry.performanceScore > 0);

  if (scoreComparable.length >= 2) {
    return {
      basis: 'engagement-score',
      comparableEntries: scoreComparable,
    };
  }

  return {
    basis: 'insufficient',
    comparableEntries: [],
  };
}

function getComparableValue(
  entry: EnrichedFeedbackEntry,
  basis: LearningComparisonBasis
): number | null {
  if (basis === 'engagement-rate') {
    return entry.performanceRate;
  }

  if (basis === 'engagement-score') {
    return entry.performanceScore;
  }

  return null;
}

function getBasisLabel(basis: LearningComparisonBasis): string {
  if (basis === 'engagement-rate') {
    return 'logged engagement rate';
  }

  if (basis === 'engagement-score') {
    return 'logged engagement score';
  }

  return 'insufficient comparison data';
}

function summarizeByPathType(
  entries: EnrichedFeedbackEntry[],
  basis: LearningComparisonBasis
): Array<{ postType: string; count: number; average: number }> {
  const grouped = entries.reduce<Record<string, { total: number; count: number }>>((acc, entry) => {
    if (!hasText(entry.postType)) {
      return acc;
    }

    const value = getComparableValue(entry, basis);

    if (value === null || !Number.isFinite(value)) {
      return acc;
    }

    const key = entry.postType;
    const current = acc[key] ?? { total: 0, count: 0 };

    acc[key] = {
      total: current.total + value,
      count: current.count + 1,
    };

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([postType, stats]) => ({
      postType,
      count: stats.count,
      average: stats.count > 0 ? stats.total / stats.count : 0,
    }))
    .sort((left, right) => right.average - left.average || right.count - left.count);
}

function getLatestOperatorNote(entries: EnrichedFeedbackEntry[]): string | null {
  const noteEntry = entries.find((entry) => hasText(entry.notes));

  if (!noteEntry?.notes) {
    return null;
  }

  return noteEntry.notes.length > 180
    ? `${noteEntry.notes.slice(0, 180).trimEnd()}...`
    : noteEntry.notes;
}

function getDriftState(historyRecords: StoredCycleRecord[]): {
  driftStatus: LearningSummary['driftStatus'];
  driftNote: string | null;
} {
  const recentBiases = historyRecords
    .slice(0, 3)
    .map((record) => getDominantPostTypeKey(record.posts))
    .filter((value): value is string => hasText(value));

  if (recentBiases.length < 2) {
    return {
      driftStatus: 'none',
      driftNote: null,
    };
  }

  const counts = recentBiases.reduce<Record<string, number>>((acc, bias) => {
    acc[bias] = (acc[bias] ?? 0) + 1;
    return acc;
  }, {});

  const [dominantBias, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];

  if (!dominantBias || !count || count < 2) {
    return {
      driftStatus: 'none',
      driftNote: null,
    };
  }

  if (count >= 3 || (recentBiases.length === 2 && count === 2)) {
    return {
      driftStatus: 'repeating',
      driftNote: `Recent retained cycles keep returning to ${formatPathTypeLabel(dominantBias)} paths. Strategy may be converging around the same execution mode.`,
    };
  }

  return {
    driftStatus: 'emerging',
    driftNote: `Two of the last three retained cycles leaned toward ${formatPathTypeLabel(dominantBias)} paths. The system should keep variation in view instead of narrowing too early.`,
  };
}

function getTopAndBottomSignals(
  entries: EnrichedFeedbackEntry[]
): {
  basis: LearningComparisonBasis;
  strongestType: string | null;
  weakestType: string | null;
  bestPerformanceNote: string | null;
  cautionNote: string | null;
} {
  const { basis, comparableEntries } = getComparisonBasis(entries);

  if (basis === 'insufficient') {
    return {
      basis,
      strongestType: null,
      weakestType: null,
      bestPerformanceNote: null,
      cautionNote: null,
    };
  }

  const rankedTypes = summarizeByPathType(comparableEntries, basis);
  const strongestType = rankedTypes[0]?.postType ?? null;
  const weakestType =
    rankedTypes.length > 1 ? rankedTypes[rankedTypes.length - 1]?.postType ?? null : null;

  if (!strongestType) {
    return {
      basis,
      strongestType: null,
      weakestType: null,
      bestPerformanceNote: null,
      cautionNote: null,
    };
  }

  const bestPerformanceNote =
    weakestType && weakestType !== strongestType
      ? `Recent logged feedback is relatively stronger on ${formatPathTypeLabel(strongestType)} paths than ${formatPathTypeLabel(weakestType)} paths when compared by ${getBasisLabel(basis)}.`
      : `Recent logged feedback is clustering around ${formatPathTypeLabel(strongestType)} paths when compared by ${getBasisLabel(basis)}.`;

  const cautionNote =
    weakestType && weakestType !== strongestType
      ? `Response is softer on ${formatPathTypeLabel(weakestType)} paths in the recent feedback set.`
      : null;

  return {
    basis,
    strongestType,
    weakestType,
    bestPerformanceNote,
    cautionNote,
  };
}

export function buildLearningSummary(
  historyRecords: StoredCycleRecord[],
  feedbackRecords: StoredFeedbackRecord[]
): LearningSummary {
  const orderedFeedback = [...feedbackRecords].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
  const enrichedFeedback = enrichFeedbackRows(historyRecords, orderedFeedback);
  const feedbackEntryCount = enrichedFeedback.length;
  const annotatedCycleCount = new Set(enrichedFeedback.map((entry) => entry.historyId)).size;
  const latestOperatorNote = getLatestOperatorNote(enrichedFeedback);
  const { driftStatus, driftNote } = getDriftState(historyRecords);
  const {
    basis,
    strongestType,
    weakestType,
    bestPerformanceNote,
    cautionNote,
  } = getTopAndBottomSignals(enrichedFeedback);

  const status: LearningSummary['status'] =
    feedbackEntryCount === 0
      ? 'none'
      : bestPerformanceNote || cautionNote
        ? 'directional'
        : 'early';

  const adjustmentContext: string[] = [];

  if (status === 'directional' && strongestType) {
    adjustmentContext.push(
      `Recent logged response is leaning toward ${formatPathTypeLabel(strongestType)} paths.`
    );
  }

  if (status === 'directional' && weakestType && weakestType !== strongestType) {
    adjustmentContext.push(
      `Recent logged response is softer on ${formatPathTypeLabel(weakestType)} paths, so the next pass should avoid leaning on that structure without a tighter variation.`
    );
  }

  if (status === 'early' && feedbackEntryCount > 0) {
    adjustmentContext.push(
      'Performance feedback is attached, but the learning layer is still early and should be treated as directional rather than decisive.'
    );
  }

  if (driftNote) {
    adjustmentContext.push(driftNote);
  }

  if (latestOperatorNote) {
    adjustmentContext.push(`Latest operator note: ${latestOperatorNote}`);
  }

  return {
    status,
    driftStatus,
    comparisonBasis: basis,
    feedbackEntryCount,
    annotatedCycleCount,
    lastFeedbackAt: orderedFeedback[0]?.created_at ?? null,
    strongestType,
    weakestType,
    bestPerformanceNote,
    cautionNote,
    latestOperatorNote,
    driftNote,
    adjustmentContext: adjustmentContext.slice(0, 3),
  };
}

export function buildLearningPromptContext(
  historyRecords: StoredCycleRecord[],
  feedbackRecords: StoredFeedbackRecord[]
): {
  learningSummary: LearningSummary;
  promptContext: string | null;
} {
  const learningSummary = buildLearningSummary(historyRecords, feedbackRecords);

  if (
    learningSummary.status === 'none' &&
    !learningSummary.driftNote &&
    !learningSummary.latestOperatorNote
  ) {
    return {
      learningSummary,
      promptContext: null,
    };
  }

  const enrichedFeedback = enrichFeedbackRows(historyRecords, feedbackRecords)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3);

  const lines = [
    `Feedback status: ${learningSummary.status}`,
  ];

  if (learningSummary.bestPerformanceNote) {
    lines.push(`Stronger response signal: ${learningSummary.bestPerformanceNote}`);
  }

  if (learningSummary.cautionNote) {
    lines.push(`Softer response signal: ${learningSummary.cautionNote}`);
  }

  if (learningSummary.driftNote) {
    lines.push(`Drift note: ${learningSummary.driftNote}`);
  }

  if (learningSummary.latestOperatorNote) {
    lines.push(`Latest operator note: ${learningSummary.latestOperatorNote}`);
  }

  if (enrichedFeedback.length > 0) {
    lines.push('Recent logged results:');
    lines.push(
      ...enrichedFeedback.map((entry, index) => {
        const basisLabel =
          typeof entry.performanceRate === 'number'
            ? `${(entry.performanceRate * 100).toFixed(2)}% engagement rate`
            : `${entry.performanceScore} engagement score`;
        const note = entry.notes ? `, note="${entry.notes}"` : '';

        return `${index + 1}. ${entry.cycleLabel} · ${formatPathTypeLabel(entry.postType)} path · ${basisLabel}${note}`;
      })
    );
  }

  return {
    learningSummary,
    promptContext: lines.join('\n'),
  };
}

export function getCycleLearningSnapshot(
  record: StoredCycleRecord,
  feedbackRecords: StoredFeedbackRecord[],
  nextCycle: StoredCycleRecord | null
): CycleLearningSnapshot {
  const cycleFeedback = feedbackRecords.filter((item) => item.history_id === record.id);

  if (cycleFeedback.length === 0) {
    return {
      summary: 'No measured outcome log is attached to this cycle yet.',
      progressionNote: nextCycle
        ? `The following retained cycle opened with ${getCycleLeadSignal(nextCycle.insights)}`
        : null,
      latestNote: null,
    };
  }

  const cycleSummary = buildLearningSummary([record], cycleFeedback);
  const dominantNextType = nextCycle ? getDominantPostTypeKey(nextCycle.posts) : null;
  const referenceType = cycleSummary.strongestType ?? getDominantPostTypeKey(record.posts);

  let progressionNote: string | null = null;

  if (nextCycle && dominantNextType) {
    progressionNote =
      referenceType && dominantNextType === referenceType
        ? `The following retained cycle kept ${formatPathTypeLabel(dominantNextType)} as the dominant output bias.`
        : `The following retained cycle shifted dominant output bias to ${formatPathTypeLabel(dominantNextType)}.`;
  }

  return {
    summary:
      cycleSummary.bestPerformanceNote ??
      cycleSummary.cautionNote ??
      'Outcome logs are attached to this cycle, but not enough comparable path data exists to rank the response yet.',
    progressionNote,
    latestNote: cycleSummary.latestOperatorNote,
  };
}
