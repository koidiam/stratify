export type Plan = 'free' | 'basic' | 'pro';
export type Niche = 'saas_founder' | 'developer' | 'freelancer' | 'creator';
export type PostType = 'Authority' | 'Personal' | 'Contrarian' | 'How-to' | 'Soft Sell';
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
  format_hint?: 'list' | 'story' | 'hook-question' | 'contrarian' | 'data-driven';
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

export interface WeeklyGeneration extends WeeklyContent {
  history_id: string;
  week_number: number;
  year: number;
  researchUsed?: boolean;
  trendPostCount?: number;
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

export interface LinkedInResearchContext {
  trendQuery: string;
  trendPosts: LinkedInPostSignal[];
  referencePosts: LinkedInPostSignal[];
  insightContext: string | null;
  contentContext: string | null;
}
