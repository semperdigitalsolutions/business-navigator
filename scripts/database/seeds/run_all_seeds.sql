-- Run All Seeds
-- Issue #218: Create Seed Data for Tiers and Models
-- Part of Epic 9: Data-Driven Credits & Tier System (#186)
--
-- This script runs all seed files in the correct order.
-- All seeds are idempotent and can be run multiple times safely.
--
-- Prerequisites:
--   - 011_subscription_tiers.sql migration must be run first
--   - 012_ai_models.sql migration must be run first
--   - 013_site_settings.sql migration must be run first
--   - 014_feature_flags.sql migration must be run first
--
-- Usage:
--   Option 1: Run in Supabase SQL Editor
--   Option 2: psql -d your_database -f run_all_seeds.sql
--
-- Note: If running in psql, you may need to use \i for includes.
-- This file contains all seeds inline for Supabase SQL Editor compatibility.

-- ============================================
-- Transaction wrapper for atomicity
-- ============================================
BEGIN;

-- ============================================
-- Seed 1: Subscription Tiers
-- ============================================
-- Creates 5 tiers: Free, Starter, Pro, Business, Enterprise

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
        true,
        0
    ),
    (
        'starter',
        'Starter',
        'Perfect for founders actively working on their first business.',
        200,
        false,
        0,
        900,
        9000,
        NULL,
        '["All standard models", "Email support", "2 business profiles", "Priority formation guidance", "Document templates"]'::jsonb,
        ARRAY['standard', 'advanced'],
        2,
        2,
        true,
        false,
        1
    ),
    (
        'pro',
        'Pro',
        'For entrepreneurs who need comprehensive AI support and advanced features.',
        500,
        true,
        100,
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
    (
        'business',
        'Business',
        'Built for teams managing multiple businesses with premium support.',
        2000,
        true,
        500,
        9900,
        99000,
        NULL,
        '["All models", "Premium support with SLA", "Unlimited business profiles", "Team features", "Advanced API access", "Custom integrations", "Dedicated success manager"]'::jsonb,
        ARRAY['standard', 'advanced', 'premium'],
        -1,
        10,
        true,
        false,
        3
    ),
    (
        'enterprise',
        'Enterprise',
        'Custom solutions for organizations with specialized needs.',
        -1,
        false,
        0,
        0,
        0,
        NULL,
        '["Unlimited usage", "Dedicated support", "Custom integrations", "SSO/SAML", "Custom SLA", "On-premise options", "Compliance packages"]'::jsonb,
        ARRAY['standard', 'advanced', 'premium'],
        -1,
        -1,
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
-- Seed 2: AI Models
-- ============================================
-- Creates 9 models across 3 tiers (standard, advanced, premium)

INSERT INTO public.ai_models (
    provider,
    model_id,
    display_name,
    description,
    credit_cost,
    credit_cost_input_per_1k,
    credit_cost_output_per_1k,
    model_tier,
    category,
    capabilities,
    context_window,
    recommended_for,
    is_active,
    is_default,
    sort_order,
    metadata
) VALUES
    (
        'openrouter',
        'openai/gpt-4o-mini',
        'GPT-4o Mini',
        'Fast and cost-effective model for everyday tasks. Great balance of speed and quality.',
        1,
        0.00015,
        0.0006,
        'standard',
        'chat',
        '["text", "function_calling", "json_mode"]'::jsonb,
        128000,
        ARRAY['quick_questions', 'simple_tasks', 'general_chat'],
        true,
        true,
        0,
        '{"release_date": "2024-07-18", "training_cutoff": "2023-10"}'::jsonb
    ),
    (
        'openrouter',
        'anthropic/claude-3-haiku',
        'Claude 3 Haiku',
        'Lightning-fast responses for simple queries and quick interactions.',
        1,
        0.00025,
        0.00125,
        'standard',
        'chat',
        '["text", "function_calling", "vision"]'::jsonb,
        200000,
        ARRAY['quick_questions', 'simple_tasks', 'fast_responses'],
        true,
        false,
        1,
        '{"release_date": "2024-03-13", "training_cutoff": "2023-08"}'::jsonb
    ),
    (
        'openrouter',
        'openai/gpt-4o',
        'GPT-4o',
        'OpenAI flagship model with excellent reasoning and broad knowledge.',
        3,
        0.0025,
        0.01,
        'advanced',
        'chat',
        '["text", "function_calling", "json_mode", "vision"]'::jsonb,
        128000,
        ARRAY['complex_analysis', 'business_advice', 'document_review'],
        true,
        false,
        2,
        '{"release_date": "2024-05-13", "training_cutoff": "2023-10"}'::jsonb
    ),
    (
        'openrouter',
        'anthropic/claude-3-5-sonnet',
        'Claude 3.5 Sonnet',
        'Excellent reasoning with fast responses. Best balance of quality and speed.',
        3,
        0.003,
        0.015,
        'advanced',
        'chat',
        '["text", "function_calling", "vision", "extended_thinking"]'::jsonb,
        200000,
        ARRAY['complex_analysis', 'legal_questions', 'financial_planning'],
        true,
        false,
        3,
        '{"release_date": "2024-06-20", "training_cutoff": "2024-04"}'::jsonb
    ),
    (
        'openrouter',
        'google/gemini-pro-1.5',
        'Gemini 1.5 Pro',
        'Excellent for long documents and complex analysis with massive context window.',
        3,
        0.00125,
        0.005,
        'advanced',
        'chat',
        '["text", "function_calling", "vision", "audio"]'::jsonb,
        2000000,
        ARRAY['document_analysis', 'research', 'long_form_content'],
        true,
        false,
        4,
        '{"release_date": "2024-02-15", "training_cutoff": "2023-11"}'::jsonb
    ),
    (
        'openrouter',
        'anthropic/claude-3-opus',
        'Claude 3 Opus',
        'Most capable Claude model for complex reasoning and nuanced analysis.',
        10,
        0.015,
        0.075,
        'premium',
        'chat',
        '["text", "function_calling", "vision", "extended_thinking"]'::jsonb,
        200000,
        ARRAY['complex_legal', 'strategic_planning', 'critical_decisions'],
        true,
        false,
        5,
        '{"release_date": "2024-03-04", "training_cutoff": "2023-08"}'::jsonb
    ),
    (
        'openrouter',
        'openai/gpt-4-turbo',
        'GPT-4 Turbo',
        'Powerful model with enhanced capabilities and vision support.',
        5,
        0.01,
        0.03,
        'premium',
        'chat',
        '["text", "function_calling", "json_mode", "vision"]'::jsonb,
        128000,
        ARRAY['code_generation', 'technical_analysis', 'detailed_research'],
        true,
        false,
        6,
        '{"release_date": "2024-01-25", "training_cutoff": "2023-12"}'::jsonb
    ),
    (
        'openrouter',
        'openai/o1-preview',
        'o1 Preview',
        'Advanced reasoning model that thinks step-by-step for complex problems.',
        15,
        0.015,
        0.06,
        'premium',
        'chat',
        '["text", "advanced_reasoning", "chain_of_thought"]'::jsonb,
        128000,
        ARRAY['complex_math', 'logic_puzzles', 'scientific_analysis'],
        true,
        false,
        7,
        '{"release_date": "2024-09-12", "training_cutoff": "2023-10"}'::jsonb
    ),
    (
        'openrouter',
        'openai/o1-mini',
        'o1 Mini',
        'Fast reasoning model for coding and math problems.',
        5,
        0.003,
        0.012,
        'advanced',
        'chat',
        '["text", "advanced_reasoning", "code_generation"]'::jsonb,
        128000,
        ARRAY['coding', 'math', 'structured_problems'],
        true,
        false,
        8,
        '{"release_date": "2024-09-12", "training_cutoff": "2023-10"}'::jsonb
    )
ON CONFLICT (provider, model_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    credit_cost = EXCLUDED.credit_cost,
    credit_cost_input_per_1k = EXCLUDED.credit_cost_input_per_1k,
    credit_cost_output_per_1k = EXCLUDED.credit_cost_output_per_1k,
    model_tier = EXCLUDED.model_tier,
    category = EXCLUDED.category,
    capabilities = EXCLUDED.capabilities,
    context_window = EXCLUDED.context_window,
    recommended_for = EXCLUDED.recommended_for,
    is_active = EXCLUDED.is_active,
    is_default = EXCLUDED.is_default,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ============================================
-- Seed 3: Site Settings
-- ============================================
-- Creates default platform configuration

INSERT INTO public.site_settings (
    key,
    value,
    description,
    category,
    is_sensitive
) VALUES
    ('default_model_id', '"openai/gpt-4o-mini"'::jsonb, 'Default AI model for new users and fallback scenarios', 'ai', false),
    ('default_provider', '"openrouter"'::jsonb, 'Default AI provider (openrouter, openai, anthropic)', 'ai', false),
    ('ai_temperature', '0.7'::jsonb, 'Default temperature for AI responses (0.0 - 2.0)', 'ai', false),
    ('ai_max_tokens', '4096'::jsonb, 'Default maximum tokens for AI responses', 'ai', false),
    ('ai_request_timeout_ms', '60000'::jsonb, 'Timeout for AI requests in milliseconds', 'ai', false),
    ('credits_system_enabled', 'false'::jsonb, 'Enable the new credits-based billing system', 'billing', false),
    ('signup_bonus_credits', '50'::jsonb, 'Bonus credits given to new users upon signup', 'billing', false),
    ('referral_bonus_credits', '100'::jsonb, 'Bonus credits for successful referrals', 'billing', false),
    ('min_credit_purchase', '100'::jsonb, 'Minimum credits that can be purchased', 'billing', false),
    ('credit_pack_prices', '{"100": 499, "500": 1999, "1000": 3499, "5000": 14999}'::jsonb, 'Credit pack sizes and prices in cents', 'billing', false),
    ('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode', 'general', false),
    ('maintenance_message', '"We are performing scheduled maintenance. Please check back soon."'::jsonb, 'Message displayed during maintenance mode', 'general', false),
    ('platform_name', '"Business Navigator"'::jsonb, 'Platform display name', 'general', false),
    ('support_email', '"support@businessnavigator.ai"'::jsonb, 'Support email address shown to users', 'general', false),
    ('max_businesses_free_tier', '1'::jsonb, 'Maximum businesses allowed for free tier users', 'general', false),
    ('rate_limit_requests_per_minute', '30'::jsonb, 'Maximum API requests per minute per user', 'security', false),
    ('rate_limit_messages_per_hour', '100'::jsonb, 'Maximum chat messages per hour per user', 'security', false),
    ('rate_limit_burst_size', '10'::jsonb, 'Maximum burst of requests before rate limiting', 'security', false),
    ('session_timeout_hours', '24'::jsonb, 'Hours before user session expires', 'security', false),
    ('max_login_attempts', '5'::jsonb, 'Maximum failed login attempts before lockout', 'security', false),
    ('lockout_duration_minutes', '15'::jsonb, 'Duration of account lockout', 'security', false),
    ('api_key_hash_algorithm', '"argon2id"'::jsonb, 'Algorithm used for hashing API keys', 'security', true),
    ('onboarding_required', 'true'::jsonb, 'Require users to complete onboarding', 'general', false),
    ('chat_history_retention_days', '365'::jsonb, 'Number of days to retain chat history', 'general', false),
    ('allow_user_api_keys', 'true'::jsonb, 'Allow users to provide their own API keys', 'general', false)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_sensitive = EXCLUDED.is_sensitive,
    updated_at = NOW();

-- ============================================
-- Seed 4: Feature Flags
-- ============================================
-- All flags start DISABLED for safe deployment

INSERT INTO public.feature_flags (
    name,
    description,
    enabled,
    rollout_percentage,
    metadata
) VALUES
    ('credits_system', 'Enable the new credits-based usage system', false, 0, '{"epic": "9", "issue": "186"}'::jsonb),
    ('credits_display', 'Show credit balance and costs in the UI', false, 0, '{"depends_on": "credits_system"}'::jsonb),
    ('credit_packs', 'Allow users to purchase additional credit packs', false, 0, '{"depends_on": "credits_system"}'::jsonb),
    ('model_selection', 'Allow users to select which AI model to use', false, 0, '{"epic": "9"}'::jsonb),
    ('model_cost_preview', 'Show estimated credit cost before sending', false, 0, '{"depends_on": ["credits_system", "model_selection"]}'::jsonb),
    ('admin_panel', 'Enable the admin dashboard', false, 0, '{"requires_role": "admin"}'::jsonb),
    ('admin_model_management', 'Allow admins to manage AI models', false, 0, '{"depends_on": "admin_panel"}'::jsonb),
    ('admin_tier_management', 'Allow admins to modify subscription tiers', false, 0, '{"depends_on": "admin_panel"}'::jsonb),
    ('admin_user_management', 'Allow admins to view and manage users', false, 0, '{"depends_on": "admin_panel"}'::jsonb),
    ('admin_api_key_management', 'Allow admins to manage platform API keys', false, 0, '{"depends_on": "admin_panel"}'::jsonb),
    ('enhanced_onboarding', 'Use the enhanced 6-step onboarding wizard', true, 100, '{"version": "2.0"}'::jsonb),
    ('dark_mode', 'Enable dark mode theme option', false, 0, '{"priority": "low"}'::jsonb),
    ('chat_streaming', 'Enable streaming responses in chat', true, 100, '{"version": "1.0"}'::jsonb),
    ('task_recommendations', 'Show AI-powered task recommendations', true, 100, '{"version": "1.0"}'::jsonb),
    ('stripe_billing', 'Enable Stripe payment processing', false, 0, '{"requires": "stripe_account"}'::jsonb),
    ('email_notifications', 'Send email notifications', false, 0, '{"requires": "email_provider"}'::jsonb),
    ('google_oauth', 'Enable Google OAuth login', false, 0, '{"requires": "google_oauth_credentials"}'::jsonb),
    ('github_oauth', 'Enable GitHub OAuth login', false, 0, '{"requires": "github_oauth_credentials"}'::jsonb),
    ('beta_features', 'Master flag for all beta features', false, 0, '{"warning": "May be unstable"}'::jsonb),
    ('ai_document_generation', 'Enable AI document generation (beta)', false, 0, '{"depends_on": "beta_features"}'::jsonb),
    ('ai_voice_input', 'Enable voice input for chat (beta)', false, 0, '{"depends_on": "beta_features"}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================
-- Uncomment and run these to verify the seeds were applied correctly:

-- SELECT 'subscription_tiers' as table_name, count(*) as row_count FROM public.subscription_tiers
-- UNION ALL
-- SELECT 'ai_models', count(*) FROM public.ai_models
-- UNION ALL
-- SELECT 'site_settings', count(*) FROM public.site_settings
-- UNION ALL
-- SELECT 'feature_flags', count(*) FROM public.feature_flags;

-- Expected results:
-- subscription_tiers: 5
-- ai_models: 9
-- site_settings: 25
-- feature_flags: 21
