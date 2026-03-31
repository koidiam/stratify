-- Billing tables for Lemon Squeezy Integration

-- subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lemon_squeezy_id VARCHAR NOT NULL UNIQUE,
    variant_id VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- lemon_squeezy_events table (for webhook history & debugging)
CREATE TABLE IF NOT EXISTS public.lemon_squeezy_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR UNIQUE,
    event_name VARCHAR NOT NULL,
    body JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin only / Service role only access for events
ALTER TABLE public.lemon_squeezy_events ENABLE ROW LEVEL SECURITY;
