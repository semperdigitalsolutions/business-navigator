-- Migration: 018_feature_flags.sql
-- Description: Creates feature_flags table for feature management
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- Feature Flags Table
-- Manage feature rollouts and A/B testing
-- ============================================

-- UP MIGRATION
BEGIN;

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    enabled_for_tiers TEXT[] NOT NULL DEFAULT ARRAY['free', 'basic', 'pro', 'enterprise'],
    enabled_for_users UUID[] NOT NULL DEFAULT '{}',
    rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.feature_flags IS 'Feature flags for controlled feature rollouts';
COMMENT ON COLUMN public.feature_flags.key IS 'Unique feature identifier (snake_case)';
COMMENT ON COLUMN public.feature_flags.is_enabled IS 'Master toggle for the feature';
COMMENT ON COLUMN public.feature_flags.enabled_for_tiers IS 'Subscription tiers that have access';
COMMENT ON COLUMN public.feature_flags.enabled_for_users IS 'Specific user IDs that have access (overrides tier)';
COMMENT ON COLUMN public.feature_flags.rollout_percentage IS 'Percentage of eligible users who see the feature (0-100)';
COMMENT ON COLUMN public.feature_flags.expires_at IS 'Optional expiration date for the flag';

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_feature_flags_key
    ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled
    ON public.feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_expires_at
    ON public.feature_flags(expires_at)
    WHERE expires_at IS NOT NULL;

-- GIN index for array contains searches
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled_for_users
    ON public.feature_flags USING GIN (enabled_for_users);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view feature flags (to check if features are enabled)
DROP POLICY IF EXISTS "Authenticated can view feature flags" ON public.feature_flags;
CREATE POLICY "Authenticated can view feature flags"
    ON public.feature_flags FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can manage feature flags
DROP POLICY IF EXISTS "Service role can manage feature flags" ON public.feature_flags;
CREATE POLICY "Service role can manage feature flags"
    ON public.feature_flags FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to check if feature is enabled for user
-- ============================================
CREATE OR REPLACE FUNCTION public.is_feature_enabled(
    p_feature_key TEXT,
    p_user_id UUID DEFAULT NULL,
    p_user_tier TEXT DEFAULT 'free'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_flag RECORD;
    v_hash INTEGER;
BEGIN
    -- Get the feature flag
    SELECT * INTO v_flag
    FROM public.feature_flags
    WHERE key = p_feature_key;

    -- Feature doesn't exist
    IF v_flag IS NULL THEN
        RETURN false;
    END IF;

    -- Master toggle is off
    IF NOT v_flag.is_enabled THEN
        RETURN false;
    END IF;

    -- Check if expired
    IF v_flag.expires_at IS NOT NULL AND v_flag.expires_at < NOW() THEN
        RETURN false;
    END IF;

    -- Check if user is in explicit allow list
    IF p_user_id IS NOT NULL AND p_user_id = ANY(v_flag.enabled_for_users) THEN
        RETURN true;
    END IF;

    -- Check if user's tier is allowed
    IF NOT (p_user_tier = ANY(v_flag.enabled_for_tiers)) THEN
        RETURN false;
    END IF;

    -- Check rollout percentage (deterministic based on user_id + feature_key)
    IF v_flag.rollout_percentage < 100 AND p_user_id IS NOT NULL THEN
        -- Create a deterministic hash from user_id and feature_key
        v_hash := abs(hashtext(p_user_id::text || ':' || p_feature_key)) % 100;
        IF v_hash >= v_flag.rollout_percentage THEN
            RETURN false;
        END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Function to get all enabled features for user
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_features(
    p_user_id UUID,
    p_user_tier TEXT DEFAULT 'free'
)
RETURNS TABLE (
    key TEXT,
    name TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ff.key,
        ff.name,
        ff.metadata
    FROM public.feature_flags ff
    WHERE public.is_feature_enabled(ff.key, p_user_id, p_user_tier);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Seed default feature flags
-- ============================================
INSERT INTO public.feature_flags (key, name, description, is_enabled, enabled_for_tiers, rollout_percentage)
VALUES
    -- Core features
    ('chat_v2', 'Chat V2 Interface', 'New chat interface with improved UX', false, ARRAY['free', 'basic', 'pro', 'enterprise'], 0),
    ('byok', 'Bring Your Own Key', 'Allow users to use their own API keys', true, ARRAY['basic', 'pro', 'enterprise'], 100),
    ('multiple_businesses', 'Multiple Businesses', 'Support for multiple business profiles', true, ARRAY['pro', 'enterprise'], 100),
    ('advanced_analytics', 'Advanced Analytics', 'Detailed usage and progress analytics', true, ARRAY['pro', 'enterprise'], 100),
    ('api_access', 'API Access', 'Programmatic API access', true, ARRAY['pro', 'enterprise'], 100),
    ('export_pdf', 'PDF Export', 'Export business plan to PDF', true, ARRAY['basic', 'pro', 'enterprise'], 100),
    ('export_excel', 'Excel Export', 'Export data to Excel', true, ARRAY['basic', 'pro', 'enterprise'], 100),

    -- Experimental features
    ('dark_mode', 'Dark Mode', 'Dark theme support', false, ARRAY['free', 'basic', 'pro', 'enterprise'], 0),
    ('ai_suggestions', 'AI Suggestions', 'Proactive AI suggestions based on progress', false, ARRAY['basic', 'pro', 'enterprise'], 50),
    ('voice_input', 'Voice Input', 'Voice-to-text for chat', false, ARRAY['pro', 'enterprise'], 0),

    -- Admin features
    ('admin_dashboard', 'Admin Dashboard', 'Admin dashboard access', true, ARRAY[]::TEXT[], 100)
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT SELECT ON public.feature_flags TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_feature_enabled(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_features(UUID, TEXT) TO authenticated;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.get_user_features(UUID, TEXT);
-- DROP FUNCTION IF EXISTS public.is_feature_enabled(TEXT, UUID, TEXT);
-- DROP TABLE IF EXISTS public.feature_flags CASCADE;
-- COMMIT;
