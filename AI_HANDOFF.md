# Stratify AI Handoff

This file is a single-share context doc for external AI systems to quickly understand the current state of the Stratify product and codebase.

## Product Summary

Stratify is not an AI writing tool.
Stratify is a LinkedIn strategy engine.

The product is designed to feel like an adaptive **Weekly Operating System**:
- market input enters
- signals are extracted
- **Intelligence Layer** interprets trends and learning signals
- **Proof Layer** grounds every claim in observable data
- strategy directions are formed
- hooks and drafts are produced as downstream artifacts
- feedback is retained in a **Memory Continuity Chain**
- the system evolves its strategy based on prior cycles

The UX direction is dark-premium, restrained, system-like, and operational rather than chat-like or marketing-heavy.

Live app:
- https://stratify-one-teal.vercel.app

## Tech Stack & Architecture

- **Framework**: Next.js 16.2.1 (App Router)
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`
- **Animations**: Framer Motion
- **Database & Auth**: Supabase (SSR package, Row Level Security)
- **Billing**: Lemon Squeezy (Webhooks and Checkout APIs implemented)
- **AI Backend**: Groq (Llama 3.3 70B Model) - *Migrated from Gemini*
- **Icons**: Lucide React

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `LEMON_SQUEEZY_API_KEY`, `LEMON_SQUEEZY_STORE_ID`, `LEMON_SQUEEZY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

*Note on Local Development:*
Run `npm run dev` to start the local development server.

## Repository Structure Map

To efficiently navigate the codebase and "see" the whole site, AIs should reference these key directories:

- **`app/`**: Next.js App Router. Contains all pages, layouts, and API routes.
  - `app/(marketing)/` & `app/page.tsx`: Landing page and public routes.
  - `app/(auth)/`: Login and registration pages.
  - `app/(dashboard)/`: Protected routes (dashboard, generate, history, settings).
  - `app/api/`: Backend API routes (generate, checkout, webhooks).
- **`components/`**: React components, strictly organized by domain:
  - `components/marketing/`: Landing page sections (e.g., `LandingPage.tsx`).
  - `components/dashboard/`: Dashboard state HUD and quick actions.
  - `components/generate/`: Execution console, insight viewer, hook selection, editor.
  - `components/history/`: Memory chain and feedback loops.
  - `components/settings/`: Operator config and billing management.
  - `components/ui/`: Shared primitive components (buttons, inputs, dialogs, etc.).
- **`lib/`**: Utilities and core configuration.
  - `lib/constants/plan-copy.ts`: **CRITICAL SOURCE OF TRUTH** for all monetization strings and loss signals.
  - `lib/supabase/`: Database clients.
- **`types/`**: TypeScript interfaces, specifically `types/database.types.ts` for Supabase schema.

*Instructions for AIs: Prioritize reading files in `components/marketing/` and `app/(dashboard)/` to understand the current visual language. Read `plan-copy.ts` before modifying any upgrade CTA.*

## Core User Journey

1. User lands on the marketing homepage (Designed as a system-behavior visualization with 3-core visual blocks: Input, Interpretation, Output).
2. User signs up or logs in with Supabase auth.
3. User completes onboarding: niche, target audience, tone, optional references, optional goal.
4. User enters Dashboard, which acts as a state-driven **System Surface Area**.
   - Surfaces **System Direction** (a quiet whisper of moving trends).
   - Surfaces **Proof Signals** (why the system is moving that way).
5. User runs a weekly pass from Generate (**Execution Console**).
   - Displays **System Intelligence Strip**: Trend, Learning Signal, and Reason Anchor.
   - Grounded in **Observable Counts** (e.g., "6 mention [topic]").
6. System shows signal proof, strategy paths (some sealed), and draft outputs.
   - Each insight shows **Micro-Provenance** ("Observed in X/Y signals").
   - Each path shows **Strategic Rationale** ("Matches signal pattern").
