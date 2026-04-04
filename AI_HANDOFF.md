# Stratify AI Handoff

This file is a single-share context doc for external AI systems to quickly understand the current state of the Stratify product and codebase.

## Product Summary

Stratify is not an AI writing tool.
Stratify is a LinkedIn strategy engine.

The product is designed to feel like a weekly operating system:

- market input enters
- signals are extracted
- strategy directions are formed
- hooks and drafts are produced as downstream artifacts
- feedback is retained and reused in future cycles

The UX direction is dark-premium, restrained, system-like, and operational rather than chat-like or marketing-heavy.

Live app:
- https://stratify-one-teal.vercel.app

## Core User Journey

1. User lands on the marketing homepage.
2. User signs up or logs in with Supabase auth.
3. User completes onboarding:
   niche, target audience, tone, optional references, optional goal.
4. User enters Dashboard, which acts as the current weekly operating surface.
5. User runs a weekly strategy pass from Generate.
6. System shows signal proof, strategy insights, paths, and draft outputs.
7. System stores the weekly cycle in history and increments weekly usage.
8. User can log post-performance feedback.
9. Dashboard, Generate, and History reuse retained memory and feedback context.
10. User manages plan and profile from Settings.

## Main Routes

Public / marketing:

- `/`:
  landing page
- `/login`:
  auth login
- `/register`:
  auth registration
- `/privacy`
- `/terms`
- `/contact`

Protected app:

- `/onboarding`:
  onboarding wizard
- `/dashboard`:
  weekly operating state, learning signals, next action
- `/generate`:
  strategy run console and staged output flow
- `/history`:
  retained operating memory across weekly cycles
- `/settings`:
  system depth / plan management, profile, retrain onboarding, destructive actions

## Product Positioning

The product should currently feel like:

- signal interpretation
- decision support
- strategic direction generation
- weekly operating memory
- visible learning and adaptation

It should not feel like:

- a generic AI writer
- a chat assistant
- a static content generator
- a dead archive of old runs

## Product Plans

Canonical plan source:

- `profiles.plan`

Current plan framing in-product:

- `free`:
  Surface Layer
- `basic`:
  Operating Layer
- `pro`:
  Intelligence Layer

Current commercial reality:

- `free`:
  1 run/week, cached signal basis, only newest retained cycle open
- `basic`:
  3 runs/week, full retained history, usable weekly operating loop
- `pro`:
  50 runs/week, deepest live/reference intelligence framing and full continuity

Important implementation nuance:

- the current backend still allows non-free trend scraping, so `basic` can receive live trend input in some runs
- `pro` remains the tier with the deepest reference / intelligence framing
- monetization was rebuilt around system depth and continuity, not pricing changes
- Lemon Squeezy billing flow was not changed

## Onboarding Model

The onboarding setup captures:

- `niche`
- `target_audience`
- `tone`
- optional `goal`
- optional `reference_posts`

Current niche options:

- `saas_founder`
- `developer`
- `freelancer`
- `creator`

Important current behavior:

- if onboarding is already completed and niche exists, `/onboarding` redirects to `/dashboard`
- using "Retrain Strategy Model" in settings resets only `onboarding_completed`
- retraining no longer resets paid plans back to free
- onboarding UI now follows the same dark-premium product language as the app

## Generate Pipeline

Primary generation endpoint:

- `/api/generate`

High-level backend pipeline:

1. Verify authenticated user.
2. Read `profiles.plan` and `onboarding_completed`.
3. Read onboarding context from `onboarding`.
4. Enforce weekly usage limits from `usage_tracking`.
5. Build LinkedIn research context:
   cached or live depending on plan and available signal path.
6. Read recent `post_feedback` and derive learning context.
7. Build insight prompt.
8. Call Groq for structured strategic insight generation.
9. Validate insight JSON.
10. Enrich insights with basis / signal strength / strategic fallback fields.
11. Build content prompt using onboarding + insights + LinkedIn content context.
12. Call Groq for hooks/posts generation.
13. Validate final content JSON.
14. Upsert weekly result into `content_history`.
15. Increment weekly usage.
16. Return a `WeeklyGeneration` payload to the client.

