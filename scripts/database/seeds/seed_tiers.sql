-- Seed Data: Subscription Tiers
-- Issue #218: Create Seed Data for Tiers and Models
-- Part of Epic 9: Data-Driven Credits & Tier System (#186)
--
-- This script populates the subscription_tiers table with initial tier data.
-- Idempotent: Uses ON CONFLICT to handle re-runs safely.
--
-- Prerequisites: Run 011_subscription_tiers.sql migration first

-- ============================================
-- Subscription Tiers Seed Data
-- ============================================
-- Note: Uses 'name' as the unique constraint for idempotency
-- Prices are in cents (e.g., 900 = $9.00)
-- monthly_credits of -1 indicates unlimited

INSERT INTO public.subscription_tiers (
    name,
    display_name,
    description,
    monthly_credits,
    rollover_enabled,
    max_rollover_credits,
    price_monthly_cents,
    price_yearly_cents,
    stripe_price_id,
    features,
    allowed_model_tiers,
    max_businesses,
    max_api_keys,
    is_active,
    is_default,
    sort_order
) VALUES
    -- Free Tier: Entry-level for new users
    (
        'free',
        'Free',
        'Get started with basic AI assistance for your business formation journey.',
        50,
        false,
        0,
        0,
        0,
        NULL,
        '["Basic AI models", "Community support", "1 business profile", "Core formation guidance"]'::jsonb,
        ARRAY['standard'],
        1,
        1,
        true,
        true,  -- This is the default tier for new users
        0
    ),

    -- Starter Tier: For users ready to commit
    (
        'starter',
        'Starter',
        'Perfect for founders actively working on their first business.',
        200,
        false,
        0,
        900,
        9000,  -- 2 months free with annual
        NULL,
        '["All standard models", "Email support", "2 business profiles", "Priority formation guidance", "Document templates"]'::jsonb,
        ARRAY['standard', 'advanced'],
        2,
        2,
        true,
        false,
        1
    ),

    -- Pro Tier: For serious entrepreneurs
    (
        'pro',
        'Pro',
        'For entrepreneurs who need comprehensive AI support and advanced features.',
        500,
        true,
        100,  -- Can roll over up to 100 credits
        2900,
        29000,
        NULL,
        '["All models including premium", "Priority support", "5 business profiles", "Advanced analytics", "API access", "Custom document generation"]'::jsonb,
        ARRAY['standard', 'advanced', 'premium'],
        5,
        5,
        true,
        false,
        2
    ),

    -- Business Tier: For growing teams
    (
        'business',
        'Business',
        'Built for teams managing multiple businesses with premium support.',
        2000,
        true,
        500,  -- Can roll over up to 500 credits
        9900,
        99000,
        NULL,
        '["All models", "Premium support with SLA", "Unlimited business profiles", "Team features", "Advanced API access", "Custom integrations", "Dedicated success manager"]'::jsonb,
        ARRAY['standard', 'advanced', 'premium'],
        -1,  -- Unlimited businesses
        10,
        true,
        false,
        3
    ),

    -- Enterprise Tier: Custom solutions
    (
        'enterprise',
        'Enterprise',
        'Custom solutions for organizations with specialized needs.',
        -1,  -- Unlimited credits
        false,
        0,
        0,  -- Custom pricing handled outside the system
        0,
        NULL,
        '["Unlimited usage", "Dedicated support", "Custom integrations", "SSO/SAML", "Custom SLA", "On-premise options", "Compliance packages"]'::jsonb,
        ARRAY['standard', 'advanced', 'premium'],
        -1,  -- Unlimited businesses
        -1,  -- Unlimited API keys
        true,
        false,
        4
    )
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    monthly_credits = EXCLUDED.monthly_credits,
    rollover_enabled = EXCLUDED.rollover_enabled,
    max_rollover_credits = EXCLUDED.max_rollover_credits,
    price_monthly_cents = EXCLUDED.price_monthly_cents,
    price_yearly_cents = EXCLUDED.price_yearly_cents,
    features = EXCLUDED.features,
    allowed_model_tiers = EXCLUDED.allowed_model_tiers,
    max_businesses = EXCLUDED.max_businesses,
    max_api_keys = EXCLUDED.max_api_keys,
    is_active = EXCLUDED.is_active,
    is_default = EXCLUDED.is_default,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the seed data was inserted correctly:
-- SELECT name, display_name, monthly_credits, price_monthly_cents, is_default, is_active
-- FROM public.subscription_tiers
-- ORDER BY sort_order;

COMMENT ON TABLE public.subscription_tiers IS 'Subscription tier definitions for the credits system. Seeded via seed_tiers.sql';