7. System stores the cycle in **History (Memory Continuity Chain)**.
   - Each card explains the **System Shift** ("What changed") and the **Because** ("Why it changed").
8. User can log post-performance feedback (Learning).
9. Dashboard, Generate, and History reuse retained memory and feedback to evolve the strategy.
10. User manages plan and profile from Settings (Profile name updates are synchronized with Supabase Auth Metadata).

## Main Routes

Public / marketing:
- `/`: landing page
- `/login`: auth login
- `/register`: auth registration
- `/privacy`
- `/terms`
- `/contact`

Protected app:
- `/onboarding`: onboarding wizard
- `/dashboard`: weekly operating state, intelligence whispers, single focus CTA
- `/generate`: execution console with intelligence strip and staged output
- `/history`: memory continuity chain, system shifts, and feedback integration
- `/settings`: system identity, operator config, plan/depth controls

## Product Positioning

The product should currently feel like:
- **Evolving Intelligence** (not static generation)
- **Grounded Observation** (provenance over guesses)
- **Strategy Continuity** (cycles remember each other)
- **Decision Support** (analytical, not dramatic)
- **Expanding Depth** upon upgrade

It should not feel like:
- a generic SaaS landing page
- a chat assistant
- a static content generator
- a dead archive of old runs
- a hard paywall

## Product Plans

Canonical plan source:
- `profiles.plan` (in DB)

Current plan framing in-product:
- `free`: Surface Layer
- `basic`: Operating Layer
- `pro`: Intelligence Layer

Current commercial reality:
- `free`: 1 cycle/week, cached signal basis, limited memory continuity. Upgrades framed around expanding continuity.
- `basic`: 3 cycles/week, full retained history, usable weekly operating loop. Upgrades framed around reference/intelligence access.
- `pro`: 50 cycles/week, deepest live/reference intelligence framing and full continuity.

Important implementation nuance:
- Monetization has shifted from "limit-based interruptions" to a "desire-based progression layer" (Step X / X.5).
- Blocked features are now framed as "Sealed Layers."
- Capacity limits use loss-signal wording: "System continuity pauses at this layer" instead of "Paywall Hit".

## Onboarding Model

The onboarding setup captures:
- `niche`
- `target_audience`
- `tone`
- optional `goal`
- optional `reference_posts`

Important current behavior:
- if onboarding already completed, `/onboarding` redirects to `/dashboard`
- "Retrain Strategy Model" in settings resets only `onboarding_completed`
- Onboarding UI follows the dark-premium product language
- System identity/Config is highlighted in Settings above operator details

## Generate Pipeline

Primary generation endpoint:
- `/api/generate` (Uses Groq Llama 3.3 70B API)

High-level frontend generate flow:
1. Pre-run console shows run readiness and **System Intelligence Strip** (Trend, Signal, Reason).
2. Loading progresses through explicit stages: Context, Market, Extraction, Formation, Compilation, Packaging.
3. Results are staged: Signals (with **Micro-Provenance**) -> Strategy Paths (with **Rationale**) -> Draft Editor.
4. Higher-level paths/provenance use structural blurs; limit states inform of continuity loss.
5. Below the primary CTA: "This cycle contributes to system learning."

## WeeklyGeneration Payload

Main fields:
- `history_id`, `week_number`, `year`
- `insights`, `ideas`, `hooks`, `posts`
- optional `researchUsed`, `trendPostCount`, `researchSummary`, `learningSummary`
- Structured insight pattern definitions (`pattern`, `implication`, `recommended_move`, `risk`)

## Insight & Strategy Path Layer

Insights are decision objects. Each insight communicates the strategic signal, pattern, why it matters, recommended move, and risks.
Strategy Paths show exactly how the system interprets the insight through the hook structure.

## Feedback Intelligence (Learning Loop)

Feedback source of truth:
- `post_feedback` table in Supabase