High-level frontend generate flow:

1. Pre-run console shows run readiness, market basis, learning context, and output chain.
2. Loading state advances through explicit pipeline stages:
   context load, market basis, signal extraction, strategy formation, path compilation, run packaging.
3. Results are staged as:
   Signals -> Strategy Paths -> Draft Editor.
4. Limit and locked states are framed as system-capacity / sealed-depth states rather than generic blockers.

## WeeklyGeneration Payload

Current generation payload includes core output plus more proof and learning context.

Main fields:

- `history_id`
- `week_number`
- `year`
- `insights`
- `ideas`
- `hooks`
- `posts`
- optional `researchUsed`
- optional `trendPostCount`
- optional `researchSummary`
- optional `learningSummary`

Important insight contract additions:

- `pattern`
- `implication`
- `recommended_move`
- `risk`
- optional `basis`
- optional `signal_strength`

These are parsed defensively so older history entries can still render.

## Research Layer

LinkedIn research is handled via Apify.

Purpose:

- ground strategy runs in real market context
- support signal proof on the frontend
- optionally use reference texture during deeper research

Current behavior:

- `free`:
  no live scrape, cached context only
- `basic`:
  operating layer with full continuity, and live trend input can still be available in current backend behavior
- `pro`:
  deepest research framing, including reference intelligence when available

Research proof now surfaces:

- source mode:
  cached / live / limited
- approximate scanned and retained sample counts when safely available
- trend layer status
- reference layer status
- filter audit:
  low-signal filtering and hiring-style exclusion

Quality protection currently implemented:

- engagement filter removes low-signal posts
- job-post style content is filtered out before insight context if content contains 2+ hiring phrases
- cache TTL is active to limit live scrape frequency

Cost control:

- `trendLimitPerSource` is reduced to `8`
- `referencePostLimit` is reduced to `2`

## Insight Layer

Insights were rebuilt away from generic commentary and toward decision objects.

Each insight is intended to communicate:

- the strategic signal
- the detected pattern
- why it matters
- what move follows
- what constraint / risk exists
- what real basis supports it

The UI now uses more analytical framing such as:

- Strategic Signal
- Pattern Signal
- Strategic Implication
- Recommended Move
- Constraint / Risk
- Signal Basis

Insight ordering now prefers stronger evidence-backed items when enough real support exists.

## Learning Loop / Feedback Intelligence

Feedback source of truth:

- `post_feedback`

The system now tries to make learning visible rather than hidden.

Current learning behavior:

- Dashboard shows learning signals when real feedback exists
- Generate shows learning context before the next run
- History shows learning notes per cycle when feedback exists
- the backend derives a structured `learningSummary` from recent retained cycles and feedback

Current learning signals can include:

- whether performance data exists at all
- whether the system only has early vs directional feedback
- stronger and weaker path types when comparison is honest
- latest operator note
- repeated pattern / drift awareness across recent cycles

Important honesty constraint:

- learning is heuristic, not a true ML optimization layer
- the product should not claim causal improvement or fake analytics

## Dashboard Behavior

Dashboard is no longer just a CTA page.
It acts as the weekly operating surface.

Current dashboard responsibilities:

- show current weekly state
- show whether a cycle exists this week
- show current strategic / memory context
- show current learning signals
- show available capacity
- determine the next best action
- surface subtle live system feedback such as recent cycle/feedback freshness
- keep the primary action visually dominant over the support rail

Typical next-action states:

- run this week’s strategy pass
- review this week’s cycle
- revisit retained memory
- review deeper system layers when current capacity is exhausted

## Generate Behavior

Generate is now an engine console, not a generic result screen.

Current behavior includes:

