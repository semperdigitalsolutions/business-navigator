-- Migration: 015_site_settings.sql
-- Description: Creates site_settings table for key-value configuration store
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- Site Settings Table
-- Key-value store for application configuration
-- ============================================

-- UP MIGRATION
BEGIN;

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.site_settings IS 'Application-wide configuration key-value store';
COMMENT ON COLUMN public.site_settings.key IS 'Unique setting identifier (snake_case)';
COMMENT ON COLUMN public.site_settings.value IS 'Setting value as JSON (can be string, number, boolean, object, or array)';
COMMENT ON COLUMN public.site_settings.category IS 'Setting category for organization (general, credits, ai, features, etc)';
COMMENT ON COLUMN public.site_settings.is_public IS 'Whether this setting is readable by unauthenticated users';
COMMENT ON COLUMN public.site_settings.is_sensitive IS 'Whether this setting contains sensitive data (hidden in admin UI)';

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_site_settings_key
    ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category
    ON public.site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_public
    ON public.site_settings(is_public);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view public settings
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.site_settings;
CREATE POLICY "Anyone can view public settings"
    ON public.site_settings FOR SELECT
    USING (is_public = true);

-- Authenticated users can view non-sensitive settings
DROP POLICY IF EXISTS "Authenticated can view non-sensitive settings" ON public.site_settings;
CREATE POLICY "Authenticated can view non-sensitive settings"
    ON public.site_settings FOR SELECT
    TO authenticated
    USING (is_sensitive = false);

-- Only service role can manage settings
DROP POLICY IF EXISTS "Service role can manage site settings" ON public.site_settings;
CREATE POLICY "Service role can manage site settings"
    ON public.site_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helper function to get setting value
-- ============================================
CREATE OR REPLACE FUNCTION public.get_site_setting(p_key TEXT)
RETURNS JSONB AS $$
DECLARE
    v_value JSONB;
BEGIN
    SELECT value INTO v_value
    FROM public.site_settings
    WHERE key = p_key;

    RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Helper function to set setting value
-- ============================================
CREATE OR REPLACE FUNCTION public.set_site_setting(
    p_key TEXT,
    p_value JSONB,
    p_description TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'general',
    p_is_public BOOLEAN DEFAULT false,
    p_is_sensitive BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.site_settings (key, value, description, category, is_public, is_sensitive)
    VALUES (p_key, p_value, p_description, p_category, p_is_public, p_is_sensitive)
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, site_settings.description),
        category = EXCLUDED.category,
        is_public = EXCLUDED.is_public,
        is_sensitive = EXCLUDED.is_sensitive,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Seed default settings
-- ============================================
INSERT INTO public.site_settings (key, value, description, category, is_public, is_sensitive)
VALUES
    -- General settings
    ('site_name', '"Business Navigator"'::jsonb, 'Application display name', 'general', true, false),
    ('site_tagline', '"AI-Powered Business Formation"'::jsonb, 'Application tagline', 'general', true, false),
    ('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode', 'general', true, false),
    ('maintenance_message', '"We are performing scheduled maintenance. Please check back soon."'::jsonb, 'Maintenance mode message', 'general', true, false),

    -- Credit system settings
    ('default_credits_on_signup', '100'::jsonb, 'Credits given to new free tier users', 'credits', false, false),
    ('credit_expiration_days', '365'::jsonb, 'Days until purchased credits expire (0 = never)', 'credits', false, false),
    ('max_credits_balance', '100000'::jsonb, 'Maximum credit balance a user can have', 'credits', false, false),
    ('credit_purchase_enabled', 'true'::jsonb, 'Whether users can purchase additional credits', 'credits', false, false),

    -- AI settings
    ('default_ai_model', '"gpt-4o-mini"'::jsonb, 'Default AI model for new users', 'ai', false, false),
    ('ai_response_max_tokens', '4096'::jsonb, 'Maximum tokens in AI responses', 'ai', false, false),
    ('ai_temperature', '0.7'::jsonb, 'Default AI temperature setting', 'ai', false, false),

    -- Feature toggles (see also feature_flags table)
    ('signup_enabled', 'true'::jsonb, 'Whether new user registration is enabled', 'features', true, false),
    ('waitlist_enabled', 'false'::jsonb, 'Whether to show waitlist instead of signup', 'features', true, false),
    ('byok_enabled', 'true'::jsonb, 'Whether Bring Your Own Key feature is enabled', 'features', false, false),

    -- Rate limiting
    ('rate_limit_enabled', 'true'::jsonb, 'Whether rate limiting is enabled', 'security', false, false),
    ('rate_limit_window_seconds', '3600'::jsonb, 'Rate limit window in seconds', 'security', false, false)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_public = EXCLUDED.is_public,
    updated_at = NOW();

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_site_setting(TEXT) TO authenticated;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.set_site_setting(TEXT, JSONB, TEXT, TEXT, BOOLEAN, BOOLEAN);
-- DROP FUNCTION IF EXISTS public.get_site_setting(TEXT);
-- DROP TABLE IF EXISTS public.site_settings CASCADE;
-- COMMIT;