The system makes learning visible:
- Dashboard: surfaces current **System Direction** and **Proof**.
- Generate: shows **Intelligence Strip** (e.g., "Trending toward list formats").
- History: surfaces prior operator notes and **Memory Continuity Chain**.
- System Shifts: explicitly explains strategy evolution via **Because** logic.

## Dashboard Behavior (System State Surface)

Dashboard is a state-driven HUD (Heads-Up Display):
1. Surfaces current **System Direction**.
2. Surfaces **Proof** for that direction.
3. Guides toward the single most logical next action.
4. Displays memory state (No Memory -> Cycle Ready -> Completed).

- 1 dominant central block.
- 1 secondary depth strip indicating system/monetization depth.
- Exactly 1 primary CTA at all times strictly mapped to `/generate` or `/history`.

## Landing Page Behavior (System Visualization)

Landing page abandons standard SaaS narrative.
It acts as a literal demonstration of system behavior:
- Minimal Hero containing the active System Loop (Signal -> Pattern -> Strategy -> Draft -> Learning). The Hero uses a 3-block structure (Input -> Interpretation -> Output) with subtle micro-motions for product truth representation.
- Evolution timeline comparison (Week 1 vs Week 4 block)
- Provenance readout terminal (Signal Audit log)
- System Memory chain visualization (Week 1 -> Week 2 -> Week 3 connections)
- Depth-based monetization block (Desire-based triggers)

## Monetization / Paywall Layer (Loss + Action Trigger System)

Monetization explicitly uses progression semantics:
- Free limits are not "blocked" but "Sealed Continuity."
- Instead of "Upgrade to Pro", buttons declare "Unlock deeper layers" or "Access full system depth".
- Loss signals gently enforce technical boundaries ("System continuity pauses at this layer").
- Strategy paths for higher depths are blurred rather than invisible.

## Current Technical Notes & Recent Changes

Important files updated during the systemic rewrite:
- `app/(dashboard)/dashboard/page.tsx`: System state surface controller.
- `app/(dashboard)/generate/page.tsx`: Pipeline view and logic. Added a 3-step progress indicator for the result surface (`[● Signals] ——— [○ Strategy Paths] ——— [○ Draft]`).
- `components/marketing/LandingPage.tsx`: System architecture visualization. **TASK 1 COMPLETE**: The Hero section now uses an explicit 3-block visual system (Input -> Interpretation -> Output) structured as a diagonal cascade with operational truth logic.
- `lib/constants/plan-copy.ts`: Single source of truth for ALL plan depth strings, loss signals, and CTA labels.
- `components/generate/ContentHooks.tsx`: Sealed path UI logic.
- `components/generate/InsightViewer.tsx`: Redesigned into a single-column accordion layout. Signal cards feature dynamic confidence bars, badge styling based on trigger type, and a collapsible detailed view. The "Path Selection Basis" (RunManifest) has been nested at the bottom.
- `app/api/webhooks/lemonsqueezy/route.ts` & `app/api/checkout/route.ts`: Handling LemonSqueezy subscription events.
- `components/settings/ProfileForm.tsx`: Fixes for profile name updates using Supabase user metadata instead of relying strictly on potentially missing DB columns.

## Next Steps (For the Next AI)

**TASK 2**: Extend the "System Behavior" visual language (established in the Hero section of `LandingPage.tsx`) to the remaining sections of the landing page. 
- Do not revert to generic SaaS feature grids or abstract AI blobs.
- Future sections must visualize the system's memory, feedback loop, and analytical depth as operational processes.

## Current UI Direction

The product is structurally complete.
Future priority is NOT new features. Priority is ensuring the operational loops (run -> review -> learn -> next run) perform optimally and accurately.

The UI should continue to avoid:
- Widget grids.
- Artificial metrics cards (unless structurally part of the Learning Engine).
- Flashy SaaS marketing gradients or generic chat abstractions.
- Hard aggressive paywalls that break the user's flow.
