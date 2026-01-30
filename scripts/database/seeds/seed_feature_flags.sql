-- Seed Data: Feature Flags
-- Issue #218: Create Seed Data for Tiers and Models
-- Part of Epic 9: Data-Driven Credits & Tier System (#186)
--
-- This script populates the feature_flags table with initial flags for gradual rollout.
-- Idempotent: Uses ON CONFLICT to handle re-runs safely.
-- All flags start DISABLED for safe deployment.
--
-- Prerequisites: Run 014_feature_flags.sql migration first

-- ============================================
-- Feature Flags Seed Data
-- ============================================
-- Note: Uses 'name' as the unique constraint for idempotency
-- rollout_percentage: 0-100, percentage of users who see the feature
-- enabled: master switch, if false the feature is off for everyone

INSERT INTO public.feature_flags (
    name,
    description,
    enabled,
    rollout_percentage,
    metadata
) VALUES
    -- ============================================
    -- Credits System Flags
    -- ============================================
    (
        'credits_system',
        'Enable the new credits-based usage system instead of daily message limits',
        false,
        0,
        '{"epic": "9", "issue": "186", "migration_phase": "1"}'::jsonb
    ),
    (
        'credits_display',
        'Show credit balance and costs in the UI (requires credits_system)',
        false,
        0,
        '{"depends_on": "credits_system"}'::jsonb
    ),
    (
        'credit_packs',
        'Allow users to purchase additional credit packs',
        false,
        0,
        '{"depends_on": "credits_system"}'::jsonb
    ),

    -- ============================================
    -- Model Selection Flags
    -- ============================================
    (
        'model_selection',
        'Allow users to select which AI model to use for chat',
        false,
        0,
        '{"epic": "9", "issue": "186"}'::jsonb
    ),
    (
        'model_cost_preview',
        'Show estimated credit cost before sending a message',
        false,
        0,
        '{"depends_on": ["credits_system", "model_selection"]}'::jsonb
    ),

    -- ============================================
    -- Admin Panel Flags
    -- ============================================
    (
        'admin_panel',
        'Enable the admin dashboard for site administrators',
        false,
        0,
        '{"epic": "9", "requires_role": "admin"}'::jsonb
    ),
    (
        'admin_model_management',
        'Allow admins to add, edit, and disable AI models',
        false,
        0,
        '{"depends_on": "admin_panel"}'::jsonb
    ),
    (
        'admin_tier_management',
        'Allow admins to modify subscription tiers',
        false,
        0,
        '{"depends_on": "admin_panel"}'::jsonb
    ),
    (
        'admin_user_management',
        'Allow admins to view and manage users',
        false,
        0,
        '{"depends_on": "admin_panel"}'::jsonb
    ),
    (
        'admin_api_key_management',
        'Allow admins to manage platform API keys',
        false,
        0,
        '{"depends_on": "admin_panel"}'::jsonb
    ),

    -- ============================================
    -- User Experience Flags
    -- ============================================
    (
        'enhanced_onboarding',
        'Use the enhanced 6-step onboarding wizard',
        true,  -- Already live
        100,
        '{"version": "2.0"}'::jsonb
    ),
    (
        'dark_mode',
        'Enable dark mode theme option for users',
        false,
        0,
        '{"priority": "low"}'::jsonb
    ),
    (
        'chat_streaming',
        'Enable streaming responses in the chat interface',
        true,  -- Already live
        100,
        '{"version": "1.0"}'::jsonb
    ),
    (
        'task_recommendations',
        'Show AI-powered task recommendations on the dashboard',
        true,  -- Already live
        100,
        '{"version": "1.0"}'::jsonb
    ),

    -- ============================================
    -- Integration Flags
    -- ============================================
    (
        'stripe_billing',
        'Enable Stripe payment processing for subscriptions',
        false,
        0,
        '{"requires": "stripe_account"}'::jsonb
    ),
    (
        'email_notifications',
        'Send email notifications for important events',
        false,
        0,
        '{"requires": "email_provider"}'::jsonb
    ),
    (
        'google_oauth',
        'Enable Google OAuth login',
        false,
        0,
        '{"requires": "google_oauth_credentials"}'::jsonb
    ),
    (
        'github_oauth',
        'Enable GitHub OAuth login',
        false,
        0,
        '{"requires": "github_oauth_credentials"}'::jsonb
    ),

    -- ============================================
    -- Beta/Experimental Flags
    -- ============================================
    (
        'beta_features',
        'Master flag to enable access to all beta features',
        false,
        0,
        '{"warning": "May be unstable"}'::jsonb
    ),
    (
        'ai_document_generation',
        'Enable AI-powered document generation (beta)',
        false,
        0,
        '{"depends_on": "beta_features", "status": "experimental"}'::jsonb
    ),
    (
        'ai_voice_input',
        'Enable voice input for chat (beta)',
        false,
        0,
        '{"depends_on": "beta_features", "status": "experimental"}'::jsonb
    )

ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    -- Note: We intentionally DO NOT update enabled or rollout_percentage
    -- to preserve manual admin changes. Only metadata is updated.
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the seed data was inserted correctly:
-- SELECT name, description, enabled, rollout_percentage
-- FROM public.feature_flags
-- ORDER BY name;

-- ============================================
-- Helper: Check if a feature is enabled for all users
-- ============================================
-- SELECT name FROM public.feature_flags
-- WHERE enabled = true AND rollout_percentage = 100;

COMMENT ON TABLE public.feature_flags IS 'Feature flags for gradual rollout. Seeded via seed_feature_flags.sql';