- explicit staged loading pipeline
- visible run manifest
- market basis framing
- learning context framing
- result dependency chain:
  Signals -> Strategy Paths -> Draft Editor
- contextual locked-depth hints when signal/reference/learning layers are partial or sealed
- subtle live status signals such as active engine state and recent run freshness
- center column carries the strongest visual weight; right rail stays secondary

The page should feel like a believable system run, not:

- click button
- spinner
- AI blob

## History Behavior

History is no longer framed as a simple archive.
It is intended to feel like retained operating memory.

Current history behavior:

- shows previous weekly cycles as retained strategy memory
- surfaces signal memory, execution direction, hooks/output bias, and feedback state when available
- free users can only access the newest retained cycle
- older cycles on free are framed as a protected continuity layer, not broken UI
- basic/pro users can access full retained history
- learning layer now surfaces memory freshness and feedback-sync state

Important limitation:

- `content_history` is still cycle-based and generally one retained record per week
- it is not a full multi-version run timeline

## Monetization / Paywall Layer

Monetization was rebuilt around value depth rather than generic limit language.

Current in-product monetization principles:

- free = limited access to system depth
- basic = usable weekly operating system with continuity
- pro = deepest intelligence layer

Upgrade surfaces are now tied to value moments such as:

- locked continuity in history
- partial learning resolution
- sealed reference intelligence
- limited market depth
- weekly capacity gates

Important constraint:

- monetization copy was rebuilt
- pricing numbers and Lemon Squeezy logic were not changed

## Settings Behavior

Settings currently covers:

- system depth / plan management
- profile name update
- current email display
- retrain strategy model
- account deletion

Plan management now presents the tiers as depth layers instead of generic feature buttons.

Retrain behavior:

- sets `profiles.onboarding_completed = false`
- redirects user to onboarding
- plan remains unchanged

## Data Model

Primary tables:

- `profiles`:
  auth-linked user record, plan, onboarding status, billing fields
- `onboarding`:
  niche/audience/tone/goal/reference context
- `content_history`:
  weekly stored generations
- `usage_tracking`:
  weekly generation counters + warning flags
- `post_feedback`:
  performance metrics + notes
- `scrape_cache`:
  cached Apify responses
- `apify_usage`:
  research usage tracking
- `subscriptions`:
  billing subscription state

Auth source:

- Supabase Auth

## Current Technical Notes

Important current files touched heavily in the recent rebuild:

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/generate/page.tsx`
- `app/(dashboard)/history/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `app/globals.css`
- `app/api/generate/route.ts`
- `components/billing/PaywallModal.tsx`
- `components/generate/InsightViewer.tsx`
- `components/system/LiveStatus.tsx`
- `components/settings/PlanManager.tsx`
- `lib/apify/cache.ts`
- `lib/apify/linkedin.ts`
- `lib/constants/plan-copy.ts`
- `lib/prompts/content.prompt.ts`
- `lib/prompts/insight.prompt.ts`
- `lib/utils/history.ts`
- `lib/utils/learning.ts`
- `lib/utils/parsers.ts`
- `types/index.ts`

Current validation state:

- `npm run lint` passes with existing warnings in:
  - `components/layout/AnimatedBackground.tsx`
  - `components/onboarding/steps/GoalStep.tsx`
  - `components/onboarding/steps/ToneStep.tsx`
  - `lib/groq/client.ts`
- `npm run build` passes
- Next.js still warns that `middleware.ts` should move to `proxy.ts`

## Current UI Direction

The app structure is now in a strong place.
The current refinement priority is no longer layout correction.

The UI should now preserve:

- one clear purpose per page
- strong primary CTA emphasis
- compressed support copy
- minimal right-rail competition
- system-like wording instead of generic SaaS phrasing
- subtle depth and motion only where they improve scan speed or feedback

The UI should continue to avoid:

- card-grid thinking
- equal-weight sections
- generic marketing copy inside protected product surfaces
- decorative gradients, glass, or flashy animation
