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
    value === 'data-driven'
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
    return 'Beklenmeyen bir hata olustu (Unstringifiable error).';
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
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!isRecord(item)) return false;
    const insightStr = getCaseInsensitiveValue(item, ['insight']);
    const whyStr = getCaseInsensitiveValue(item, ['why']);
    const triggerStr = getCaseInsensitiveValue(item, ['trigger']);
    const formatHint = getCaseInsensitiveValue(item, ['format_hint', 'formatHint']);
    
    // Auto-normalize the item so TypeScript casts work flawlessly upstream
    if (isString(insightStr)) item.insight = insightStr;
    if (isString(whyStr)) item.why = whyStr;
    if (isString(triggerStr)) item.trigger = triggerStr;
    if (isString(formatHint) && isFormatHint(formatHint)) item.format_hint = formatHint;

    return (
      isString(insightStr) &&
      isString(whyStr) &&
      isString(triggerStr) &&
      (formatHint === undefined || (isString(formatHint) && isFormatHint(formatHint)))
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
    isString(value.history_id) &&
    typeof value.week_number === 'number' &&
    typeof value.year === 'number' &&
    isInsightItemArray(value.insights) &&
    isWeeklyContent(value)
  );
}
