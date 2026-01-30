-- Subscription Tiers Table
-- Epic 9: Credit-based usage system
-- Issue #187: Create subscription_tiers database table
--
-- This table stores the available subscription tiers with their
-- credit allocations, pricing, and feature sets.

-- ============================================
-- Subscription Tiers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tier identification
    name TEXT NOT NULL,                           -- Display name (e.g., "Free", "Pro")
    slug TEXT NOT NULL UNIQUE,                    -- URL-friendly identifier (e.g., "free", "pro")

    -- Credit allocation
    monthly_credits INTEGER NOT NULL,             -- Credits per month (-1 for unlimited)

    -- Pricing
    price_cents INTEGER NOT NULL,                 -- Monthly price in cents (0 for free, -1 for custom/contact)

    -- Features
    features JSONB DEFAULT '[]'::jsonb,           -- Array of feature strings

    -- Tier flags
    is_default BOOLEAN NOT NULL DEFAULT FALSE,    -- Only one tier can be default (for new users)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,      -- Inactive tiers are hidden from users

    -- Display order
    display_order INTEGER NOT NULL DEFAULT 0,     -- For sorting tiers in UI

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_monthly_credits CHECK (monthly_credits >= -1),
    CONSTRAINT valid_price_cents CHECK (price_cents >= -1)
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Lookup by slug (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_slug
    ON public.subscription_tiers(slug);

-- Filter by active status
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_is_active
    ON public.subscription_tiers(is_active);

-- Find the default tier
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_is_default
    ON public.subscription_tiers(is_default) WHERE is_default = TRUE;

-- Sorting for UI display
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_display_order
    ON public.subscription_tiers(display_order);

-- Composite index for listing active tiers in order
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active_ordered
    ON public.subscription_tiers(is_active, display_order) WHERE is_active = TRUE;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous users) can read active tiers
-- This allows the pricing page to be displayed to non-authenticated users
CREATE POLICY "Anyone can view active subscription tiers"
    ON public.subscription_tiers FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================

CREATE TRIGGER update_subscription_tiers_updated_at
    BEFORE UPDATE ON public.subscription_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to ensure only one default tier
-- ============================================

CREATE OR REPLACE FUNCTION public.ensure_single_default_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- When setting a tier as default, unset all others
    IF NEW.is_default = TRUE THEN
        UPDATE public.subscription_tiers
        SET is_default = FALSE, updated_at = NOW()
        WHERE id != NEW.id AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_single_default_tier
    BEFORE INSERT OR UPDATE OF is_default ON public.subscription_tiers
    FOR EACH ROW
    WHEN (NEW.is_default = TRUE)
    EXECUTE FUNCTION public.ensure_single_default_tier();

-- ============================================
-- Seed Data: 5 Subscription Tiers
-- ============================================

INSERT INTO public.subscription_tiers (name, slug, monthly_credits, price_cents, features, is_default, is_active, display_order)
VALUES
    -- Free Tier: 50 credits/month, $0
    (
        'Free',
        'free',
        50,
        0,
        '["50 AI credits per month", "Basic chat support", "Single business profile", "Community access"]'::jsonb,
        TRUE,  -- This is the default tier for new users
        TRUE,
        1
    ),
    -- Starter Tier: 200 credits/month, $9
    (
        'Starter',
        'starter',
        200,
        900,
        '["200 AI credits per month", "Email support", "Up to 3 business profiles", "Task tracking", "Basic analytics"]'::jsonb,
        FALSE,
        TRUE,
        2
    ),
    -- Pro Tier: 500 credits/month, $29
    (
        'Pro',
        'pro',
        500,
        2900,
        '["500 AI credits per month", "Priority email support", "Unlimited business profiles", "Advanced task management", "Full analytics dashboard", "Document templates"]'::jsonb,
        FALSE,
        TRUE,
        3
    ),
    -- Business Tier: 2000 credits/month, $99
    (
        'Business',
        'business',
        2000,
        9900,
        '["2,000 AI credits per month", "Priority support with 24h response", "Unlimited business profiles", "Team collaboration (up to 5 users)", "Custom document generation", "API access", "Advanced integrations"]'::jsonb,
        FALSE,
        TRUE,
        4
    ),
    -- Enterprise Tier: Unlimited credits, custom pricing
    (
        'Enterprise',
        'enterprise',
        -1,  -- Unlimited credits
        -1,  -- Custom pricing (contact sales)
        '["Unlimited AI credits", "Dedicated account manager", "24/7 phone & email support", "Unlimited team members", "Custom integrations", "SLA guarantees", "On-premise deployment options", "Custom training & onboarding"]'::jsonb,
        FALSE,
        TRUE,
        5
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_credits = EXCLUDED.monthly_credits,
    price_cents = EXCLUDED.price_cents,
    features = EXCLUDED.features,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- ============================================
-- Grant Permissions
-- ============================================

-- Allow authenticated users to read the table
GRANT SELECT ON public.subscription_tiers TO authenticated;

-- Allow anonymous users to read (for pricing page)
GRANT SELECT ON public.subscription_tiers TO anon;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.subscription_tiers IS 'Epic 9: Subscription tier definitions for credit-based usage system';
COMMENT ON COLUMN public.subscription_tiers.name IS 'Display name shown to users (e.g., "Free", "Pro")';
COMMENT ON COLUMN public.subscription_tiers.slug IS 'URL-friendly unique identifier (e.g., "free", "pro")';
COMMENT ON COLUMN public.subscription_tiers.monthly_credits IS 'Number of AI credits per month. -1 indicates unlimited credits.';
COMMENT ON COLUMN public.subscription_tiers.price_cents IS 'Monthly price in cents. 0 = free tier, -1 = custom/contact sales.';
COMMENT ON COLUMN public.subscription_tiers.features IS 'JSON array of feature strings displayed on pricing page';
COMMENT ON COLUMN public.subscription_tiers.is_default IS 'If TRUE, new users are assigned this tier. Only one tier can be default.';
COMMENT ON COLUMN public.subscription_tiers.is_active IS 'If FALSE, tier is hidden and cannot be selected by users';
COMMENT ON COLUMN public.subscription_tiers.display_order IS 'Sort order for displaying tiers in UI (lower = first)';
COMMENT ON FUNCTION public.ensure_single_default_tier IS 'Trigger function to ensure only one subscription tier is marked as default';
