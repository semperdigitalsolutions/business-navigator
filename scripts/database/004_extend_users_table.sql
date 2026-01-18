-- Extend Users Table with Onboarding and OAuth Fields
-- Week 2: Epic 1 - Authentication & Onboarding

-- Add onboarding completion tracking to users table
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Function to sync onboarding completion status from onboarding_sessions to users
CREATE OR REPLACE FUNCTION sync_user_onboarding_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = TRUE THEN
        UPDATE public.users
        SET
            onboarding_completed = TRUE,
            onboarding_completed_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update users table when onboarding is completed
CREATE TRIGGER sync_user_onboarding_trigger
    AFTER INSERT OR UPDATE ON public.onboarding_sessions
    FOR EACH ROW
    WHEN (NEW.completed = TRUE)
    EXECUTE FUNCTION sync_user_onboarding_status();

-- Create user_oauth_providers table to track OAuth connections
CREATE TABLE IF NOT EXISTS public.user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'apple')),
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,
    provider_avatar_url TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_oauth_providers_user_id ON public.user_oauth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_oauth_providers_provider ON public.user_oauth_providers(provider);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users(onboarding_completed);

-- Row Level Security for OAuth providers
ALTER TABLE public.user_oauth_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own OAuth providers"
    ON public.user_oauth_providers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own OAuth providers"
    ON public.user_oauth_providers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OAuth providers"
    ON public.user_oauth_providers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own OAuth providers"
    ON public.user_oauth_providers FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_oauth_providers_updated_at
    BEFORE UPDATE ON public.user_oauth_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.user_oauth_providers TO authenticated;

-- Comments
COMMENT ON COLUMN public.users.onboarding_completed IS 'Whether user has completed the 7-step onboarding wizard';
COMMENT ON COLUMN public.users.avatar_url IS 'User avatar URL (from OAuth or uploaded)';
COMMENT ON TABLE public.user_oauth_providers IS 'OAuth provider connections (Google, GitHub, Apple)';
