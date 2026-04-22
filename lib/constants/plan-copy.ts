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
      'The initial layer lets the system operate, but continuity and deepest signal learning stay sealed.',
    capacityLabel: 'Baseline system capacity',
    capabilities: [
      'Limited market pattern signals',
      'Single strategy path extraction',
      'Short-term cycle memory',
      'Minimal learning carryover',
    ],
  },
  basic: {
    plan: 'basic',
    name: 'Basic',
    depthLabel: 'Operating Layer',
    headline: 'Usable weekly system with continuity',
    description:
      'The operating layer connects your cycles together. Learning begins to influence output.',
    capacityLabel: 'Expanded operating capacity',
    capabilities: [
      'Expanded market pattern signals',
      'Dual strategy path extraction',
      'Partial memory continuity across cycles',
      'Directional learning influence',
    ],
  },
  pro: {
    plan: 'pro',
    name: 'Pro',
    depthLabel: 'Intelligence Layer',
    headline: 'Full live strategy intelligence system',
    description:
      'The intelligence layer completely unlocks the system. It adapts to you over time.',
    capacityLabel: 'Full system capacity',
    capabilities: [
      'Full live pattern landscape',
      'Complete strategy path extraction',
      'Full memory continuity chain',
      'Adaptive learning-driven system behavior',
      'Direct reference integration',
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
    return 'Deeper signal layers available';
  }

  if (plan === 'basic') {
    return 'Approaching intelligence layer depth';
  }

  return 'System capacity reached';
}

export function getUpgradeTriggerDescription(plan: Plan): string {
  if (plan === 'free') {
    return 'You are approaching deeper system layers. Continuity continues at higher system depth.';
  }

  if (plan === 'basic') {
    return 'You are gaining access to higher system depth. Next cycle will not be fully retained on this layer.';
  }

  return "This week's system capacity has been reached. Continuity resumes next week.";
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
      "No deeper product tier exists above Pro. The current pause is only about this week's available capacity.",
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

export function getUpgradeButtonLabel(plan: Plan): string | null {
  if (plan === 'free') return 'Unlock deeper layers';
  if (plan === 'basic') return 'Unlock intelligence layer';
  return null;
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
      eyebrow: 'Memory Continuity',
      title: 'Full continuity unlocks in deeper system layers',
      detail:
        plan === 'free'
          ? 'Next cycle will build on this direction. This cycle is not contributing to full system learning.'
          : 'You already have full continuity on Basic. Intelligence depth expands your signal, not your archive access.',
    };
  }

  if (context === 'reference') {
    return {
      eyebrow: 'System Depth',
      title: plan === 'free' ? 'Deeper system layers available' : 'Reference intelligence is sealed on this plan',
      detail:
        plan === 'free'
          ? 'Continuity expands with access. More patterns emerge at higher system depth when references are connected.'
          : 'You are approaching deeper system layers. Pro adds the deeper reference and competitor texture layer during research.',
    };
  }

  if (context === 'learning') {
    return {
      eyebrow: 'Learning Resolution',
      title: plan === 'free' ? 'Deeper signal layers available' : 'More patterns emerge at higher system depth',
      detail:
        plan === 'free'
          ? 'You are approaching deeper system layers. Expanding access gives the learning loop historical traction to accurately shape your strategy.'
          : 'You are gaining access to higher system depth. Pro pairs deeper market baseline data with more weekly testing room.',
    };
  }

  return {
    eyebrow: 'Signal Depth',
    title: plan === 'free' ? 'Deeper signal layers available' : 'Approaching deeper system layers',
    detail:
      plan === 'free'
        ? 'More patterns emerge at higher system depth. Continuity expands with access to live LinkedIn signals.'
        : 'You are gaining access to higher system depth. Pro feeds direct references into your strategy when you need them.',
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
  if (plan === 'basic') {
    return [
      'Connecting to strategy engine...',
      'Loading audience and tone context...',
      'Scanning operating signal layer...',
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

export const HISTORY_LOCK_MESSAGE = 'Extended memory continuity is sealed at this layer. Partial continuity is retained across cycles.';

// ─── PaywallModal ───────────────────────────────────────────────────────────

export const PAYWALL_WHY_UPGRADE =
  'You are approaching deeper system layers. Continuity expands with access.';

export const PAYWALL_BASIC_FEATURES = [
  'Expanded market pattern signals',
  'Dual strategy path extraction',
  'Partial memory continuity across cycles',
  'Directional learning influence',
];

export const PAYWALL_PRO_FEATURES = [
  'Full live pattern landscape',
  'Complete strategy path extraction',
  'Full memory continuity chain',
  'Adaptive learning-driven system behavior',
  'Direct reference integration',
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
      'Expanded strategy path extraction stays sealed',
      'Memory continuity pauses at this cycle',
      'The deepest live signal and reference layers stay sealed',
    ];
  }

  if (plan === 'basic') {
    return [
      'The deepest live signal layer is still sealed above the operating layer',
      'Complete strategy path extraction is restricted',
      'Adaptive learning behavior stays locked without full limit testing',
    ];
  }

  return [
    'No deeper intelligence tier exists above Pro',
    'System continuity resumes next week when capacity resets',
  ];
}
