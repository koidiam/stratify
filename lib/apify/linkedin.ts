import { SupabaseClient } from '@supabase/supabase-js';

import {
  InsightItem,
  LinkedInPostSignal,
  LinkedInResearchContext,
  OnboardingData,
  ResearchProvenance,
  ResearchSourceMode,
  SignalStrength,
} from '@/types';

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

interface FilteredPostsResult {
  posts: LinkedInPostSignal[];
  removedCount: number;
}

interface ResearchChannelSnapshot {
  posts: LinkedInPostSignal[];
  sourceType: ResearchSourceMode;
  analyzedCount: number;
}

interface InsightEvidenceResult {
  basis: string[];
  signal_strength?: SignalStrength;
  priorityScore: number;
  supportCount: number;
  referenceMatchCount: number;
  engagementLift: number;
}

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

function filterByEngagement(posts: LinkedInPostSignal[]): FilteredPostsResult {
  if (posts.length < 4) {
    return {
      posts,
      removedCount: 0,
    };
  }

  const scores = posts.map((post) => post.engagementScore).sort((a, b) => a - b);
  const p25 = scores[Math.floor(scores.length * 0.25)];
  const filtered = posts.filter((post) => post.engagementScore >= p25);

  return {
    posts: filtered,
    removedCount: posts.length - filtered.length,
  };
}

const JOB_POSTING_PHRASES = [
  'we are hiring',
  "we're hiring",
  'now hiring',
  'job opening',
  'open position',
  'apply now',
  'send your cv',
  'send your resume',
  'dm me to apply',
  'looking for a',
  'years of experience',
] as const;

