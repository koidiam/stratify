/**
 * Central plan-aware copy constants for Stratify.
 *
 * ALL plan-dependent UI text lives here. This prevents copy drift
 * and ensures a single update point when plan capabilities change.
 *
 * Rule: If a string changes based on Free / Basic / Pro,
 * it MUST be defined here — never hardcoded in a component.
 */

import { Plan } from '@/types';

// ─── Generate Page ──────────────────────────────────────────────────────────

export function getGenerateHeaderDescription(plan: Plan): string {
  if (plan === 'pro') {
    return 'Your onboarding context and live LinkedIn signals are compiled into one weekly strategy pass. The engine extracts patterns, explains the angle, then converts them into hooks and ready-to-publish drafts.';
  }
  return 'Your onboarding context and cached niche signals are compiled into one weekly strategy pass. The engine extracts patterns, explains the angle, then converts them into hooks and ready-to-publish drafts.';
}

export function getSignalScanDescription(plan: Plan): string {
  if (plan === 'pro') {
    return 'Live LinkedIn signals gathered from current posts, references, and market activity.';
  }
  return 'Cached niche patterns analyzed from Stratify signal history.';
}

export function showProLabel(plan: Plan): boolean {
  return plan !== 'pro';
}

// ─── Loading Messages ───────────────────────────────────────────────────────

export function getLoadingMessages(plan: Plan): string[] {
  if (plan === 'pro') {
    return [
      'Connecting to strategy engine...',
      'Loading audience and tone context...',
      'Scanning live LinkedIn signals...',
      'Extracting repeatable patterns...',
      'Translating patterns into hook angles...',
      'Compiling full LinkedIn drafts...',
      'Preparing structured output...',
    ];
  }
  return [
    'Connecting to strategy engine...',
    'Loading audience and tone context...',
    'Scanning cached niche signals...',
    'Extracting repeatable patterns...',
    'Translating patterns into hook angles...',
    'Compiling full LinkedIn drafts...',
    'Preparing structured output...',
  ];
}

// ─── Insight Viewer ─────────────────────────────────────────────────────────

export function getInsightSourceLabel(plan: Plan): string {
  if (plan === 'pro') {
    return 'Based on live signals in your niche';
  }
  return 'Based on patterns in your niche';
}

// ─── Dashboard — WelcomeGuide ───────────────────────────────────────────────

export function getWelcomeGuideStep1(plan: Plan): string {
  if (plan === 'pro') {
    return 'Head to the Generate tab. The engine sweeps LinkedIn for live data to find what works in your niche today.';
  }
  return 'Head to the Generate tab. The engine analyzes your niche from the Stratify database to produce insights and drafts. Pro plans include live LinkedIn scanning.';
}

// ─── Dashboard — QuickActions ───────────────────────────────────────────────

export const QUICK_ACTIONS_DESCRIPTION = 'Create data-backed posts tailored to your niche.';

export function getQuickActionsUpgradeHint(plan: Plan): string | null {
  if (plan === 'pro') return null;
  return 'Pro users get live LinkedIn research for deeper insights.';
}

// ─── History — Lock Message ─────────────────────────────────────────────────

export const HISTORY_LOCK_MESSAGE = 'Upgrade to Pro to access past weeks';

// ─── PaywallModal ───────────────────────────────────────────────────────────

export const PAYWALL_WHY_UPGRADE =
  'Your free plan uses cached niche data. Upgrading unlocks live LinkedIn scanning — fresher signals, sharper hooks, better-performing posts.';

export const PAYWALL_BASIC_FEATURES = [
  'Generate 3 full strategies per week',
  'Insights tuned to your specific niche',
  'Full generation history access',
];

export const PAYWALL_PRO_FEATURES = [
  'Generate up to 50 strategies per week',
  'Insights powered by live LinkedIn data',
  'Analyze competitor and reference posts',
  'Faster generation with priority access',
];

export function getPlanSourceSummary(plan: Plan): { label: string; detail: string } {
  if (plan === 'pro') {
    return {
      label: 'Live LinkedIn signals',
      detail: 'Current LinkedIn research is folded into each weekly strategy pass.',
    };
  }

  return {
    label: 'Cached niche signals',
    detail: 'Recent niche patterns from Stratify history are used to shape each weekly pass.',
  };
}

export function getPaywallTeaser(trendPostCount: number, niche: string): string {
  if (trendPostCount > 0) {
    return `${trendPostCount} LinkedIn posts were analyzed in the ${niche} niche this week. Competitor profiles and weekly signal shifts are included in every Pro run.`;
  }

  return `Every Pro run is powered by live LinkedIn signals. Live data analysis for the ${niche} niche is currently locked.`;
}

export function getImmediateUnlocks(plan: Plan): string[] {
  if (plan === 'free') return PAYWALL_BASIC_FEATURES;
  if (plan === 'basic') return PAYWALL_PRO_FEATURES;
  return [];
}

export function getMissingCapabilities(plan: Plan): string[] {
  if (plan === 'free') {
    return [
      'Only 1 strategy run per week',
      'No full weekly history archive',
      'No live LinkedIn signal scanning',
    ];
  }

  if (plan === 'basic') {
    return [
      'No live LinkedIn signal scanning',
      'No competitor or reference post analysis',
      'Lower weekly strategy capacity',
    ];
  }

  return [
    'Current weekly capacity reached',
    'Run access resumes next week unless capacity changes',
  ];
}
