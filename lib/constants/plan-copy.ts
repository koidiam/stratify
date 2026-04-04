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

interface PlanDepthCard {
  plan: Plan;
  name: 'Free' | 'Basic' | 'Pro';
  depthLabel: string;
  headline: string;
  description: string;
  capacityLabel: string;
  capabilities: string[];
}

const PLAN_DEPTH_CARDS: Record<Plan, PlanDepthCard> = {
  free: {
    plan: 'free',
    name: 'Free',
    depthLabel: 'Surface Layer',
    headline: 'Core engine access, limited system depth',
    description:
      'Free lets the user sample Stratify as a strategy engine, but continuity across cycles and the deepest signal layers remain sealed.',
    capacityLabel: '1 weekly strategy pass',
    capabilities: [
      'Cached market basis keeps the engine usable',
      'Newest retained cycle stays open',
      'Good for sampling the weekly loop before deeper continuity matters',
    ],
  },
  basic: {
    plan: 'basic',
    name: 'Basic',
    depthLabel: 'Operating Layer',
    headline: 'Usable weekly system with continuity',
    description:
      'Basic turns Stratify into a real weekly operating loop: more room to test, full continuity across retained cycles, and a stronger learning surface.',
    capacityLabel: '3 weekly strategy passes',
    capabilities: [
      'Full retained history across cycles',
      'More room to compare weekly strategy passes and accumulate learning',
      'A deeper operating system than the free surface layer',
    ],
  },
  pro: {
    plan: 'pro',
    name: 'Pro',
    depthLabel: 'Intelligence Layer',
    headline: 'Full live strategy intelligence system',
    description:
      'Pro opens the deepest research layer: live signal basis, reference inputs, and the most room for the learning loop to sharpen over time.',
    capacityLabel: '50 weekly strategy passes',
    capabilities: [
      'Live signal system folded into each run',
      'Reference and competitor texture available during research',
      'Highest weekly testing room for stronger strategy shaping and learning resolution',
    ],
  },
};

export function getPlanDepthCard(plan: Plan): PlanDepthCard {
  return PLAN_DEPTH_CARDS[plan];
}

export function getHigherPlanCards(plan: Plan): PlanDepthCard[] {
  if (plan === 'free') {
    return [PLAN_DEPTH_CARDS.basic, PLAN_DEPTH_CARDS.pro];
  }

  if (plan === 'basic') {
    return [PLAN_DEPTH_CARDS.pro];
  }

  return [];
}

export function getUpgradeTargetPlan(plan: Plan): Plan | null {
  if (plan === 'free') return 'basic';
  if (plan === 'basic') return 'pro';
  return null;
}

export function getUpgradeTriggerTitle(plan: Plan): string {
  if (plan === 'free') {
    return 'Move beyond the surface layer';
  }

  if (plan === 'basic') {
    return 'Open the full intelligence layer';
  }

  return 'Intelligence layer at weekly capacity';
}

export function getUpgradeTriggerDescription(plan: Plan): string {
  if (plan === 'free') {
    return 'Free keeps the engine usable, but the continuity layer and the deepest market intelligence remain sealed above it.';
  }

  if (plan === 'basic') {
    return 'Basic keeps the weekly operating loop open. Pro adds the deepest live signal, reference, and learning-resolution layer.';
  }

  return 'You are already on the deepest plan. This surface is about current weekly capacity, not missing capability.';
}

export function getCurrentLayerStatus(plan: Plan): { label: string; detail: string } {
  if (plan === 'free') {
    return {
      label: 'Surface layer active',
      detail:
        'The engine is running with the lightest system depth: limited weekly testing room, newest-cycle access, and no full intelligence layer.',
    };
  }

  if (plan === 'basic') {
    return {
      label: 'Operating layer active',
      detail:
        'The weekly loop is fully usable, but the deepest live and reference intelligence layer is still sealed above the current plan.',
    };
  }

  return {
    label: 'Intelligence layer active',
    detail:
      'No deeper product tier exists above Pro. The current pause is only about this week’s available capacity.',
  };
}

