export type Plan = 'free' | 'basic' | 'pro';
export type Niche = 'saas_founder' | 'developer' | 'freelancer' | 'creator';
export type PostType = 'Authority' | 'Personal' | 'Contrarian' | 'How-to' | 'Soft Sell';
export type ResearchSourceMode = 'live' | 'cached' | 'none';
export type SignalStrength = 'weak' | 'moderate' | 'strong';
export type LearningStatus = 'none' | 'early' | 'directional';
export type LearningComparisonBasis = 'engagement-rate' | 'engagement-score' | 'insufficient';
export type MarketInputStatus =
  | 'trend-and-reference'
  | 'trend-only'
  | 'reference-only'
  | 'profile-only';
export type PsychTrigger =
  | 'Curiosity'
  | 'Social proof'
  | 'Scarcity'
  | 'Relatability'
  | 'Contrast'
  | 'Progress';

export interface OnboardingData {
  niche: string;
  target_audience: string;
  tone: string;
  goal?: string;
  reference_posts?: string[];
}

export interface InsightItem {
  insight: string;
  why: string;
  trigger: PsychTrigger;
  format_hint?: 'list' | 'story' | 'hook-question' | 'contrarian' | 'data-driven' | 'other';
  pattern?: string;
  implication?: string;
  recommended_move?: string;
  risk?: string;
  basis?: string[];
  signal_strength?: SignalStrength;
}

export interface IdeaItem {
  idea: string;
  type: PostType;
}

export interface PostItem {
  content: string;
  type: PostType;
  explanation: string;
}

export interface WeeklyContent {
  insights: InsightItem[];
  ideas: IdeaItem[];
  hooks: string[];
  posts: PostItem[];
}

export interface LearningSummary {
  status: LearningStatus;
  driftStatus: 'none' | 'emerging' | 'repeating';
  comparisonBasis: LearningComparisonBasis;
  feedbackEntryCount: number;
  annotatedCycleCount: number;
  lastFeedbackAt: string | null;
  strongestType: string | null;
  weakestType: string | null;
  bestPerformanceNote: string | null;
  cautionNote: string | null;
  latestOperatorNote: string | null;
  driftNote: string | null;
  adjustmentContext: string[];
}

export interface WeeklyGeneration extends WeeklyContent {
  history_id: string;
  week_number: number;
  year: number;
  researchUsed?: boolean;
  trendPostCount?: number;
  researchSummary?: ResearchProvenance;
  learningSummary?: LearningSummary;
}

export interface ApiErrorResponse {
  error: string;
  plan?: Plan;
}

export interface FeedbackPayload {
  history_id: string;
  post_index: number;
  views?: number;
  likes?: number;
  comments?: number;
  reposts?: number;
  notes?: string;
}

export interface LinkedInPostSignal {
  url: string | null;
  content: string;
  authorName: string | null;
  authorHeadline: string | null;
  postedAt: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagementScore: number;
}

export interface ResearchProvenance {
  sourceMode: ResearchSourceMode;
  marketInputStatus: MarketInputStatus;
  analyzedPostCount: number;
  retainedPostCount: number;
  filteredPostCount: number;
  trendQuery: string;
  trendSourceType: ResearchSourceMode;
  trendPostCount: number;
  referenceSourceType: ResearchSourceMode;
  referencePostCount: number;
  referenceInputCount: number;
  lowSignalFilterApplied: boolean;
  lowSignalPostsFiltered: number;
  jobPostFilterApplied: boolean;
  jobPostsExcluded: number;
}

export interface LinkedInResearchContext {
  trendQuery: string;
  trendPosts: LinkedInPostSignal[];
  referencePosts: LinkedInPostSignal[];
  insightContext: string | null;
  contentContext: string | null;
  researchSummary: ResearchProvenance;
}
