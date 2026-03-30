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

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Beklenmeyen bir hata olustu.';
}

export function getApiError(value: unknown): string | null {
  if (!isRecord(value) || !isString(value.error)) {
    return null;
  }

  return value.error;
}

export function isInsightItemArray(value: unknown): value is InsightItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        isString(item.insight) &&
        isString(item.why) &&
        isString(item.trigger)
    )
  );
}

function isIdeaItemArray(value: unknown): value is IdeaItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => isRecord(item) && isString(item.idea) && isString(item.type)
    )
  );
}

function isPostItemArray(value: unknown): value is PostItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        isString(item.content) &&
        isString(item.type) &&
        isString(item.explanation)
    )
  );
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
  return (
    isRecord(value) &&
    isString(value.history_id) &&
    typeof value.week_number === 'number' &&
    typeof value.year === 'number' &&
    isInsightItemArray(value.insights) &&
    isWeeklyContent(value)
  );
}
