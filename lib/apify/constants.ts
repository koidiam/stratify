export const APIFY_ACTORS = {
  trendPosts: 'supreme_coder/linkedin-post',
  referenceProfiles: 'harvestapi/linkedin-profile-posts',
  fallbackSearch: 'apimaestro/linkedin-posts-search-scraper-no-cookies',
} as const;

export const APIFY_RULES = {
  maxMonthlyScrapesPerUser: 2,
  trendTtlDays: 7,
  referenceTtlDays: 14,
  trendLimitPerSource: 12,
  referenceProfileLimit: 6,
  referencePostLimit: 3,
} as const;
