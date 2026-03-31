-- Email tracking columns for usage_tracking table
-- These prevent duplicate warning/limit emails within the same week.
-- When a new week starts, a new usage_tracking row is created (or upserted),
-- so these flags are naturally reset via DEFAULT false — no manual reset needed.

ALTER TABLE public.usage_tracking
  ADD COLUMN IF NOT EXISTS warning_email_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS limit_email_sent BOOLEAN DEFAULT false;
