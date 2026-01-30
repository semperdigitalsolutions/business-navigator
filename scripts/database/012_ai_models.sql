-- Migration: 012_ai_models.sql
-- Description: Creates ai_models table for model catalog with credit costs
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- AI Models Table
-- Catalog of available AI models with credit costs
-- ============================================

-- UP MIGRATION
BEGIN;

-- Create ai_models table
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
    CONSTRAINT fk_min_tier FOREIGN KEY (min_tier)
        REFERENCES public.subscription_tiers(slug) ON DELETE RESTRICT
);

-- Add comments for documentation
COMMENT ON TABLE public.ai_models IS 'Catalog of available AI models with pricing and capabilities';
COMMENT ON COLUMN public.ai_models.provider IS 'Model provider (openai, anthropic, openrouter)';
COMMENT ON COLUMN public.ai_models.model_id IS 'API model identifier (gpt-4, claude-3-opus, etc)';
COMMENT ON COLUMN public.ai_models.credits_per_message IS 'Credits charged per message using this model';
COMMENT ON COLUMN public.ai_models.input_cost_per_1k IS 'Cost per 1000 input tokens (for cost tracking)';
COMMENT ON COLUMN public.ai_models.output_cost_per_1k IS 'Cost per 1000 output tokens (for cost tracking)';
COMMENT ON COLUMN public.ai_models.capabilities IS 'JSON array of model capabilities (vision, function_calling, etc)';
COMMENT ON COLUMN public.ai_models.min_tier IS 'Minimum subscription tier required to use this model';
COMMENT ON COLUMN public.ai_models.is_default IS 'Whether this is the default model for new users';

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ai_models_provider
    ON public.ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_model_id
    ON public.ai_models(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active
    ON public.ai_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_models_min_tier
    ON public.ai_models(min_tier);
CREATE INDEX IF NOT EXISTS idx_ai_models_sort_order
    ON public.ai_models(sort_order);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Everyone can view active models
DROP POLICY IF EXISTS "Anyone can view active AI models" ON public.ai_models;
CREATE POLICY "Anyone can view active AI models"
    ON public.ai_models FOR SELECT
    USING (is_active = true);

-- Only service role can modify models (admin operations)
DROP POLICY IF EXISTS "Service role can manage AI models" ON public.ai_models;
CREATE POLICY "Service role can manage AI models"
    ON public.ai_models FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_ai_models_updated_at ON public.ai_models;
CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed default AI models
-- ============================================
INSERT INTO public.ai_models (provider, model_id, display_name, description, credits_per_message, input_cost_per_1k, output_cost_per_1k, context_window, max_output_tokens, capabilities, is_default, min_tier, sort_order)
VALUES
    -- OpenAI Models
    ('openai', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast and efficient for everyday tasks', 1, 0.000150, 0.000600, 128000, 16384,
     '["function_calling", "vision", "json_mode"]'::jsonb, true, 'free', 1),
    ('openai', 'gpt-4o', 'GPT-4o', 'Most capable OpenAI model for complex tasks', 3, 0.005000, 0.015000, 128000, 16384,
     '["function_calling", "vision", "json_mode"]'::jsonb, false, 'starter', 2),
    ('openai', 'gpt-4-turbo', 'GPT-4 Turbo', 'High performance with large context', 4, 0.010000, 0.030000, 128000, 4096,
     '["function_calling", "vision", "json_mode"]'::jsonb, false, 'pro', 3),

    -- Anthropic Models
    ('anthropic', 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'Fast and affordable for simple tasks', 1, 0.000250, 0.001250, 200000, 4096,
     '["function_calling", "vision"]'::jsonb, false, 'free', 4),
    ('anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Balanced performance and cost', 2, 0.003000, 0.015000, 200000, 8192,
     '["function_calling", "vision"]'::jsonb, false, 'starter', 5),
    ('anthropic', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Most capable Anthropic model', 5, 0.015000, 0.075000, 200000, 4096,
     '["function_calling", "vision"]'::jsonb, false, 'pro', 6),

    -- OpenRouter Models (access to multiple providers)
    ('openrouter', 'meta-llama/llama-3.1-8b-instruct', 'Llama 3.1 8B', 'Open source, fast and free-tier friendly', 1, 0.000055, 0.000055, 131072, 4096,
     '["function_calling"]'::jsonb, false, 'free', 7),
    ('openrouter', 'meta-llama/llama-3.1-70b-instruct', 'Llama 3.1 70B', 'Powerful open source model', 2, 0.000350, 0.000400, 131072, 4096,
     '["function_calling"]'::jsonb, false, 'starter', 8),
    ('openrouter', 'google/gemini-pro-1.5', 'Gemini 1.5 Pro', 'Google model with large context', 3, 0.001250, 0.005000, 1000000, 8192,
     '["function_calling", "vision"]'::jsonb, false, 'pro', 9)
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

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT SELECT ON public.ai_models TO anon;
GRANT SELECT ON public.ai_models TO authenticated;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP TABLE IF EXISTS public.ai_models CASCADE;
-- COMMIT;
