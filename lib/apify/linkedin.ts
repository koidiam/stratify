import { SupabaseClient } from '@supabase/supabase-js';

import { LinkedInPostSignal, LinkedInResearchContext, OnboardingData } from '@/types';

import { getCachedOrScrape } from './cache';
import { APIFY_ACTORS, APIFY_RULES } from './constants';

type ApifyRecord = Record<string, unknown>;
type PostFormat =
  | 'list'
  | 'story'
  | 'hook-question'
  | 'contrarian'
  | 'data-driven'
  | 'other';

function getString(record: ApifyRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getNumber(record: ApifyRecord, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function getNestedRecord(record: ApifyRecord, key: string): ApifyRecord | null {
  const value = record[key];
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as ApifyRecord;
  }

  return null;
}

function buildTrendSearchUrl(query: string): string {
  return `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(query)}`;
}

const NICHE_ALIASES: Record<string, string> = {
  'b2b saas': 'B2B SaaS',
  saas: 'SaaS',
  'saas founder': 'SaaS founder',
  developer: 'software developer',
  dev: 'software developer',
  freelancer: 'freelance professional',
  consultant: 'business consultant',
  creator: 'content creator',
};

function normalizeNiche(raw: string): string {
  const lower = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');

  return NICHE_ALIASES[lower] ?? lower;
}

function buildTrendQuery(data: OnboardingData): string {
  const niche = normalizeNiche(data.niche);
  return `${niche} linkedin`;
}

function getTrendCacheKey(query: string): string {
  return `niche-trend:${query.toLowerCase().replace(/\s+/g, '-')}`;
}

function filterByEngagement(posts: LinkedInPostSignal[]): LinkedInPostSignal[] {
  if (posts.length < 4) {
    return posts;
  }

  const scores = posts.map((post) => post.engagementScore).sort((a, b) => a - b);
  const p25 = scores[Math.floor(scores.length * 0.25)];

  return posts.filter((post) => post.engagementScore >= p25);
}

function detectPostFormat(content: string): PostFormat {
  const lower = content.toLowerCase();
  const lines = content.split('\n').filter((line) => line.trim());

  if (lines.filter((line) => /^[\d•\-\*]/.test(line.trim())).length >= 3) {
    return 'list';
  }

  if (/^\d+[\s\S]{0,20}(years?|months?|ago|back)/i.test(content)) {
    return 'story';
  }

  if (/^(what if|why do|how do|did you|have you)/i.test(content)) {
    return 'hook-question';
  }

  if (/(wrong|myth|stop|nobody|unpopular)/i.test(lower)) {
    return 'contrarian';
  }

  if (/\d+%|\$[\d,]+|[0-9]+x|[0-9]+ (users?|customers?|revenue)/i.test(content)) {
    return 'data-driven';
  }

  return 'other';
}

function normalizeLinkedInPost(record: ApifyRecord): LinkedInPostSignal | null {
  const author = getNestedRecord(record, 'author');
  const rawContent =
    getString(record, ['text', 'content', 'postText', 'postContent', 'caption']) ?? '';
  const content = rawContent.length > 400 ? rawContent.substring(0, 400) + '...' : rawContent;

  if (!content) {
    return null;
  }

  const likeCount = getNumber(record, ['numLikes', 'likes', 'likeCount', 'reactionCount']);
  const commentCount = getNumber(record, ['numComments', 'comments', 'commentCount']);
  const shareCount = getNumber(record, ['numShares', 'shares', 'shareCount', 'reposts']);

  return {
    url: getString(record, ['url', 'postUrl', 'linkedinPostUrl']),
    content,
    authorName:
      getString(record, ['authorName', 'author_name']) ??
      (author ? getString(author, ['name', 'fullName']) : null),
    authorHeadline:
      getString(record, ['authorHeadline', 'headline']) ??
      (author ? getString(author, ['headline', 'title']) : null),
    postedAt: getString(record, ['postedAtISO', 'postedAt', 'date']),
    likeCount,
    commentCount,
    shareCount,
    engagementScore: likeCount + commentCount * 2 + shareCount * 3,
  };
}

function summarizePost(post: LinkedInPostSignal): string {
  const excerpt = post.content.replace(/\s+/g, ' ').slice(0, 220);
  const authorBits = [post.authorName, post.authorHeadline].filter(Boolean).join(' — ');
  const format = detectPostFormat(post.content);
  const engagementTier =
    post.engagementScore > 200 ? 'high' :
    post.engagementScore > 50 ? 'medium' :
    'low';

  return `[format:${format}][engagement:${engagementTier}] ${authorBits || 'Unknown'} | likes:${post.likeCount} comments:${post.commentCount} | "${excerpt}"`;
}

function buildContextBlock(title: string, posts: LinkedInPostSignal[]): string | null {
  if (posts.length === 0) {
    return null;
  }

  const lines = posts.slice(0, 5).map((post, index) => `${index + 1}. ${summarizePost(post)}`);
  return `${title}\n${lines.join('\n')}`;
}

function pickReferenceUrls(referencePosts: string[]): {
  profileUrls: string[];
  postUrls: string[];
} {
  return referencePosts.reduce(
    (acc, url) => {
      if (/linkedin\.com\/(?:in|company)\//i.test(url)) {
        acc.profileUrls.push(url);
      } else if (/linkedin\.com\/posts\/|linkedin\.com\/feed\/update\//i.test(url)) {
        acc.postUrls.push(url);
      }
      return acc;
    },
    { profileUrls: [] as string[], postUrls: [] as string[] }
  );
}

async function getTrendPosts(
  userId: string,
  trendQuery: string,
  supabase: SupabaseClient,
  allowScrape: boolean
): Promise<LinkedInPostSignal[]> {
  const searchUrl = buildTrendSearchUrl(trendQuery);
  const results = await getCachedOrScrape<ApifyRecord>({
    cacheKey: getTrendCacheKey(trendQuery),
    actorId: APIFY_ACTORS.trendPosts,
    input: {
      urls: [searchUrl],
      limitPerSource: APIFY_RULES.trendLimitPerSource,
      deepScrape: true,
    },
    ttlDays: APIFY_RULES.trendTtlDays,
    userId,
    supabase,
    maxItems: APIFY_RULES.trendLimitPerSource,
    allowScrape,
  });

  return results
    .map(normalizeLinkedInPost)
    .filter((post): post is LinkedInPostSignal => post !== null)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, APIFY_RULES.trendLimitPerSource);
}

