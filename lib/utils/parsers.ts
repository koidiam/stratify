import {
  IdeaItem,
  InsightItem,
  PostItem,
  WeeklyContent,
  WeeklyGeneration,
} from '@/types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isFormatHint(value: unknown): value is InsightItem['format_hint'] {
  return (
    value === 'list' ||
    value === 'story' ||
    value === 'hook-question' ||
    value === 'contrarian' ||
    value === 'data-driven' ||
    value === 'other'
  );
}

function isSignalStrength(value: unknown): value is InsightItem['signal_strength'] {
  return value === 'weak' || value === 'moderate' || value === 'strong';
}

function isLearningStatus(value: unknown): boolean {
  return value === 'none' || value === 'early' || value === 'directional';
}

function isLearningComparisonBasis(value: unknown): boolean {
  return value === 'engagement-rate' || value === 'engagement-score' || value === 'insufficient';
}

function isResearchSourceMode(value: unknown): boolean {
  return value === 'live' || value === 'cached' || value === 'none';
}

function isMarketInputStatus(value: unknown): boolean {
  return (
    value === 'trend-and-reference' ||
    value === 'trend-only' ||
    value === 'reference-only' ||
    value === 'profile-only'
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  // Prevent generic masking by dumping the object.
  try {
    return typeof error === 'object' ? JSON.stringify(error) : String(error);
  } catch {
    return 'Unexpected error occurred (Unstringifiable error).';
  }
}

export function getApiError(value: unknown): string | null {
  if (!isRecord(value) || !isString(value.error)) {
    return null;
  }

  return value.error;
}

function getCaseInsensitiveValue(record: UnknownRecord, keyPaths: string[]): unknown {
  const keys = Object.keys(record);
  for (const target of keyPaths) {
    const found = keys.find((k) => k.toLowerCase() === target.toLowerCase());
    if (found !== undefined) return record[found];
  }
  return undefined;
}

export function isInsightItemArray(value: unknown): value is InsightItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    console.error('[isInsightItemArray] Expected non-empty array. Raw value:', value);
    return false;
  }

  return value.every((item) => {
    if (!isRecord(item)) return false;
    const insightStr = getCaseInsensitiveValue(item, ['insight']);
    const whyStr = getCaseInsensitiveValue(item, ['why']);
    const triggerStr = getCaseInsensitiveValue(item, ['trigger']);
    const formatHint = getCaseInsensitiveValue(item, ['format_hint', 'formatHint']);
    const pattern = getCaseInsensitiveValue(item, ['pattern']);
    const implication = getCaseInsensitiveValue(item, ['implication', 'interpretation']);
    const recommendedMove = getCaseInsensitiveValue(item, ['recommended_move', 'recommendedMove', 'decision']);
    const risk = getCaseInsensitiveValue(item, ['risk', 'strategic_risk', 'strategicRisk']);
    const basis = getCaseInsensitiveValue(item, ['basis']);
    const signalStrength = getCaseInsensitiveValue(item, ['signal_strength', 'signalStrength']);
    
    // Auto-normalize the item so TypeScript casts work flawlessly upstream
    if (isString(insightStr)) item.insight = insightStr;
    if (isString(whyStr)) item.why = whyStr;
    if (isString(triggerStr)) item.trigger = triggerStr;
    if (isString(formatHint) && isFormatHint(formatHint)) item.format_hint = formatHint;
    if (isString(pattern)) item.pattern = pattern;
    if (isString(implication)) item.implication = implication;
    if (isString(recommendedMove)) item.recommended_move = recommendedMove;
    if (isString(risk)) item.risk = risk;
    if (isStringArray(basis)) item.basis = basis;
    if (isString(signalStrength) && isSignalStrength(signalStrength)) item.signal_strength = signalStrength;

    return (
      isString(insightStr) &&
      isString(whyStr) &&
      isString(triggerStr) &&
      (formatHint === undefined || (isString(formatHint) && isFormatHint(formatHint))) &&
      (pattern === undefined || isString(pattern)) &&
      (implication === undefined || isString(implication)) &&
      (recommendedMove === undefined || isString(recommendedMove)) &&
      (risk === undefined || isString(risk)) &&
      (basis === undefined || isStringArray(basis)) &&
      (signalStrength === undefined || (isString(signalStrength) && isSignalStrength(signalStrength)))
    );
  });
}

