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
    return 'Your onboarding context, live LinkedIn signals, and generation limits flow into a single pipeline. First insights, then hooks, then final ready-to-publish drafts.';
  }
  return 'Your onboarding context and generation limits flow into a single pipeline. First insights, then hooks, then final ready-to-publish drafts.';
}

export function getSignalScanDescription(plan: Plan): string {
  if (plan === 'pro') {
    return 'Real-time signals gathered from live LinkedIn data.';
  }
  return 'Niche patterns analyzed from your Stratify database.';
}

export function showProLabel(plan: Plan): boolean {
  return plan !== 'pro';
}

// ─── Loading Messages ───────────────────────────────────────────────────────

export function getLoadingMessages(plan: Plan): string[] {
  if (plan === 'pro') {
    return [
      'Connecting to Strategy Engine...',
      'Analyzing your niche and audience...',
      'Gathering real-time LinkedIn signals...',
      'Designing high-engagement hooks...',
      'Applying psychological triggers...',
      'Polishing drafts to your brand tone...',
      'Finalizing output...',
    ];
  }
  return [
    'Connecting to Strategy Engine...',
    'Analyzing your niche and audience...',
    'Accessing Stratify Matrix (Niche Cache)...',
    'Designing high-engagement hooks...',
    'Applying psychological triggers...',
    'Polishing drafts to your brand tone...',
    'Finalizing output...',
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
