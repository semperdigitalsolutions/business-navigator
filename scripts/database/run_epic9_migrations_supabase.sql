-- ============================================
-- Epic 9: Data-Driven Credits & Tier System
-- Consolidated Migration Script for Supabase SQL Editor
-- ============================================
--
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System
--
-- Description:
-- This is a consolidated single-file version of all Epic 9 migrations.
-- It can be run directly in the Supabase SQL Editor.
--
-- All migrations are idempotent (use IF NOT EXISTS) and can be
-- safely re-run without causing errors.
--
-- Prerequisites:
-- - Migrations 001-010 must already be applied
-- - uuid-ossp extension must be enabled
-- - update_updated_at_column() function must exist
--
-- ============================================

-- ============================================
-- PRE-FLIGHT CHECKS
-- ============================================

DO $$
BEGIN
    -- Check that uuid-ossp extension exists
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'Required extension uuid-ossp is not installed. Run: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
    END IF;

    -- Check that users table exists (from migration 001)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 'Required table public.users does not exist. Run migrations 001-010 first.';
    END IF;

    -- Check that update_updated_at_column function exists (from migration 001)
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        RAISE EXCEPTION 'Required function update_updated_at_column() does not exist. Run migrations 001-010 first.';
    END IF;

    RAISE NOTICE 'Pre-flight checks passed. Starting Epic 9 migrations...';
END $$;