async function getReferencePosts(
  userId: string,
  referenceUrls: string[],
  supabase: SupabaseClient,
  allowScrape: boolean
): Promise<LinkedInPostSignal[]> {
  const { profileUrls, postUrls } = pickReferenceUrls(referenceUrls);
  const collected: LinkedInPostSignal[] = [];

  if (profileUrls.length > 0) {
    const results = await getCachedOrScrape<ApifyRecord>({
      cacheKey: `profiles:${profileUrls.join('|').toLowerCase()}`,
      actorId: APIFY_ACTORS.referenceProfiles,
      input: {
        targetUrls: profileUrls,
        resultsLimit: APIFY_RULES.referenceProfileLimit,
      },
      ttlDays: APIFY_RULES.referenceTtlDays,
      userId,
      supabase,
      maxItems: APIFY_RULES.referenceProfileLimit,
      allowScrape,
    });

    collected.push(
      ...results
        .map(normalizeLinkedInPost)
        .filter((post): post is LinkedInPostSignal => post !== null)
    );
  }

  if (postUrls.length > 0) {
    const results = await getCachedOrScrape<ApifyRecord>({
      cacheKey: `reference-posts:${postUrls.join('|').toLowerCase()}`,
      actorId: APIFY_ACTORS.trendPosts,
      input: {
        urls: postUrls,
        limitPerSource: 1,
        deepScrape: true,
      },
      ttlDays: APIFY_RULES.referenceTtlDays,
      userId,
      supabase,
      maxItems: APIFY_RULES.referencePostLimit,
      allowScrape,
    });

    collected.push(
      ...results
        .map(normalizeLinkedInPost)
        .filter((post): post is LinkedInPostSignal => post !== null)
    );
  }

  return collected.sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 6);
}

export async function buildLinkedInResearchContext(
  userId: string,
  onboarding: OnboardingData,
  supabase: SupabaseClient,
  plan: 'free' | 'basic' | 'pro'
): Promise<LinkedInResearchContext | null> {
  if (!process.env.APIFY_API_TOKEN) {
    return null;
  }

  const allowTrendScrape = plan !== 'free';
  const allowReferenceScrape = plan === 'pro';

  const trendQuery = buildTrendQuery(onboarding);
  const trendPosts = filterByEngagement(
    await getTrendPosts(userId, trendQuery, supabase, allowTrendScrape)
  );
  const referencePosts = await getReferencePosts(
    userId,
    onboarding.reference_posts ?? [],
    supabase,
    allowReferenceScrape
  );

  if (trendPosts.length === 0 && referencePosts.length === 0) {
    return null;
  }

  return {
    trendQuery,
    trendPosts,
    referencePosts,
    insightContext: [
      `Live LinkedIn research query: ${trendQuery}`,
      buildContextBlock('Recent high-signal public posts from LinkedIn:', trendPosts),
      buildContextBlock('Reference style examples supplied by the user:', referencePosts),
    ]
      .filter(Boolean)
      .join('\n\n'),
    contentContext: buildContextBlock(
      'Reference style and structure examples from LinkedIn:',
      referencePosts
    ),
  };
}
