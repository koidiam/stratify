import { SupabaseClient } from '@supabase/supabase-js';

import { LinkedInPostSignal, LinkedInResearchContext, OnboardingData } from '@/types';

import { getCachedOrScrape } from './cache';
import { APIFY_ACTORS, APIFY_RULES } from './constants';

type ApifyRecord = Record<string, unknown>;

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

function buildTrendQuery(data: OnboardingData): string {
  return `${data.niche} ${data.target_audience} LinkedIn`;
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
  const excerpt = post.content.replace(/\s+/g, ' ').slice(0, 180);
  const authorBits = [post.authorName, post.authorHeadline].filter(Boolean).join(' — ');
  const stats = `likes:${post.likeCount}, comments:${post.commentCount}, shares:${post.shareCount}`;
  return `${authorBits || 'Unknown author'} | ${stats} | "${excerpt}"`;
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
  supabase: SupabaseClient
): Promise<LinkedInPostSignal[]> {
  const searchUrl = buildTrendSearchUrl(trendQuery);
  const results = await getCachedOrScrape<ApifyRecord>({
    cacheKey: `posts:${trendQuery.toLowerCase()}`,
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
  supabase: SupabaseClient
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
  supabase: SupabaseClient
): Promise<LinkedInResearchContext | null> {
  if (!process.env.APIFY_API_TOKEN) {
    return null;
  }

  const trendQuery = buildTrendQuery(onboarding);
  const trendPosts = await getTrendPosts(userId, trendQuery, supabase);
  const referencePosts = await getReferencePosts(
    userId,
    onboarding.reference_posts ?? [],
    supabase
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
