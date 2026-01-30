-- Migration: 013_user_credits.sql
-- Description: Creates user_credits table for credit balance tracking
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- User Credits Table
-- Tracks current credit balance per user
-- ============================================

-- UP MIGRATION
BEGIN;

-- Create user_credits table
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

-- Add comments for documentation
COMMENT ON TABLE public.user_credits IS 'User credit balances for AI model usage';
COMMENT ON COLUMN public.user_credits.balance IS 'Current available credit balance (cannot be negative)';
COMMENT ON COLUMN public.user_credits.lifetime_earned IS 'Total credits ever received (purchases + tier refills + bonuses)';
COMMENT ON COLUMN public.user_credits.lifetime_spent IS 'Total credits ever spent on AI messages';
COMMENT ON COLUMN public.user_credits.last_refill_at IS 'When the last automatic tier refill occurred';
COMMENT ON COLUMN public.user_credits.next_refill_at IS 'When the next automatic refill is scheduled';

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id
    ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_next_refill_at
    ON public.user_credits(next_refill_at)
    WHERE next_refill_at IS NOT NULL;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own credit balance
DROP POLICY IF EXISTS "Users can view own credit balance" ON public.user_credits;
CREATE POLICY "Users can view own credit balance"
    ON public.user_credits FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can modify credits (through functions)
DROP POLICY IF EXISTS "Service role can manage user credits" ON public.user_credits;
CREATE POLICY "Service role can manage user credits"
    ON public.user_credits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to initialize user credits on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_tier_credits INTEGER;
BEGIN
    -- Get the free tier's monthly credits as starting balance
    SELECT COALESCE(monthly_credits, 50) INTO v_tier_credits
    FROM public.subscription_tiers
    WHERE slug = 'free'
    LIMIT 1;

    -- Create credit balance record for new user
    INSERT INTO public.user_credits (
        user_id,
        balance,
        lifetime_earned,
        last_refill_at,
        next_refill_at
    )
    VALUES (
        NEW.id,
        v_tier_credits,
        v_tier_credits,
        NOW(),
        NOW() + INTERVAL '1 month'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize credits when a user is created
DROP TRIGGER IF EXISTS on_user_created_init_credits ON public.users;
CREATE TRIGGER on_user_created_init_credits
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_credits();

-- ============================================
-- Initialize credits for existing users
-- ============================================
INSERT INTO public.user_credits (user_id, balance, lifetime_earned, last_refill_at, next_refill_at)
SELECT
    u.id,
    COALESCE(st.monthly_credits, 50),
    COALESCE(st.monthly_credits, 50),
    NOW(),
    NOW() + INTERVAL '1 month'
FROM public.users u
LEFT JOIN public.subscription_tiers st ON st.slug = COALESCE(u.subscription_tier, 'free')
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_credits uc WHERE uc.user_id = u.id
);

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT SELECT ON public.user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_credits() TO service_role;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP TRIGGER IF EXISTS on_user_created_init_credits ON public.users;
-- DROP FUNCTION IF EXISTS public.initialize_user_credits() CASCADE;
-- DROP TABLE IF EXISTS public.user_credits CASCADE;
-- COMMIT;
