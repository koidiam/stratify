# Stratify Finalization Checklist

## Product

- [x] Supabase auth flow is wired
- [x] Onboarding persists profile strategy data
- [x] Generate flow returns insights, hooks, and posts
- [x] Apify LinkedIn research layer is connected with cache safety
- [x] Resend onboarding email integration is added

## UI

- [x] Landing page refreshed with a more premium direction
- [x] Auth screen moved to a more polished production look
- [x] Final browser-level visual QA

## Data / Infra

- [x] Initial schema migration exists
- [x] Apify Phase 2 migration exists
- [ ] Apply `supabase/migrations/20260328170000_apify_phase2.sql` in the target Supabase project if needed
  *(Not: Bunu Supabase panelinizden sizin manuel çalıştırdığınız varsayılmaktadır)*

## Verification

- [x] `npm run lint`
- [x] `npm run build`
- [x] Live smoke test with real auth and generate flow

## Release

- [x] Attach GitHub remote
- [x] Commit changes
- [x] Push branch
