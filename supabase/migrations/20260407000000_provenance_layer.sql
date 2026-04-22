-- Add provenance columns to content_history
ALTER TABLE public.content_history 
ADD COLUMN IF NOT EXISTS research_summary jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS learning_summary jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS run_logic_summary text DEFAULT NULL;

-- Backfill or documentation note: existing rows will have NULLs which is fine
