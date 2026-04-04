import { InsightItem, PostItem, SignalStrength } from '@/types';

export interface StoredCycleRecord {
  id: string;
  week_number: number;
  year: number;
  created_at: string;
  insights: InsightItem[] | null;
  hooks: string[] | null;
  posts: PostItem[] | null;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getLeadInsight(insights: InsightItem[] | null | undefined): InsightItem | null {
  if (!Array.isArray(insights) || insights.length === 0) {
    return null;
  }

  return insights.find((item) =>
    hasText(item.pattern) ||
    hasText(item.insight) ||
    hasText(item.implication) ||
    hasText(item.recommended_move)
  ) ?? insights[0] ?? null;
}

export function getCycleLeadSignal(insights: InsightItem[] | null | undefined): string {
  const leadInsight = getLeadInsight(insights);

  if (hasText(leadInsight?.pattern)) {
    return leadInsight.pattern;
  }

  if (hasText(leadInsight?.insight)) {
    return leadInsight.insight;
  }

  return 'No retained signal summary is attached to this cycle yet.';
}

export function getCycleImplication(insights: InsightItem[] | null | undefined): string {
  const leadInsight = getLeadInsight(insights);

  if (hasText(leadInsight?.implication)) {
    return leadInsight.implication;
  }

  if (hasText(leadInsight?.recommended_move)) {
    return leadInsight.recommended_move;
  }

  if (hasText(leadInsight?.why)) {
    return leadInsight.why;
  }

  return 'Review this cycle to recover the stored strategic direction.';
}

export function getCycleRisk(insights: InsightItem[] | null | undefined): string | null {
  const leadInsight = getLeadInsight(insights);

  if (hasText(leadInsight?.risk)) {
    return leadInsight.risk;
  }

  return null;
}

export function getCycleSignalStrength(
  insights: InsightItem[] | null | undefined
): SignalStrength | null {
  if (!Array.isArray(insights)) {
    return null;
  }

  return insights.find((item) => item.signal_strength)?.signal_strength ?? null;
}

export function getDominantPostTypeKey(
  posts: PostItem[] | null | undefined
): string | null {
  if (!Array.isArray(posts) || posts.length === 0) {
    return null;
  }

  const counts = posts.reduce<Record<string, number>>((acc, post) => {
    const type = typeof post.type === 'string' && post.type.trim().length > 0
      ? post.type
      : 'Unknown';

    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});

  const rankedTypes = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [winner, winnerCount] = rankedTypes[0] ?? [];
  const [, runnerUpCount = 0] = rankedTypes[1] ?? [];

  if (!winner) {
    return null;
  }

  if (winnerCount === runnerUpCount) {
    return null;
  }

  return winner;
}

export function getDominantPostType(posts: PostItem[] | null | undefined): string | null {
  const dominantType = getDominantPostTypeKey(posts);

  if (dominantType) {
    return `${dominantType} path dominant`;
  }

  if (Array.isArray(posts) && posts.length > 0) {
    return 'Mixed output set';
  }

  return null;
}

export function getCycleOutputSummary(
  hooks: string[] | null | undefined,
  posts: PostItem[] | null | undefined
): string {
  const hookCount = Array.isArray(hooks) ? hooks.length : 0;
  const postCount = Array.isArray(posts) ? posts.length : 0;

  if (hookCount === 0 && postCount === 0) {
    return 'No retained hooks or drafts are attached to this cycle.';
  }

  return `${hookCount} ${hookCount === 1 ? 'hook' : 'hooks'} retained • ${postCount} ${postCount === 1 ? 'draft' : 'drafts'} retained`;
}

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