function isIdeaItemArray(value: unknown): value is IdeaItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!isRecord(item)) return false;
    const ideaStr = getCaseInsensitiveValue(item, ['idea']);
    const typeStr = getCaseInsensitiveValue(item, ['type']);
    if (isString(ideaStr)) item.idea = ideaStr;
    if (isString(typeStr)) item.type = typeStr;
    return isString(ideaStr) && isString(typeStr);
  });
}

function isPostItemArray(value: unknown): value is PostItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!isRecord(item)) return false;
    const contentStr = getCaseInsensitiveValue(item, ['content', 'post', 'text']);
    const typeStr = getCaseInsensitiveValue(item, ['type']);
    const expStr = getCaseInsensitiveValue(item, ['explanation', 'why']);
    
    if (isString(contentStr)) item.content = contentStr;
    if (isString(typeStr)) item.type = typeStr;
    if (isString(expStr)) item.explanation = expStr;
    
    return isString(contentStr) && isString(typeStr) && isString(expStr);
  });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isResearchProvenance(value: unknown): boolean {
  return (
    isRecord(value) &&
    isResearchSourceMode(value.sourceMode) &&
    isMarketInputStatus(value.marketInputStatus) &&
    typeof value.analyzedPostCount === 'number' &&
    typeof value.retainedPostCount === 'number' &&
    typeof value.filteredPostCount === 'number' &&
    isString(value.trendQuery) &&
    isResearchSourceMode(value.trendSourceType) &&
    typeof value.trendPostCount === 'number' &&
    isResearchSourceMode(value.referenceSourceType) &&
    typeof value.referencePostCount === 'number' &&
    typeof value.referenceInputCount === 'number' &&
    typeof value.lowSignalFilterApplied === 'boolean' &&
    typeof value.lowSignalPostsFiltered === 'number' &&
    typeof value.jobPostFilterApplied === 'boolean' &&
    typeof value.jobPostsExcluded === 'number'
  );
}

function isLearningSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    isLearningStatus(value.status) &&
    (value.driftStatus === 'none' || value.driftStatus === 'emerging' || value.driftStatus === 'repeating') &&
    isLearningComparisonBasis(value.comparisonBasis) &&
    typeof value.feedbackEntryCount === 'number' &&
    typeof value.annotatedCycleCount === 'number' &&
    (value.lastFeedbackAt === null || isString(value.lastFeedbackAt)) &&
    (value.strongestType === null || isString(value.strongestType)) &&
    (value.weakestType === null || isString(value.weakestType)) &&
    (value.bestPerformanceNote === null || isString(value.bestPerformanceNote)) &&
    (value.cautionNote === null || isString(value.cautionNote)) &&
    (value.latestOperatorNote === null || isString(value.latestOperatorNote)) &&
    (value.driftNote === null || isString(value.driftNote)) &&
    isStringArray(value.adjustmentContext)
  );
}

export function isWeeklyContent(value: unknown): value is WeeklyContent {
  return (
    isRecord(value) &&
    isIdeaItemArray(value.ideas) &&
    isStringArray(value.hooks) &&
    isPostItemArray(value.posts)
  );
}

export function isWeeklyGeneration(value: unknown): value is WeeklyGeneration {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.researchUsed === 'number') {
    value.researchUsed = value.researchUsed > 0;
  }

  if (typeof value.trendPostCount === 'string') {
    const parsed = Number(value.trendPostCount);
    if (Number.isFinite(parsed)) {
      value.trendPostCount = parsed;
    }
  }

  return (
    (value.researchUsed === undefined || typeof value.researchUsed === 'boolean') &&
    (value.trendPostCount === undefined || typeof value.trendPostCount === 'number') &&
    (value.researchSummary === undefined || isResearchProvenance(value.researchSummary)) &&
    (value.learningSummary === undefined || isLearningSummary(value.learningSummary)) &&
    isString(value.history_id) &&
    typeof value.week_number === 'number' &&
    typeof value.year === 'number' &&
    isInsightItemArray(value.insights) &&
    isWeeklyContent(value)
  );
}
