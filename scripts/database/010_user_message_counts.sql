-- Chat Usage Limits: User Message Counts Table
-- Issue #97: Create daily message counter
-- Issue #98: Implement tier-based usage limits

-- ============================================
-- User Message Counts Table
-- Tracks daily message counts per user for rate limiting
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_message_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_message_counts_user_id
    ON public.user_message_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_message_counts_date
    ON public.user_message_counts(date);
CREATE INDEX IF NOT EXISTS idx_user_message_counts_user_date
    ON public.user_message_counts(user_id, date);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.user_message_counts ENABLE ROW LEVEL SECURITY;

-- Users can view their own message counts
CREATE POLICY "Users can view own message counts"
    ON public.user_message_counts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own message counts
CREATE POLICY "Users can insert own message counts"
    ON public.user_message_counts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own message counts
CREATE POLICY "Users can update own message counts"
    ON public.user_message_counts FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================
CREATE TRIGGER update_user_message_counts_updated_at
    BEFORE UPDATE ON public.user_message_counts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to increment message count (upsert)
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_user_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    INSERT INTO public.user_message_counts (user_id, date, message_count)
    VALUES (p_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        message_count = user_message_counts.message_count + 1,
        updated_at = NOW()
    RETURNING message_count INTO v_count;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to get current day's message count
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT message_count INTO v_count
    FROM public.user_message_counts
    WHERE user_id = p_user_id AND date = CURRENT_DATE;

    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Add subscription_tier column to users table
-- For future subscription management
-- ============================================
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise'));

COMMENT ON COLUMN public.users.subscription_tier IS 'User subscription tier: free, basic, pro, enterprise';

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT ALL ON public.user_message_counts TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_message_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_message_count(UUID) TO authenticated;

COMMENT ON TABLE public.user_message_counts IS 'Daily message counts per user for rate limiting';
COMMENT ON FUNCTION public.increment_user_message_count IS 'Atomically increment user message count for today';
COMMENT ON FUNCTION public.get_user_message_count IS 'Get user message count for today';