-- ============================================================
-- MIGRATION 011: SUBSCRIPTION TIERS
-- ============================================================

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    monthly_credits INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_monthly_credits CHECK (monthly_credits >= -1),
    CONSTRAINT valid_price_cents CHECK (price_cents >= -1)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_slug ON public.subscription_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_is_active ON public.subscription_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_is_default ON public.subscription_tiers(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_display_order ON public.subscription_tiers(display_order);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active_ordered ON public.subscription_tiers(is_active, display_order) WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active subscription tiers" ON public.subscription_tiers;
CREATE POLICY "Anyone can view active subscription tiers"
    ON public.subscription_tiers FOR SELECT
    USING (is_active = TRUE);

-- Trigger
DROP TRIGGER IF EXISTS update_subscription_tiers_updated_at ON public.subscription_tiers;
CREATE TRIGGER update_subscription_tiers_updated_at
    BEFORE UPDATE ON public.subscription_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure single default function
CREATE OR REPLACE FUNCTION public.ensure_single_default_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.subscription_tiers
        SET is_default = FALSE, updated_at = NOW()
        WHERE id != NEW.id AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_single_default_tier ON public.subscription_tiers;
CREATE TRIGGER enforce_single_default_tier
    BEFORE INSERT OR UPDATE OF is_default ON public.subscription_tiers
    FOR EACH ROW
    WHEN (NEW.is_default = TRUE)
    EXECUTE FUNCTION public.ensure_single_default_tier();

-- Seed tiers
INSERT INTO public.subscription_tiers (name, slug, monthly_credits, price_cents, features, is_default, is_active, display_order)
VALUES
    ('Free', 'free', 50, 0, '["50 AI credits per month", "Basic chat support", "Single business profile", "Community access"]'::jsonb, TRUE, TRUE, 1),
    ('Starter', 'starter', 200, 900, '["200 AI credits per month", "Email support", "Up to 3 business profiles", "Task tracking", "Basic analytics"]'::jsonb, FALSE, TRUE, 2),
    ('Pro', 'pro', 500, 2900, '["500 AI credits per month", "Priority email support", "Unlimited business profiles", "Advanced task management", "Full analytics dashboard", "Document templates"]'::jsonb, FALSE, TRUE, 3),
    ('Business', 'business', 2000, 9900, '["2,000 AI credits per month", "Priority support with 24h response", "Unlimited business profiles", "Team collaboration (up to 5 users)", "Custom document generation", "API access", "Advanced integrations"]'::jsonb, FALSE, TRUE, 4),
    ('Enterprise', 'enterprise', -1, -1, '["Unlimited AI credits", "Dedicated account manager", "24/7 phone & email support", "Unlimited team members", "Custom integrations", "SLA guarantees", "On-premise deployment options", "Custom training & onboarding"]'::jsonb, FALSE, TRUE, 5)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_credits = EXCLUDED.monthly_credits,
    price_cents = EXCLUDED.price_cents,
    features = EXCLUDED.features,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

GRANT SELECT ON public.subscription_tiers TO authenticated;
GRANT SELECT ON public.subscription_tiers TO anon;

COMMENT ON TABLE public.subscription_tiers IS 'Epic 9: Subscription tier definitions for credit-based usage system';


-- ============================================================
-- MIGRATION 012: AI MODELS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    credits_per_message INTEGER NOT NULL DEFAULT 1,
    input_cost_per_1k DECIMAL(10, 6) NOT NULL DEFAULT 0.000000,
    output_cost_per_1k DECIMAL(10, 6) NOT NULL DEFAULT 0.000000,
    context_window INTEGER NOT NULL DEFAULT 4096,
    max_output_tokens INTEGER NOT NULL DEFAULT 4096,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    min_tier TEXT NOT NULL DEFAULT 'free',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_min_tier FOREIGN KEY (min_tier) REFERENCES public.subscription_tiers(slug) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON public.ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_model_id ON public.ai_models(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON public.ai_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_models_min_tier ON public.ai_models(min_tier);
CREATE INDEX IF NOT EXISTS idx_ai_models_sort_order ON public.ai_models(sort_order);

ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active AI models" ON public.ai_models;
CREATE POLICY "Anyone can view active AI models"
    ON public.ai_models FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage AI models" ON public.ai_models;
CREATE POLICY "Service role can manage AI models"
    ON public.ai_models FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP TRIGGER IF EXISTS update_ai_models_updated_at ON public.ai_models;
CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.ai_models (provider, model_id, display_name, description, credits_per_message, input_cost_per_1k, output_cost_per_1k, context_window, max_output_tokens, capabilities, is_default, min_tier, sort_order)
VALUES
    ('openai', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast and efficient for everyday tasks', 1, 0.000150, 0.000600, 128000, 16384, '["function_calling", "vision", "json_mode"]'::jsonb, true, 'free', 1),
    ('openai', 'gpt-4o', 'GPT-4o', 'Most capable OpenAI model for complex tasks', 3, 0.005000, 0.015000, 128000, 16384, '["function_calling", "vision", "json_mode"]'::jsonb, false, 'starter', 2),
    ('openai', 'gpt-4-turbo', 'GPT-4 Turbo', 'High performance with large context', 4, 0.010000, 0.030000, 128000, 4096, '["function_calling", "vision", "json_mode"]'::jsonb, false, 'pro', 3),
    ('anthropic', 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'Fast and affordable for simple tasks', 1, 0.000250, 0.001250, 200000, 4096, '["function_calling", "vision"]'::jsonb, false, 'free', 4),
    ('anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Balanced performance and cost', 2, 0.003000, 0.015000, 200000, 8192, '["function_calling", "vision"]'::jsonb, false, 'starter', 5),
    ('anthropic', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Most capable Anthropic model', 5, 0.015000, 0.075000, 200000, 4096, '["function_calling", "vision"]'::jsonb, false, 'pro', 6),
    ('openrouter', 'meta-llama/llama-3.1-8b-instruct', 'Llama 3.1 8B', 'Open source, fast and free-tier friendly', 1, 0.000055, 0.000055, 131072, 4096, '["function_calling"]'::jsonb, false, 'free', 7),
    ('openrouter', 'meta-llama/llama-3.1-70b-instruct', 'Llama 3.1 70B', 'Powerful open source model', 2, 0.000350, 0.000400, 131072, 4096, '["function_calling"]'::jsonb, false, 'starter', 8),
    ('openrouter', 'google/gemini-pro-1.5', 'Gemini 1.5 Pro', 'Google model with large context', 3, 0.001250, 0.005000, 1000000, 8192, '["function_calling", "vision"]'::jsonb, false, 'pro', 9)
ON CONFLICT (model_id) DO UPDATE SET
    provider = EXCLUDED.provider,
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    credits_per_message = EXCLUDED.credits_per_message,
    input_cost_per_1k = EXCLUDED.input_cost_per_1k,
    output_cost_per_1k = EXCLUDED.output_cost_per_1k,
    context_window = EXCLUDED.context_window,
    max_output_tokens = EXCLUDED.max_output_tokens,
    capabilities = EXCLUDED.capabilities,
    min_tier = EXCLUDED.min_tier,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

GRANT SELECT ON public.ai_models TO anon;
GRANT SELECT ON public.ai_models TO authenticated;

COMMENT ON TABLE public.ai_models IS 'Catalog of available AI models with pricing and capabilities';


-- ============================================================
-- MIGRATION 013: USER CREDITS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_spent INTEGER NOT NULL DEFAULT 0,
    last_refill_at TIMESTAMPTZ,
    next_refill_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_next_refill_at ON public.user_credits(next_refill_at) WHERE next_refill_at IS NOT NULL;

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credit balance" ON public.user_credits;
CREATE POLICY "Users can view own credit balance"
    ON public.user_credits FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage user credits" ON public.user_credits;
CREATE POLICY "Service role can manage user credits"
    ON public.user_credits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_tier_credits INTEGER;
BEGIN
    SELECT COALESCE(monthly_credits, 50) INTO v_tier_credits
    FROM public.subscription_tiers
    WHERE slug = 'free'
    LIMIT 1;

    INSERT INTO public.user_credits (user_id, balance, lifetime_earned, last_refill_at, next_refill_at)
    VALUES (NEW.id, v_tier_credits, v_tier_credits, NOW(), NOW() + INTERVAL '1 month')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_init_credits ON public.users;
CREATE TRIGGER on_user_created_init_credits
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_credits();

-- Initialize credits for existing users
INSERT INTO public.user_credits (user_id, balance, lifetime_earned, last_refill_at, next_refill_at)
SELECT u.id, COALESCE(st.monthly_credits, 50), COALESCE(st.monthly_credits, 50), NOW(), NOW() + INTERVAL '1 month'
FROM public.users u
LEFT JOIN public.subscription_tiers st ON st.slug = COALESCE(u.subscription_tier, 'free')
WHERE NOT EXISTS (SELECT 1 FROM public.user_credits uc WHERE uc.user_id = u.id);

GRANT SELECT ON public.user_credits TO authenticated;

COMMENT ON TABLE public.user_credits IS 'User credit balances for AI model usage';


-- ============================================================
-- MIGRATION 014: CREDIT TRANSACTIONS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_transaction_type') THEN
        CREATE TYPE credit_transaction_type AS ENUM (
            'tier_refill', 'purchase', 'bonus', 'usage', 'refund', 'adjustment', 'expiration'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type credit_transaction_type NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference_id ON public.credit_transactions(reference_id) WHERE reference_id IS NOT NULL;

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage credit transactions" ON public.credit_transactions;
CREATE POLICY "Service role can manage credit transactions"
    ON public.credit_transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE OR REPLACE VIEW public.user_credit_summary AS
SELECT
    user_id,
    COUNT(*) FILTER (WHERE transaction_type = 'usage') AS total_usage_count,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE transaction_type = 'usage'), 0) AS total_credits_spent,
    COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) AS total_credits_earned,
    MIN(created_at) AS first_transaction_at,
    MAX(created_at) AS last_transaction_at,
    COUNT(DISTINCT DATE(created_at)) AS active_days
FROM public.credit_transactions
GROUP BY user_id;

GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.user_credit_summary TO authenticated;

COMMENT ON TABLE public.credit_transactions IS 'Immutable ledger of all credit transactions';


-- ============================================================
-- MIGRATION 015: SITE SETTINGS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_public ON public.site_settings(is_public);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public settings" ON public.site_settings;
CREATE POLICY "Anyone can view public settings"
    ON public.site_settings FOR SELECT
    USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated can view non-sensitive settings" ON public.site_settings;
CREATE POLICY "Authenticated can view non-sensitive settings"
    ON public.site_settings FOR SELECT
    TO authenticated
    USING (is_sensitive = false);

DROP POLICY IF EXISTS "Service role can manage site settings" ON public.site_settings;
CREATE POLICY "Service role can manage site settings"
    ON public.site_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_site_setting(p_key TEXT)
RETURNS JSONB AS $$
DECLARE v_value JSONB;
BEGIN
    SELECT value INTO v_value FROM public.site_settings WHERE key = p_key;
    RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.set_site_setting(
    p_key TEXT, p_value JSONB, p_description TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'general', p_is_public BOOLEAN DEFAULT false, p_is_sensitive BOOLEAN DEFAULT false
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

INSERT INTO public.site_settings (key, value, description, category, is_public, is_sensitive)
VALUES
    ('site_name', '"Business Navigator"'::jsonb, 'Application display name', 'general', true, false),
    ('site_tagline', '"AI-Powered Business Formation"'::jsonb, 'Application tagline', 'general', true, false),
    ('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode', 'general', true, false),
    ('default_credits_on_signup', '50'::jsonb, 'Credits given to new free tier users', 'credits', false, false),
    ('max_credits_balance', '100000'::jsonb, 'Maximum credit balance a user can have', 'credits', false, false),
    ('default_ai_model', '"gpt-4o-mini"'::jsonb, 'Default AI model for new users', 'ai', false, false),
    ('signup_enabled', 'true'::jsonb, 'Whether new user registration is enabled', 'features', true, false),
    ('byok_enabled', 'true'::jsonb, 'Whether Bring Your Own Key feature is enabled', 'features', false, false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_site_setting(TEXT) TO authenticated;

COMMENT ON TABLE public.site_settings IS 'Application-wide configuration key-value store';


-- ============================================================
-- MIGRATION 016: ADMIN API KEYS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    key_identifier TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT admin_api_keys_provider_unique UNIQUE (provider),
    CONSTRAINT admin_api_keys_provider_check CHECK (provider IN ('openai', 'anthropic', 'openrouter'))
);

CREATE INDEX IF NOT EXISTS idx_admin_api_keys_provider ON public.admin_api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_provider_active ON public.admin_api_keys(provider, is_active) WHERE is_active = TRUE;

ALTER TABLE public.admin_api_keys ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_admin_api_keys_updated_at ON public.admin_api_keys;
CREATE TRIGGER update_admin_api_keys_updated_at
    BEFORE UPDATE ON public.admin_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON public.admin_api_keys TO service_role;

COMMENT ON TABLE public.admin_api_keys IS 'Platform-level API keys for AI providers (encrypted). Access restricted to service role only.';


-- ============================================================
-- MIGRATION 017: ADMIN AUDIT LOG
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_action_type') THEN
        CREATE TYPE admin_action_type AS ENUM (
            'user_create', 'user_update', 'user_delete', 'user_suspend', 'user_unsuspend',
            'user_tier_change', 'user_credit_adjustment', 'api_key_create', 'api_key_update',
            'api_key_delete', 'api_key_rotate', 'setting_create', 'setting_update', 'setting_delete',
            'feature_flag_create', 'feature_flag_update', 'feature_flag_delete',
            'ai_model_create', 'ai_model_update', 'ai_model_delete',
            'tier_create', 'tier_update', 'tier_delete',
            'system_maintenance_start', 'system_maintenance_end', 'system_migration_run', 'system_backup_create'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action admin_action_type NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource_type ON public.admin_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.admin_audit_log;
CREATE POLICY "Service role can manage audit logs"
    ON public.admin_audit_log FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_admin_user_id UUID, p_action admin_action_type, p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL, p_details JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL, p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE v_log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_log (admin_user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (p_admin_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.log_admin_action(UUID, admin_action_type, TEXT, TEXT, JSONB, INET, TEXT) TO service_role;

COMMENT ON TABLE public.admin_audit_log IS 'Immutable audit trail of all admin actions';


-- ============================================================
-- MIGRATION 018: FEATURE FLAGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    enabled_for_tiers TEXT[] NOT NULL DEFAULT ARRAY['free', 'starter', 'pro', 'business', 'enterprise'],
    enabled_for_users UUID[] NOT NULL DEFAULT '{}',
    rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON public.feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled_for_users ON public.feature_flags USING GIN (enabled_for_users);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view feature flags" ON public.feature_flags;
CREATE POLICY "Authenticated can view feature flags"
    ON public.feature_flags FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role can manage feature flags" ON public.feature_flags;
CREATE POLICY "Service role can manage feature flags"
    ON public.feature_flags FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_feature_key TEXT, p_user_id UUID DEFAULT NULL, p_user_tier TEXT DEFAULT 'free')
RETURNS BOOLEAN AS $$
DECLARE v_flag RECORD; v_hash INTEGER;
BEGIN
    SELECT * INTO v_flag FROM public.feature_flags WHERE key = p_feature_key;
    IF v_flag IS NULL THEN RETURN false; END IF;
    IF NOT v_flag.is_enabled THEN RETURN false; END IF;
    IF v_flag.expires_at IS NOT NULL AND v_flag.expires_at < NOW() THEN RETURN false; END IF;
    IF p_user_id IS NOT NULL AND p_user_id = ANY(v_flag.enabled_for_users) THEN RETURN true; END IF;
    IF NOT (p_user_tier = ANY(v_flag.enabled_for_tiers)) THEN RETURN false; END IF;
    IF v_flag.rollout_percentage < 100 AND p_user_id IS NOT NULL THEN
        v_hash := abs(hashtext(p_user_id::text || ':' || p_feature_key)) % 100;
        IF v_hash >= v_flag.rollout_percentage THEN RETURN false; END IF;
    END IF;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_features(p_user_id UUID, p_user_tier TEXT DEFAULT 'free')
RETURNS TABLE (key TEXT, name TEXT, metadata JSONB) AS $$
BEGIN
    RETURN QUERY SELECT ff.key, ff.name, ff.metadata FROM public.feature_flags ff
    WHERE public.is_feature_enabled(ff.key, p_user_id, p_user_tier);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

INSERT INTO public.feature_flags (key, name, description, is_enabled, enabled_for_tiers, rollout_percentage)
VALUES
    ('byok', 'Bring Your Own Key', 'Allow users to use their own API keys', true, ARRAY['starter', 'pro', 'business', 'enterprise'], 100),
    ('multiple_businesses', 'Multiple Businesses', 'Support for multiple business profiles', true, ARRAY['pro', 'business', 'enterprise'], 100),
    ('export_pdf', 'PDF Export', 'Export business plan to PDF', true, ARRAY['starter', 'pro', 'business', 'enterprise'], 100),
    ('admin_dashboard', 'Admin Dashboard', 'Admin dashboard access', true, ARRAY[]::TEXT[], 100)
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

GRANT SELECT ON public.feature_flags TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_feature_enabled(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_features(UUID, TEXT) TO authenticated;

COMMENT ON TABLE public.feature_flags IS 'Feature flags for controlled feature rollouts';


-- ============================================================
-- MIGRATION 019: USERS IS_ADMIN
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_is_admin BOOLEAN;
BEGIN
    SELECT is_admin INTO v_is_admin FROM public.users WHERE id = p_user_id;
    RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.protect_is_admin_column()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
        IF current_setting('role', true) = 'authenticated' OR current_setting('role', true) = 'anon' THEN
            RAISE EXCEPTION 'Only service role can modify is_admin column';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_is_admin_trigger ON public.users;
CREATE TRIGGER protect_is_admin_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_is_admin_column();

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

COMMENT ON COLUMN public.users.is_admin IS 'Whether user has admin privileges. Only modifiable by service role.';


-- ============================================================
-- MIGRATION 020: CREDIT FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.tier_meets_minimum(p_user_tier TEXT, p_required_tier TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_user_level INTEGER; v_required_level INTEGER;
BEGIN
    v_user_level := CASE p_user_tier
        WHEN 'free' THEN 1 WHEN 'starter' THEN 2 WHEN 'basic' THEN 2
        WHEN 'pro' THEN 3 WHEN 'business' THEN 4 WHEN 'enterprise' THEN 5 ELSE 0
    END;
    v_required_level := CASE p_required_tier
        WHEN 'free' THEN 1 WHEN 'starter' THEN 2 WHEN 'basic' THEN 2
        WHEN 'pro' THEN 3 WHEN 'business' THEN 4 WHEN 'enterprise' THEN 5 ELSE 0
    END;
    RETURN v_user_level >= v_required_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.spend_credits(p_user_id UUID, p_model_id TEXT, p_message_id TEXT DEFAULT NULL)
RETURNS TABLE (success BOOLEAN, credits_spent INTEGER, balance_after INTEGER, error_message TEXT) AS $$
DECLARE v_model RECORD; v_current_balance INTEGER; v_new_balance INTEGER; v_credits_to_spend INTEGER;
BEGIN
    SELECT credits_per_message INTO v_model FROM public.ai_models WHERE model_id = p_model_id AND is_active = true;
    IF v_model IS NULL THEN RETURN QUERY SELECT false, 0, 0, 'Model not found or inactive'::TEXT; RETURN; END IF;
    v_credits_to_spend := v_model.credits_per_message;
    SELECT balance INTO v_current_balance FROM public.user_credits WHERE user_id = p_user_id FOR UPDATE;
    IF v_current_balance IS NULL THEN RETURN QUERY SELECT false, 0, 0, 'User credits not initialized'::TEXT; RETURN; END IF;
    IF v_current_balance < v_credits_to_spend THEN RETURN QUERY SELECT false, 0, v_current_balance, 'Insufficient credits'::TEXT; RETURN; END IF;
    v_new_balance := v_current_balance - v_credits_to_spend;
    UPDATE public.user_credits SET balance = v_new_balance, lifetime_spent = lifetime_spent + v_credits_to_spend, updated_at = NOW() WHERE user_id = p_user_id;
    INSERT INTO public.credit_transactions (user_id, transaction_type, amount, balance_before, balance_after, description, metadata, reference_id)
    VALUES (p_user_id, 'usage'::credit_transaction_type, -v_credits_to_spend, v_current_balance, v_new_balance, 'AI message: ' || p_model_id, jsonb_build_object('model_id', p_model_id), p_message_id);
    RETURN QUERY SELECT true, v_credits_to_spend, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_amount INTEGER, p_type credit_transaction_type, p_description TEXT DEFAULT NULL, p_reference_id TEXT DEFAULT NULL, p_metadata JSONB DEFAULT '{}'::jsonb)
RETURNS TABLE (success BOOLEAN, credits_added INTEGER, balance_after INTEGER, error_message TEXT) AS $$
DECLARE v_current_balance INTEGER; v_new_balance INTEGER; v_max_balance INTEGER;
BEGIN
    IF p_amount <= 0 THEN RETURN QUERY SELECT false, 0, 0, 'Amount must be positive'::TEXT; RETURN; END IF;
    IF p_type NOT IN ('tier_refill', 'purchase', 'bonus', 'refund', 'adjustment') THEN RETURN QUERY SELECT false, 0, 0, 'Invalid transaction type'::TEXT; RETURN; END IF;
    SELECT COALESCE((value::TEXT)::INTEGER, 100000) INTO v_max_balance FROM public.site_settings WHERE key = 'max_credits_balance';
    IF v_max_balance IS NULL THEN v_max_balance := 100000; END IF;
    SELECT balance INTO v_current_balance FROM public.user_credits WHERE user_id = p_user_id FOR UPDATE;
    IF v_current_balance IS NULL THEN
        INSERT INTO public.user_credits (user_id, balance, lifetime_earned) VALUES (p_user_id, 0, 0) ON CONFLICT (user_id) DO NOTHING;
        v_current_balance := 0;
    END IF;
    v_new_balance := LEAST(v_current_balance + p_amount, v_max_balance);
    UPDATE public.user_credits SET balance = v_new_balance, lifetime_earned = lifetime_earned + (v_new_balance - v_current_balance), updated_at = NOW() WHERE user_id = p_user_id;
    INSERT INTO public.credit_transactions (user_id, transaction_type, amount, balance_before, balance_after, description, metadata, reference_id)
    VALUES (p_user_id, p_type, v_new_balance - v_current_balance, v_current_balance, v_new_balance, p_description, p_metadata, p_reference_id);
    RETURN QUERY SELECT true, v_new_balance - v_current_balance, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_use_model(p_user_id UUID, p_model_id TEXT)
RETURNS TABLE (allowed BOOLEAN, reason TEXT, credits_required INTEGER, credits_available INTEGER) AS $$
DECLARE v_model RECORD; v_user_tier TEXT; v_user_credits INTEGER;
BEGIN
    SELECT * INTO v_model FROM public.ai_models WHERE model_id = p_model_id AND is_active = true;
    IF v_model IS NULL THEN RETURN QUERY SELECT false, 'Model not found'::TEXT, 0, 0; RETURN; END IF;
    SELECT u.subscription_tier, uc.balance INTO v_user_tier, v_user_credits FROM public.users u LEFT JOIN public.user_credits uc ON uc.user_id = u.id WHERE u.id = p_user_id;
    IF v_user_tier IS NULL THEN RETURN QUERY SELECT false, 'User not found'::TEXT, v_model.credits_per_message, 0; RETURN; END IF;
    v_user_credits := COALESCE(v_user_credits, 0);
    IF NOT public.tier_meets_minimum(v_user_tier, v_model.min_tier) THEN
        RETURN QUERY SELECT false, 'Model requires ' || v_model.min_tier || ' tier or higher'::TEXT, v_model.credits_per_message, v_user_credits; RETURN;
    END IF;
    IF v_user_credits < v_model.credits_per_message THEN
        RETURN QUERY SELECT false, 'Insufficient credits'::TEXT, v_model.credits_per_message, v_user_credits; RETURN;
    END IF;
    RETURN QUERY SELECT true, NULL::TEXT, v_model.credits_per_message, v_user_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_credit_summary(p_user_id UUID)
RETURNS TABLE (balance INTEGER, lifetime_earned INTEGER, lifetime_spent INTEGER, tier TEXT, tier_credits_monthly INTEGER, next_refill_at TIMESTAMPTZ, usage_this_month INTEGER, available_models JSONB) AS $$
DECLARE v_month_start TIMESTAMPTZ;
BEGIN
    v_month_start := DATE_TRUNC('month', NOW());
    RETURN QUERY
    SELECT uc.balance, uc.lifetime_earned, uc.lifetime_spent, u.subscription_tier, st.monthly_credits, uc.next_refill_at,
        COALESCE((SELECT SUM(ABS(ct.amount))::INTEGER FROM public.credit_transactions ct WHERE ct.user_id = p_user_id AND ct.transaction_type = 'usage' AND ct.created_at >= v_month_start), 0)::INTEGER,
        (SELECT jsonb_agg(jsonb_build_object('model_id', am.model_id, 'display_name', am.display_name, 'credits_per_message', am.credits_per_message, 'can_use', public.tier_meets_minimum(u.subscription_tier, am.min_tier) AND uc.balance >= am.credits_per_message)) FROM public.ai_models am WHERE am.is_active = true)
    FROM public.user_credits uc JOIN public.users u ON u.id = uc.user_id LEFT JOIN public.subscription_tiers st ON st.slug = u.subscription_tier WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.spend_credits(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, credit_transaction_type, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_use_model(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tier_meets_minimum(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_credit_summary(UUID) TO authenticated;


-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    v_table_count INTEGER;
    v_expected_tables TEXT[] := ARRAY['subscription_tiers', 'ai_models', 'user_credits', 'credit_transactions', 'site_settings', 'admin_api_keys', 'admin_audit_log', 'feature_flags'];
BEGIN
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ANY(v_expected_tables);

    IF v_table_count = array_length(v_expected_tables, 1) THEN
        RAISE NOTICE 'SUCCESS: All % Epic 9 tables created successfully!', v_table_count;
    ELSE
        RAISE WARNING 'PARTIAL: Only % of % tables created.', v_table_count, array_length(v_expected_tables, 1);
    END IF;
END $$;
