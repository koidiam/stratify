# Stratify

LinkedIn strategy engine for founders, operators, and subject-matter experts who need a repeatable weekly content system.

Stratify analyzes niche-level LinkedIn signals, extracts strategic patterns, and generates insights, hooks, and post drafts — in a single weekly pipeline run.

**Live:** https://stratify-one-teal.vercel.app

## Stack

- **Framework:** Next.js (App Router)
- **Auth & Database:** Supabase
- **AI:** Groq — Llama 3.3 70B
- **Signal Research:** Apify (LinkedIn scraping layer)
- **Payments:** Lemon Squeezy
- **Email:** Resend
- **Styling:** Tailwind CSS + shadcn/ui

## Local Setup

1. Install dependencies
```bash
   npm install
```

2. Copy environment variables
```bash
   cp .env.example .env.local
```
   Fill in: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GROQ_API_KEY`, `APIFY_API_TOKEN`, `LEMON_SQUEEZY_API_KEY`, `RESEND_API_KEY`

3. Apply database migrations
```bash
   # Run each file in supabase/migrations/ against your Supabase project in order
```

4. Start the dev server
```bash
   npm run dev
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User account and plan data |
| `onboarding` | Niche, audience, tone, and goal configuration |
| `content_history` | Weekly generated insights, hooks, and drafts |
| `usage_tracking` | Weekly generation quota per user |
| `post_feedback` | Post performance metrics for feedback loop |
| `scrape_cache` | Cached Apify research results |
| `apify_usage` | Apify scrape tracking per user |
| `subscriptions` | Lemon Squeezy subscription state |

## Plans

| Plan | Runs/week | Signal source |
|------|-----------|---------------|
| Free | 1 | Cached research |
| Basic | 3 | Cached research |
| Pro | 50 | Live LinkedIn signals |
