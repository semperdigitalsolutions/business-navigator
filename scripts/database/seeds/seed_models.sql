-- Seed Data: AI Models
-- Issue #218: Create Seed Data for Tiers and Models
-- Part of Epic 9: Data-Driven Credits & Tier System (#186)
--
-- This script populates the ai_models table with the initial model catalog.
-- Idempotent: Uses ON CONFLICT to handle re-runs safely.
--
-- Prerequisites: Run 012_ai_models.sql migration first

-- ============================================
-- AI Models Seed Data
-- ============================================
-- Note: Uses (provider, model_id) as the unique constraint for idempotency
-- credit_cost is the base cost per message/request
-- model_tier determines which subscription tiers can access the model

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
    -- ============================================
    -- Standard Tier Models (Free tier access)
    -- ============================================

    -- OpenAI GPT-4o-mini: Fast, affordable, good for simple queries
    (
        'openrouter',
        'openai/gpt-4o-mini',
        'GPT-4o Mini',
        'Fast and cost-effective model for everyday tasks. Great balance of speed and quality.',
        1,
        0.00015,   -- $0.15 per 1M input tokens
        0.0006,    -- $0.60 per 1M output tokens
        'standard',
        'chat',
        '["text", "function_calling", "json_mode"]'::jsonb,
        128000,
        ARRAY['quick_questions', 'simple_tasks', 'general_chat'],
        true,
        true,  -- Default model for new users
        0,
        '{"release_date": "2024-07-18", "training_cutoff": "2023-10"}'::jsonb
    ),

    -- Anthropic Claude 3 Haiku: Fast, efficient, good for simple tasks
    (
        'openrouter',
        'anthropic/claude-3-haiku',
        'Claude 3 Haiku',
        'Lightning-fast responses for simple queries and quick interactions.',
        1,
        0.00025,   -- $0.25 per 1M input tokens
        0.00125,   -- $1.25 per 1M output tokens
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

    -- ============================================
    -- Advanced Tier Models (Starter tier access)
    -- ============================================

    -- OpenAI GPT-4o: Flagship model, excellent all-around
    (
        'openrouter',
        'openai/gpt-4o',
        'GPT-4o',
        'OpenAI flagship model with excellent reasoning and broad knowledge.',
        3,
        0.0025,    -- $2.50 per 1M input tokens
        0.01,      -- $10 per 1M output tokens
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

    -- Anthropic Claude 3.5 Sonnet: Best balance of capability and speed
    (
        'openrouter',
        'anthropic/claude-3-5-sonnet',
        'Claude 3.5 Sonnet',
        'Excellent reasoning with fast responses. Best balance of quality and speed.',
        3,
        0.003,     -- $3 per 1M input tokens
        0.015,     -- $15 per 1M output tokens
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

    -- Google Gemini 1.5 Pro: Large context, good for documents
    (
        'openrouter',
        'google/gemini-pro-1.5',
        'Gemini 1.5 Pro',
        'Excellent for long documents and complex analysis with massive context window.',
        3,
        0.00125,   -- $1.25 per 1M input tokens
        0.005,     -- $5 per 1M output tokens
        'advanced',
        'chat',
        '["text", "function_calling", "vision", "audio"]'::jsonb,
        2000000,   -- 2M token context!
        ARRAY['document_analysis', 'research', 'long_form_content'],
        true,
        false,
        4,
        '{"release_date": "2024-02-15", "training_cutoff": "2023-11"}'::jsonb
    ),

    -- ============================================
    -- Premium Tier Models (Pro tier access)
    -- ============================================

    -- Anthropic Claude 3 Opus: Most capable Claude model
    (
        'openrouter',
        'anthropic/claude-3-opus',
        'Claude 3 Opus',
        'Most capable Claude model for complex reasoning and nuanced analysis.',
        10,
        0.015,     -- $15 per 1M input tokens
        0.075,     -- $75 per 1M output tokens
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

    -- OpenAI GPT-4 Turbo: Previous flagship, still excellent
    (
        'openrouter',
        'openai/gpt-4-turbo',
        'GPT-4 Turbo',
        'Powerful model with enhanced capabilities and vision support.',
        5,
        0.01,      -- $10 per 1M input tokens
        0.03,      -- $30 per 1M output tokens
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

    -- OpenAI o1-preview: Advanced reasoning model
    (
        'openrouter',
        'openai/o1-preview',
        'o1 Preview',
        'Advanced reasoning model that thinks step-by-step for complex problems.',
        15,
        0.015,     -- $15 per 1M input tokens
        0.06,      -- $60 per 1M output tokens
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

    -- OpenAI o1-mini: Faster reasoning model
    (
        'openrouter',
        'openai/o1-mini',
        'o1 Mini',
        'Fast reasoning model for coding and math problems.',
        5,
        0.003,     -- $3 per 1M input tokens
        0.012,     -- $12 per 1M output tokens
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
-- Verification Query
-- ============================================
-- Run this to verify the seed data was inserted correctly:
-- SELECT provider, model_id, display_name, credit_cost, model_tier, is_active
-- FROM public.ai_models
-- ORDER BY sort_order;

COMMENT ON TABLE public.ai_models IS 'AI model catalog with credit costs. Seeded via seed_models.sql';