export function getNextLayerStatus(plan: Plan): { label: string; detail: string } {
  if (plan === 'free') {
    return {
      label: 'Basic reopens continuity',
      detail:
        'Basic turns Stratify into a usable weekly system: full retained history, more room to test angles, and stronger learning continuity across cycles.',
    };
  }

  if (plan === 'basic') {
    return {
      label: 'Pro opens intelligence depth',
      detail:
        'Pro adds the deepest live signal and reference layer, giving each run stronger market basis and sharper strategy shaping when the signal is available.',
    };
  }

  return {
    label: 'Current layer remains the deepest',
    detail:
      'No higher tier exists above Pro. Settings is the right place to review billing timing and weekly capacity behavior.',
  };
}

export function getUpgradeButtonLabel(plan: Plan): string {
  if (plan === 'free') return 'Review Deeper Layers in Settings';
  if (plan === 'basic') return 'Review Pro Intelligence Layer';
  return 'Review Billing in Settings';
}

export function getLockedLayerHint(
  plan: Plan,
  context: 'history' | 'reference' | 'cached' | 'learning'
): { eyebrow: string; title: string; detail: string } | null {
  if (plan === 'pro') {
    return null;
  }

  if (context === 'history') {
    return {
      eyebrow: 'Continuity Layer',
      title: 'Full cycle continuity is sealed above the free layer',
      detail:
        plan === 'free'
          ? 'Basic reopens prior retained cycles and gives the learning loop more continuity to work with. Pro adds the deepest intelligence layer on top of that continuity.'
          : 'The full continuity layer is already open on Basic. Pro changes the depth of the signal system, not archive access.',
    };
  }

  if (context === 'reference') {
    return {
      eyebrow: 'Reference Intelligence',
      title: plan === 'free' ? 'Reference depth lives above the surface layer' : 'Reference depth is sealed above Basic',
      detail:
        plan === 'free'
          ? 'Free keeps the engine usable, but the deeper reference layer only opens inside Pro alongside the full live intelligence system.'
          : 'Basic keeps the operating loop open, but Pro adds the deeper reference and competitor texture layer during research.',
    };
  }

  if (context === 'learning') {
    return {
      eyebrow: 'Learning Resolution',
      title: plan === 'free' ? 'Learning stays low-resolution on the surface layer' : 'Pro gives the learning loop more room to resolve',
      detail:
        plan === 'free'
          ? 'With only the surface layer open, the system has less continuity and less weekly testing room to accumulate strong adaptation signals.'
          : 'Basic keeps learning active, but Pro pairs deeper market basis with wider weekly testing room for sharper strategy shaping over time.',
    };
  }

  return {
    eyebrow: 'Signal Depth',
    title: plan === 'free' ? 'Live market depth is sealed above the surface layer' : 'The deepest intelligence layer remains sealed',
    detail:
      plan === 'free'
        ? 'Free relies on the surface signal layer. Basic reopens continuity and more weekly testing room, while Pro adds the full live signal and reference system.'
        : 'Basic keeps the weekly loop open, but Pro adds the deepest live signal and reference layer when you need sharper market basis.',
  };
}

// ─── Generate Page ──────────────────────────────────────────────────────────

export function getGenerateHeaderDescription(plan: Plan): string {
  if (plan === 'pro') {
    return 'Your onboarding context and live LinkedIn signals are compiled into one weekly strategy pass. The engine extracts patterns, explains the angle, then converts them into hooks and ready-to-publish drafts.';
  }
  if (plan === 'basic') {
    return 'Your onboarding context and the operating signal layer are compiled into one weekly strategy pass. The engine keeps continuity across retained cycles and has more room to test strategy directions, while the full intelligence layer remains sealed for Pro.';
  }
  return 'Your onboarding context and cached niche signals are compiled into one weekly strategy pass. The engine extracts patterns, explains the angle, then converts them into hooks and ready-to-publish drafts.';
}

