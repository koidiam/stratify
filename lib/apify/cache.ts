import { SupabaseClient } from '@supabase/supabase-js';

import { APIFY_RULES } from './constants';
import { runApifyActor } from './client';

interface CacheEntry<T> {
  results: T[];
  expiresAt: string | null;
}

interface CachedScrapeOptions {
  cacheKey: string;
  actorId: string;
  input: Record<string, unknown>;
  ttlDays: number;
  userId: string;
  supabase: SupabaseClient;
  maxItems?: number;
  allowScrape?: boolean;
}

function getMonthStartIso(): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

async function getCacheEntry<T>(
  cacheKey: string,
  supabase: SupabaseClient
): Promise<CacheEntry<T> | null> {
  try {
    const { data, error } = await supabase
      .from('scrape_cache')
      .select('results, expires_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (error || !data || !Array.isArray(data.results)) {
      return null;
    }

    return {
      results: data.results as T[],
      expiresAt: typeof data.expires_at === 'string' ? data.expires_at : null,
    };
  } catch {
    return null;
  }
}

async function getMonthlyScrapeCount(
  userId: string,
  supabase: SupabaseClient
): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from('apify_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('triggered_at', getMonthStartIso());

    if (error) {
      return null;
    }

    return count ?? 0;
  } catch {
    return null;
  }
}

async function persistCache<T>(
  cacheKey: string,
  actorId: string,
  ttlDays: number,
  results: T[],
  supabase: SupabaseClient
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + ttlDays);

  try {
    await supabase.from('scrape_cache').upsert({
      cache_key: cacheKey,
      actor_id: actorId,
      results,
      expires_at: expiresAt.toISOString(),
    });
  } catch {
    // Cache is optional. We keep the primary flow alive if the table is not ready yet.
  }
}

async function recordUsage(
  userId: string,
  actorId: string,
  resultsCount: number,
  supabase: SupabaseClient
): Promise<void> {
  try {
    await supabase.from('apify_usage').insert({
      user_id: userId,
      actor_id: actorId,
      items_count: resultsCount,
      cost_usd: null,
    });
  } catch {
    // Usage telemetry should not block generation if the table is not ready yet.
  }
}

export async function getCachedOrScrape<T>({
  cacheKey,
  actorId,
  input,
  ttlDays,
  userId,
  supabase,
  maxItems,
  allowScrape = true,
}: CachedScrapeOptions): Promise<T[]> {
  const cacheEntry = await getCacheEntry<T>(cacheKey, supabase);
  const nowIso = new Date().toISOString();

  if (cacheEntry?.expiresAt && cacheEntry.expiresAt > nowIso) {
    return cacheEntry.results;
  }

  // If scrape is explicitly disabled for this plan/call, return stale cache or empty
  if (!allowScrape) {
    return cacheEntry?.results ?? [];
  }

  const monthlyScrapeCount = await getMonthlyScrapeCount(userId, supabase);

  if (monthlyScrapeCount === null) {
    return cacheEntry?.results ?? [];
  }

  if (
    monthlyScrapeCount >= APIFY_RULES.maxMonthlyScrapesPerUser
  ) {
    return cacheEntry?.results ?? [];
  }

  try {
    const results = await runApifyActor<T>(actorId, input, { maxItems });
    await persistCache(cacheKey, actorId, ttlDays, results, supabase);
    await recordUsage(userId, actorId, results.length, supabase);
    return results;
  } catch (error) {
    console.warn(`[Apify Fallback] actor ${actorId} failed or timed out:`, error);
    return cacheEntry?.results ?? [];
  }
}
