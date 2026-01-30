-- Seed Data: Site Settings
-- Issue #218: Create Seed Data for Tiers and Models
-- Part of Epic 9: Data-Driven Credits & Tier System (#186)
--
-- This script populates the site_settings table with default configuration values.
-- Idempotent: Uses ON CONFLICT to handle re-runs safely.
--
-- Prerequisites: Run 013_site_settings.sql migration first

-- ============================================
-- Site Settings Seed Data
-- ============================================
-- Note: Uses 'key' as the unique constraint for idempotency
-- is_sensitive settings should not be exposed to the frontend

INSERT INTO public.site_settings (
    key,
    value,
    description,
    category,
    is_sensitive
) VALUES
    -- ============================================
    -- AI Configuration Settings
    -- ============================================
    (
        'default_model_id',
        '"openai/gpt-4o-mini"'::jsonb,
        'Default AI model for new users and fallback scenarios',
        'ai',
        false
    ),
    (
        'default_provider',
        '"openrouter"'::jsonb,
        'Default AI provider (openrouter, openai, anthropic)',
        'ai',
        false
    ),
    (
        'ai_temperature',
        '0.7'::jsonb,
        'Default temperature for AI responses (0.0 - 2.0)',
        'ai',
        false
    ),
    (
        'ai_max_tokens',
        '4096'::jsonb,
        'Default maximum tokens for AI responses',
        'ai',
        false
    ),
    (
        'ai_request_timeout_ms',
        '60000'::jsonb,
        'Timeout for AI requests in milliseconds',
        'ai',
        false
    ),

    -- ============================================
    -- Billing & Credits Settings
    -- ============================================
    (
        'credits_system_enabled',
        'false'::jsonb,
        'Enable the new credits-based billing system (false = legacy message limits)',
        'billing',
        false
    ),
    (
        'signup_bonus_credits',
        '50'::jsonb,
        'Bonus credits given to new users upon signup',
        'billing',
        false
    ),
    (
        'referral_bonus_credits',
        '100'::jsonb,
        'Bonus credits for successful referrals (both referrer and referee)',
        'billing',
        false
    ),
    (
        'min_credit_purchase',
        '100'::jsonb,
        'Minimum credits that can be purchased in a single transaction',
        'billing',
        false
    ),
    (
        'credit_pack_prices',
        '{"100": 499, "500": 1999, "1000": 3499, "5000": 14999}'::jsonb,
        'Credit pack sizes and prices in cents (e.g., 100 credits = $4.99)',
        'billing',
        false
    ),

    -- ============================================
    -- General Platform Settings
    -- ============================================
    (
        'maintenance_mode',
        'false'::jsonb,
        'Enable maintenance mode (blocks all user access except admins)',
        'general',
        false
    ),
    (
        'maintenance_message',
        '"We are performing scheduled maintenance. Please check back soon."'::jsonb,
        'Message displayed during maintenance mode',
        'general',
        false
    ),
    (
        'platform_name',
        '"Business Navigator"'::jsonb,
        'Platform display name',
        'general',
        false
    ),
    (
        'support_email',
        '"support@businessnavigator.ai"'::jsonb,
        'Support email address shown to users',
        'general',
        false
    ),
    (
        'max_businesses_free_tier',
        '1'::jsonb,
        'Maximum businesses allowed for free tier users',
        'general',
        false
    ),

    -- ============================================
    -- Rate Limiting Settings
    -- ============================================
    (
        'rate_limit_requests_per_minute',
        '30'::jsonb,
        'Maximum API requests per minute per user',
        'security',
        false
    ),
    (
        'rate_limit_messages_per_hour',
        '100'::jsonb,
        'Maximum chat messages per hour per user',
        'security',
        false
    ),
    (
        'rate_limit_burst_size',
        '10'::jsonb,
        'Maximum burst of requests before rate limiting kicks in',
        'security',
        false
    ),

    -- ============================================
    -- Security Settings
    -- ============================================
    (
        'session_timeout_hours',
        '24'::jsonb,
        'Hours before user session expires',
        'security',
        false
    ),
    (
        'max_login_attempts',
        '5'::jsonb,
        'Maximum failed login attempts before temporary lockout',
        'security',
        false
    ),
    (
        'lockout_duration_minutes',
        '15'::jsonb,
        'Duration of account lockout after max failed attempts',
        'security',
        false
    ),
    (
        'api_key_hash_algorithm',
        '"argon2id"'::jsonb,
        'Algorithm used for hashing API keys',
        'security',
        true
    ),

    -- ============================================
    -- Feature Configuration
    -- ============================================
    (
        'onboarding_required',
        'true'::jsonb,
        'Require users to complete onboarding before accessing main features',
        'general',
        false
    ),
    (
        'chat_history_retention_days',
        '365'::jsonb,
        'Number of days to retain chat history',
        'general',
        false
    ),
    (
        'allow_user_api_keys',
        'true'::jsonb,
        'Allow users to provide their own API keys',
        'general',
        false
    )

ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_sensitive = EXCLUDED.is_sensitive,
    updated_at = NOW();

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the seed data was inserted correctly:
-- SELECT key, value, category, is_sensitive
-- FROM public.site_settings
-- ORDER BY category, key;

COMMENT ON TABLE public.site_settings IS 'Global platform configuration. Seeded via seed_settings.sql';