export function getSignalScanDescription(plan: Plan): string {
  if (plan === 'pro') {
    return 'Live LinkedIn signals gathered from current posts, references, and market activity.';
  }
  if (plan === 'basic') {
    return 'Expanded signal coverage from retained cycle memory, with fresher market input layered in when available.';
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
  if (plan === 'basic') {
    return 'Based on the operating signal layer in your niche';
  }
  return 'Based on patterns in your niche';
}

// ─── Dashboard — WelcomeGuide ───────────────────────────────────────────────

export function getWelcomeGuideStep1(plan: Plan): string {
  if (plan === 'pro') {
    return 'Head to the Generate tab. The engine sweeps LinkedIn for live data to find what works in your niche today.';
  }
  if (plan === 'basic') {
    return 'Head to the Generate tab. The engine now runs as a fuller weekly operating loop with continuity across retained cycles. Pro adds the deepest live signal and reference layer.';
  }
  return 'Head to the Generate tab. The engine analyzes your niche from the Stratify database to produce insights and drafts. Deeper continuity and intelligence layers open on paid plans.';
}

// ─── Dashboard — QuickActions ───────────────────────────────────────────────

export const QUICK_ACTIONS_DESCRIPTION = 'Create data-backed posts tailored to your niche.';

export function getQuickActionsUpgradeHint(plan: Plan): string | null {
  if (plan === 'pro') return null;
  return plan === 'free'
    ? 'Basic reopens full continuity across cycles. Pro adds the full live signal and reference layer.'
    : 'Pro opens the deepest live signal and reference layer when you need more strategy depth.';
}

// ─── History — Lock Message ─────────────────────────────────────────────────

export const HISTORY_LOCK_MESSAGE = 'Basic and Pro reopen the full continuity layer across retained cycles';

// ─── PaywallModal ───────────────────────────────────────────────────────────

export const PAYWALL_WHY_UPGRADE =
  'Upgrading opens a deeper system layer: more continuity across cycles, stronger intelligence depth, and more room for the learning loop to resolve.';

export const PAYWALL_BASIC_FEATURES = [
  'Full continuity across retained cycles',
  'More weekly room to test strategy directions',
  'A usable weekly operating loop instead of a surface-only layer',
];

export const PAYWALL_PRO_FEATURES = [
  'Live signal system folded into each run',
  'Reference and competitor texture during research',
  'Highest weekly testing room for deeper learning resolution',
];

export function getPlanSourceSummary(plan: Plan): { label: string; detail: string } {
  if (plan === 'pro') {
    return {
      label: 'Live LinkedIn signals',
      detail: 'Current LinkedIn research is folded into each weekly strategy pass.',
    };
  }

  if (plan === 'basic') {
    return {
      label: 'Operating signal layer',
      detail: 'Retained cycle memory and wider weekly testing room are active. The deepest live reference layer remains sealed for Pro.',
    };
  }

  return {
    label: 'Cached niche signals',
    detail: 'Recent niche patterns from Stratify history are used to shape each weekly pass.',
  };
}

export function getPaywallTeaser(trendPostCount: number, niche: string): string {
  if (trendPostCount > 0) {
    return `${trendPostCount} LinkedIn posts were analyzed in the ${niche} niche this week. Pro adds the deepest live signal and reference layer on top of that market basis.`;
  }

  return `The deepest live signal layer for the ${niche} niche is sealed above the current plan. Pro is where current market basis and reference depth fully open.`;
}

export function getImmediateUnlocks(plan: Plan): string[] {
  if (plan === 'free') return PAYWALL_BASIC_FEATURES;
  if (plan === 'basic') return PAYWALL_PRO_FEATURES;
  return [];
}

export function getMissingCapabilities(plan: Plan): string[] {
  if (plan === 'free') {
    return [
      'Full continuity across prior retained cycles stays sealed',
      'Weekly testing room is too narrow for stronger learning resolution',
      'The deepest live signal and reference layers stay sealed',
    ];
  }

  if (plan === 'basic') {
    return [
      'The deepest live signal layer is still sealed above Basic',
      'Reference and competitor texture are unavailable in the current research layer',
      'The learning loop has less room to resolve across many weekly strategy passes',
    ];
  }

  return [
    'No deeper intelligence tier exists above Pro',
    'Current weekly capacity resumes next week unless billing changes',
  ];
}