function filterOutJobPostingContent(posts: LinkedInPostSignal[]): FilteredPostsResult {
  const filtered = posts.filter((post) => {
    const lower = post.content.toLowerCase();
    const matchedPhraseCount = JOB_POSTING_PHRASES.filter((phrase) => lower.includes(phrase)).length;

    if (matchedPhraseCount >= 2) {
      console.log('[apify] filtered job posting content', {
        url: post.url,
        content: post.content,
      });
      return false;
    }

    return true;
  });

  return {
    posts: filtered,
    removedCount: posts.length - filtered.length,
  };
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

function combineResearchSourceTypes(...sourceTypes: ResearchSourceMode[]): ResearchSourceMode {
  if (sourceTypes.includes('live')) {
    return 'live';
  }

  if (sourceTypes.includes('cached')) {
    return 'cached';
  }

  return 'none';
}

function getMarketInputStatus(
  trendPostCount: number,
  referencePostCount: number
): ResearchProvenance['marketInputStatus'] {
  if (trendPostCount > 0 && referencePostCount > 0) {
    return 'trend-and-reference';
  }

  if (trendPostCount > 0) {
    return 'trend-only';
  }

  if (referencePostCount > 0) {
    return 'reference-only';
  }

  return 'profile-only';
}

function calculateTimeWindow(posts: LinkedInPostSignal[]): string | undefined {
  const dates = posts
    .map((p) => p.postedAt)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return undefined;

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const first = dates[0].toLocaleDateString('en-US', formatOptions);
  const last = dates[dates.length - 1].toLocaleDateString('en-US', formatOptions);

  if (first === last) return first;
  return `${first} – ${last}`;
}

function buildResearchSummary(params: {
  trendQuery: string;
  trendSourceType: ResearchSourceMode;
  trendAnalyzedCount: number;
  trendPostCount: number;
  referenceSourceType: ResearchSourceMode;
  referencePostCount: number;
  referenceInputCount: number;
  lowSignalPostsFiltered: number;
  jobPostsExcluded: number;
  timeWindow?: string;
}): ResearchProvenance {
  const analyzedPostCount = params.trendAnalyzedCount + params.referencePostCount;
  const retainedPostCount = params.trendPostCount + params.referencePostCount;
  const filteredPostCount = params.lowSignalPostsFiltered + params.jobPostsExcluded;

  return {
    sourceMode: combineResearchSourceTypes(params.trendSourceType, params.referenceSourceType),
    marketInputStatus: getMarketInputStatus(params.trendPostCount, params.referencePostCount),
    analyzedPostCount,
    retainedPostCount,
    filteredPostCount,
    trendQuery: params.trendQuery,
    trendSourceType: params.trendSourceType,
    trendPostCount: params.trendPostCount,
    referenceSourceType: params.referenceSourceType,
    referencePostCount: params.referencePostCount,
    referenceInputCount: params.referenceInputCount,
    lowSignalFilterApplied: params.trendAnalyzedCount >= 4,
    lowSignalPostsFiltered: params.lowSignalPostsFiltered,
    jobPostFilterApplied: params.trendAnalyzedCount > 0,
    jobPostsExcluded: params.jobPostsExcluded,
    timeWindow: params.timeWindow,
  };
}

async function getTrendPosts(
  userId: string,
  trendQuery: string,
  supabase: SupabaseClient,
  allowScrape: boolean
): Promise<ResearchChannelSnapshot> {
  const searchUrl = buildTrendSearchUrl(trendQuery);
  const result = await getCachedOrScrape<ApifyRecord>({
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

  const posts = result.results
    .map(normalizeLinkedInPost)
    .filter((post): post is LinkedInPostSignal => post !== null)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, APIFY_RULES.trendLimitPerSource);

  return {
    posts,
    sourceType: result.sourceType,
    analyzedCount: posts.length,
  };
}

async function getReferencePosts(
  userId: string,
  referenceUrls: string[],
  supabase: SupabaseClient,
  allowScrape: boolean
): Promise<ResearchChannelSnapshot> {
  const { profileUrls, postUrls } = pickReferenceUrls(referenceUrls);
  const collected: LinkedInPostSignal[] = [];
  const sourceTypes: ResearchSourceMode[] = [];

  if (profileUrls.length > 0) {
    const result = await getCachedOrScrape<ApifyRecord>({
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
    sourceTypes.push(result.sourceType);

    collected.push(
      ...result.results
        .map(normalizeLinkedInPost)
        .filter((post): post is LinkedInPostSignal => post !== null)
    );
  }

  if (postUrls.length > 0) {
    const result = await getCachedOrScrape<ApifyRecord>({
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
    sourceTypes.push(result.sourceType);

    collected.push(
      ...result.results
        .map(normalizeLinkedInPost)
        .filter((post): post is LinkedInPostSignal => post !== null)
    );
  }

  const posts = collected.sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 6);

  return {
    posts,
    sourceType: combineResearchSourceTypes(...sourceTypes),
    analyzedCount: posts.length,
  };
}

const FORMAT_LABELS: Record<PostFormat, string> = {
  list: 'list-format',
  story: 'story-format',
  'hook-question': 'hook-question',
  contrarian: 'contrarian',
  'data-driven': 'data-driven',
  other: 'observed',
};

function getPatternFallback(insight: InsightItem): string {
  switch (insight.format_hint) {
    case 'data-driven':
      return 'Higher-response posts are clustering around proof-backed breakdowns instead of abstract advice.';
    case 'story':
      return 'Narrative openings are working when they begin with a costly decision or tension point, not the polished outcome.';
    case 'contrarian':
      return 'Response is concentrating around targeted disagreement with familiar playbooks rather than standard instruction.';
    case 'hook-question':
      return 'Attention is concentrating around openings that create a specific unresolved gap before the answer appears.';
    case 'list':
      return 'Retained posts repeatedly use compact list framing to make a narrow audience problem legible immediately.';
    default:
      return 'A repeated structure is visible in the retained sample, not just a single outlier.';
  }
}

function getImplicationFallback(insight: InsightItem): string {
  if (insight.why.trim()) {
    return insight.why.trim();
  }

  switch (insight.trigger) {
    case 'Social proof':
      return 'The edge is shifting toward visible proof and operating specificity, not broad clarity alone.';
    case 'Relatability':
      return 'Recognition and lived tension are carrying more weight than polished summaries.';
    case 'Contrast':
      return 'The advantage comes from a narrow reframe against the default, not from contrarian tone by itself.';
    case 'Curiosity':
      return 'The audience is rewarding unresolved tension more than immediate explanation.';
    case 'Progress':
      return 'Concrete movement is outperforming abstract promises of improvement.';
    default:
      return 'The signal matters only while it stays specific to the audience context.';
  }
}

function getRecommendedMoveFallback(insight: InsightItem): string {
  switch (insight.format_hint) {
    case 'data-driven':
      return 'Lean into firsthand breakdowns with one operating metric, one mistaken assumption, and one concrete change.';
    case 'story':
      return 'Lead with the turning point or mistake first, then connect it to the lesson before revealing the outcome.';
    case 'contrarian':
      return 'Target one familiar default belief in the niche, then reframe it with a concrete operating reason or result.';
    case 'hook-question':
      return 'Test open-loop entries that delay the answer until after the first tension beat.';
    case 'list':
      return 'Package the signal as a narrow list built around one recurring audience failure or overlooked decision.';
    default:
      if (insight.trigger === 'Social proof' || insight.trigger === 'Progress') {
        return 'Anchor the angle in one concrete result, one causal detail, and one clear audience takeaway.';
      }
      if (insight.trigger === 'Relatability') {
        return 'Use a recognizable lived moment early so the reader sees themselves before the lesson lands.';
      }
      if (insight.trigger === 'Contrast') {
        return 'Frame the post against a familiar default, then make the reframe specific enough to defend.';
      }
      return 'Turn the signal into one narrow angle, one concrete example, and one obvious next test.';
  }
}

function getRiskFallback(insight: InsightItem): string {
  switch (insight.format_hint) {
    case 'data-driven':
      return 'High upside when the proof is firsthand and specific; weak once the metric floats without context or ownership.';
    case 'story':
      return 'Works best when the tension arrives immediately; weak if the story becomes polished inspiration instead of lived consequence.';
    case 'contrarian':
      return 'Useful when the disagreement is narrow and evidenced; weak if the stance is broad, theatrical, or unsupported.';
    case 'hook-question':
      return 'Strong when the gap stays open at the start; weak if the answer appears before tension builds.';
    case 'list':
      return 'Efficient for clarity, but easy to commoditize if each point sounds interchangeable with generic advice.';
    default:
      return 'The advantage fades once the framing becomes broad enough to fit every niche.';
  }
}

function getEvidenceFormat(insight: InsightItem): PostFormat | null {
  if (insight.format_hint && insight.format_hint !== 'other') {
    return insight.format_hint;
  }

  if (insight.trigger === 'Relatability') {
    return 'story';
  }

  if (insight.trigger === 'Contrast') {
    return 'contrarian';
  }

  if (insight.trigger === 'Curiosity') {
    return 'hook-question';
  }

  if (insight.trigger === 'Social proof' || insight.trigger === 'Progress') {
    return 'data-driven';
  }

  return null;
}

function averageEngagement(posts: LinkedInPostSignal[]): number {
  if (posts.length === 0) {
    return 0;
  }

  return posts.reduce((sum, post) => sum + post.engagementScore, 0) / posts.length;
}

function getSignalStrength(params: {
  totalPosts: number;
  supportCount: number;
  referenceMatchCount: number;
  engagementLift: number;
}): SignalStrength | undefined {
  if (params.totalPosts === 0 || params.supportCount === 0) {
    return undefined;
  }

  let score = 0;

  if (params.supportCount >= 1) score += 1;
  if (params.supportCount >= 2) score += 1;
  if (params.supportCount >= 3) score += 1;
  if (params.referenceMatchCount > 0) score += 1;
  if (params.engagementLift >= 1.15) score += 1;
  if (params.totalPosts >= 6) score += 1;

  if (score >= 5) return 'strong';
  if (score >= 3) return 'moderate';
  return 'weak';
}

function buildInsightEvidence(
  insight: InsightItem,
  research: LinkedInResearchContext
): InsightEvidenceResult {
  if (research.researchSummary.retainedPostCount === 0) {
    return {
      basis: [
        'No retained LinkedIn post set was attached to this run. The signal was generated from onboarding context and recent feedback only.',
      ],
      priorityScore: 0,
      supportCount: 0,
      referenceMatchCount: 0,
      engagementLift: 0,
    };
  }

  const evidenceFormat = getEvidenceFormat(insight);
  const matchingTrendPosts = evidenceFormat
    ? research.trendPosts.filter((post) => detectPostFormat(post.content) === evidenceFormat)
    : research.trendPosts;
  const matchingReferencePosts = evidenceFormat
    ? research.referencePosts.filter((post) => detectPostFormat(post.content) === evidenceFormat)
    : research.referencePosts;
  const descriptor = evidenceFormat ? `${FORMAT_LABELS[evidenceFormat]} posts` : 'retained posts';
  const supportCount = matchingTrendPosts.length + matchingReferencePosts.length;
  const overallTrendAverage = averageEngagement(research.trendPosts);
  const matchingTrendAverage = averageEngagement(matchingTrendPosts);
  const engagementLift =
    overallTrendAverage > 0 && matchingTrendAverage > 0
      ? matchingTrendAverage / overallTrendAverage
      : 0;
  const basis: string[] = [];

  if (matchingTrendPosts.length >= 2) {
    basis.push(`Repeated across ${matchingTrendPosts.length} ${descriptor} retained for this run.`);
  } else if (matchingTrendPosts.length === 1) {
    basis.push(`Detected inside a retained ${descriptor.replace(' posts', '')} example from this run.`);
  } else if (research.trendPosts.length > 0) {
    basis.push('Promoted from the higher-signal portion of the retained market sample.');
  }

  if (matchingTrendPosts.length > 0) {
    if (engagementLift >= 1.15) {
      basis.push(`Engagement clustered above the run average around this ${descriptor.replace(' posts', '')} structure.`);
    } else if (matchingTrendPosts.length >= 2) {
      basis.push('This pattern repeated across multiple retained posts, not a single outlier.');
    }
  }

  if (matchingReferencePosts.length > 0) {
    basis.push(`Reference texture in this run reinforced the same ${descriptor.replace(' posts', '')} structure.`);
  } else if (research.referencePosts.length > 0 && basis.length < 3) {
    basis.push('Reference posts were available as structure texture during extraction.');
  }

  if (basis.length < 3 && research.researchSummary.filteredPostCount > 0) {
    const filterNotes: string[] = [];

    if (research.researchSummary.lowSignalPostsFiltered > 0) {
      filterNotes.push(`${research.researchSummary.lowSignalPostsFiltered} lower-signal posts removed`);
    }

    if (research.researchSummary.jobPostsExcluded > 0) {
      filterNotes.push(`${research.researchSummary.jobPostsExcluded} hiring-style posts excluded`);
    }

    if (filterNotes.length > 0) {
      basis.push(`${filterNotes.join('; ')} before extraction.`);
    }
  }

  if (basis.length === 0) {
    basis.push('Observed inside the retained market sample used for this run.');
  }

  const signalStrength = getSignalStrength({
    totalPosts: research.researchSummary.retainedPostCount,
    supportCount,
    referenceMatchCount: matchingReferencePosts.length,
    engagementLift,
  });
  const strengthWeight =
    signalStrength === 'strong' ? 3 :
    signalStrength === 'moderate' ? 2 :
    signalStrength === 'weak' ? 1 :
    0;

  return {
    basis: basis.slice(0, 3),
    signal_strength: signalStrength,
    priorityScore:
      strengthWeight * 100 +
      supportCount * 10 +
      matchingReferencePosts.length * 5 +
      (engagementLift >= 1.15 ? 10 : 0),
    supportCount,
    referenceMatchCount: matchingReferencePosts.length,
    engagementLift,
  };
}

export function enrichInsightsWithResearchBasis(
  insights: InsightItem[],
  research: LinkedInResearchContext
): InsightItem[] {
  const enriched = insights.map((insight, index) => {
    const evidence = buildInsightEvidence(insight, research);

    return {
      index,
      priorityScore: evidence.priorityScore,
      supportCount: evidence.supportCount,
      referenceMatchCount: evidence.referenceMatchCount,
      engagementLift: evidence.engagementLift,
      item: {
        ...insight,
        pattern: insight.pattern?.trim() || getPatternFallback(insight),
        implication: insight.implication?.trim() || getImplicationFallback(insight),
        recommended_move: insight.recommended_move?.trim() || getRecommendedMoveFallback(insight),
        risk: insight.risk?.trim() || getRiskFallback(insight),
        basis: evidence.basis,
        signal_strength: evidence.signal_strength,
      } satisfies InsightItem,
    };
  });

  if (research.researchSummary.retainedPostCount === 0) {
    return enriched.map((entry) => entry.item);
  }

  return enriched
    .sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      if (right.supportCount !== left.supportCount) {
        return right.supportCount - left.supportCount;
      }

      if (right.referenceMatchCount !== left.referenceMatchCount) {
        return right.referenceMatchCount - left.referenceMatchCount;
      }

      if (right.engagementLift !== left.engagementLift) {
        return right.engagementLift - left.engagementLift;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.item);
}

export async function buildLinkedInResearchContext(
  userId: string,
  onboarding: OnboardingData,
  supabase: SupabaseClient,
  plan: 'free' | 'basic' | 'pro'
): Promise<LinkedInResearchContext> {
  const scrapeEnabled = Boolean(process.env.APIFY_API_TOKEN);
  const allowTrendScrape = scrapeEnabled && plan !== 'free';
  const allowReferenceScrape = scrapeEnabled && plan === 'pro';
  const trendQuery = buildTrendQuery(onboarding);
  const trendChannel = await getTrendPosts(userId, trendQuery, supabase, allowTrendScrape);
  const lowSignalFilter = filterByEngagement(trendChannel.posts);
  const jobPostFilter = filterOutJobPostingContent(lowSignalFilter.posts);
  const referenceChannel = await getReferencePosts(
    userId,
    onboarding.reference_posts ?? [],
    supabase,
    allowReferenceScrape
  );
  const researchSummary = buildResearchSummary({
    trendQuery,
    trendSourceType: trendChannel.sourceType,
    trendAnalyzedCount: trendChannel.analyzedCount,
    trendPostCount: jobPostFilter.posts.length,
    referenceSourceType: referenceChannel.sourceType,
    referencePostCount: referenceChannel.posts.length,
    referenceInputCount: onboarding.reference_posts?.length ?? 0,
    lowSignalPostsFiltered: lowSignalFilter.removedCount,
    jobPostsExcluded: jobPostFilter.removedCount,
    timeWindow: calculateTimeWindow(jobPostFilter.posts),
  });
  const insightContext = [
    `LinkedIn research query: ${trendQuery}`,
    buildContextBlock('Retained public market posts from LinkedIn:', jobPostFilter.posts),
    buildContextBlock('Reference style examples supplied by the user:', referenceChannel.posts),
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    trendQuery,
    trendPosts: jobPostFilter.posts,
    referencePosts: referenceChannel.posts,
    insightContext: insightContext || null,
    contentContext: buildContextBlock(
      'Reference style and structure examples from LinkedIn:',
      referenceChannel.posts
    ),
    researchSummary,
  };
}
