-- Migration: 020_credit_functions.sql
-- Description: PL/pgSQL functions for credit operations
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- Credit System Functions
-- Core functions for credit management
-- ============================================

-- UP MIGRATION
BEGIN;

-- ============================================
-- Function: Spend credits on AI message
-- Atomic operation to deduct credits and log transaction
-- ============================================
CREATE OR REPLACE FUNCTION public.spend_credits(
    p_user_id UUID,
    p_model_id TEXT,
    p_message_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    credits_spent INTEGER,
    balance_after INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_model RECORD;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_credits_to_spend INTEGER;
BEGIN
    -- Get model credit cost
    SELECT credits_per_message INTO v_model
    FROM public.ai_models
    WHERE model_id = p_model_id AND is_active = true;

    IF v_model IS NULL THEN
        RETURN QUERY SELECT false, 0, 0, 'Model not found or inactive'::TEXT;
        RETURN;
    END IF;

    v_credits_to_spend := v_model.credits_per_message;

    -- Lock and get current balance
    SELECT balance INTO v_current_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT false, 0, 0, 'User credits not initialized'::TEXT;
        RETURN;
    END IF;

    -- Check sufficient balance
    IF v_current_balance < v_credits_to_spend THEN
        RETURN QUERY SELECT false, 0, v_current_balance, 'Insufficient credits'::TEXT;
        RETURN;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance - v_credits_to_spend;

    -- Update balance
    UPDATE public.user_credits
    SET balance = v_new_balance,
        lifetime_spent = lifetime_spent + v_credits_to_spend,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Log transaction
    INSERT INTO public.credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        metadata,
        reference_id
    )
    VALUES (
        p_user_id,
        'usage'::credit_transaction_type,
        -v_credits_to_spend,
        v_current_balance,
        v_new_balance,
        'AI message: ' || p_model_id,
        jsonb_build_object('model_id', p_model_id),
        p_message_id
    );

    RETURN QUERY SELECT true, v_credits_to_spend, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Add credits to user
-- For purchases, bonuses, refunds, etc.
-- ============================================
CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type credit_transaction_type,
    p_description TEXT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    success BOOLEAN,
    credits_added INTEGER,
    balance_after INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_max_balance INTEGER;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT false, 0, 0, 'Amount must be positive'::TEXT;
        RETURN;
    END IF;

    -- Validate transaction type
    IF p_type NOT IN ('tier_refill', 'purchase', 'bonus', 'refund', 'adjustment') THEN
        RETURN QUERY SELECT false, 0, 0, 'Invalid transaction type for adding credits'::TEXT;
        RETURN;
    END IF;

    -- Get max balance from settings
    SELECT COALESCE((value::TEXT)::INTEGER, 100000) INTO v_max_balance
    FROM public.site_settings
    WHERE key = 'max_credits_balance';

    IF v_max_balance IS NULL THEN
        v_max_balance := 100000;
    END IF;

    -- Lock and get current balance
    SELECT balance INTO v_current_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        -- Initialize credits if not exists
        INSERT INTO public.user_credits (user_id, balance, lifetime_earned)
        VALUES (p_user_id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;

        v_current_balance := 0;
    END IF;

    -- Calculate new balance (cap at max)
    v_new_balance := LEAST(v_current_balance + p_amount, v_max_balance);

    -- Update balance
    UPDATE public.user_credits
    SET balance = v_new_balance,
        lifetime_earned = lifetime_earned + (v_new_balance - v_current_balance),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Log transaction
    INSERT INTO public.credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        metadata,
        reference_id
    )
    VALUES (
        p_user_id,
        p_type,
        v_new_balance - v_current_balance,
        v_current_balance,
        v_new_balance,
        p_description,
        p_metadata,
        p_reference_id
    );

    RETURN QUERY SELECT true, v_new_balance - v_current_balance, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Monthly tier credit refill
-- Called by scheduled job
-- ============================================
CREATE OR REPLACE FUNCTION public.refill_tier_credits(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    users_processed INTEGER,
    total_credits_added INTEGER
) AS $$
DECLARE
    v_users_processed INTEGER := 0;
    v_total_credits INTEGER := 0;
    v_user RECORD;
    v_tier_credits INTEGER;
    v_result RECORD;
BEGIN
    FOR v_user IN
        SELECT
            uc.user_id,
            u.subscription_tier,
            st.monthly_credits
        FROM public.user_credits uc
        JOIN public.users u ON u.id = uc.user_id
        JOIN public.subscription_tiers st ON st.slug = u.subscription_tier
        WHERE (p_user_id IS NULL OR uc.user_id = p_user_id)
          AND (uc.next_refill_at IS NULL OR uc.next_refill_at <= NOW())
          AND st.monthly_credits > 0
    LOOP
        -- Add tier credits
        SELECT * INTO v_result
        FROM public.add_credits(
            v_user.user_id,
            v_user.monthly_credits,
            'tier_refill'::credit_transaction_type,
            'Monthly ' || v_user.subscription_tier || ' tier credits'
        );

        IF v_result.success THEN
            v_users_processed := v_users_processed + 1;
            v_total_credits := v_total_credits + v_result.credits_added;

            -- Update next refill date
            UPDATE public.user_credits
            SET last_refill_at = NOW(),
                next_refill_at = NOW() + INTERVAL '1 month'
            WHERE user_id = v_user.user_id;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_users_processed, v_total_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Check if user can use model
-- Based on tier and credit balance
-- ============================================
CREATE OR REPLACE FUNCTION public.can_use_model(
    p_user_id UUID,
    p_model_id TEXT
)
RETURNS TABLE (
    allowed BOOLEAN,
    reason TEXT,
    credits_required INTEGER,
    credits_available INTEGER
) AS $$
DECLARE
    v_model RECORD;
    v_user_tier TEXT;
    v_user_credits INTEGER;
BEGIN
    -- Get model info
    SELECT * INTO v_model
    FROM public.ai_models
    WHERE model_id = p_model_id AND is_active = true;

    IF v_model IS NULL THEN
        RETURN QUERY SELECT false, 'Model not found or inactive'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Get user tier and credits
    SELECT u.subscription_tier, uc.balance
    INTO v_user_tier, v_user_credits
    FROM public.users u
    LEFT JOIN public.user_credits uc ON uc.user_id = u.id
    WHERE u.id = p_user_id;

    IF v_user_tier IS NULL THEN
        RETURN QUERY SELECT false, 'User not found'::TEXT, v_model.credits_per_message, 0;
        RETURN;
    END IF;

    v_user_credits := COALESCE(v_user_credits, 0);

    -- Check tier requirement
    IF NOT public.tier_meets_minimum(v_user_tier, v_model.min_tier) THEN
        RETURN QUERY SELECT
            false,
            'Model requires ' || v_model.min_tier || ' tier or higher'::TEXT,
            v_model.credits_per_message,
            v_user_credits;
        RETURN;
    END IF;

    -- Check credit balance
    IF v_user_credits < v_model.credits_per_message THEN
        RETURN QUERY SELECT
            false,
            'Insufficient credits'::TEXT,
            v_model.credits_per_message,
            v_user_credits;
        RETURN;
    END IF;

    RETURN QUERY SELECT
        true,
        NULL::TEXT,
        v_model.credits_per_message,
        v_user_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Helper function: Compare tier levels
-- ============================================
CREATE OR REPLACE FUNCTION public.tier_meets_minimum(
    p_user_tier TEXT,
    p_required_tier TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_level INTEGER;
    v_required_level INTEGER;
BEGIN
    -- Map tier slugs to numeric levels
    -- Supports both old tier names (basic) and new tier names (starter/business)
    v_user_level := CASE p_user_tier
        WHEN 'free' THEN 1
        WHEN 'starter' THEN 2
        WHEN 'basic' THEN 2  -- alias for starter
        WHEN 'pro' THEN 3
        WHEN 'business' THEN 4
        WHEN 'enterprise' THEN 5
        ELSE 0
    END;

    v_required_level := CASE p_required_tier
        WHEN 'free' THEN 1
        WHEN 'starter' THEN 2
        WHEN 'basic' THEN 2  -- alias for starter
        WHEN 'pro' THEN 3
        WHEN 'business' THEN 4
        WHEN 'enterprise' THEN 5
        ELSE 0
    END;

    RETURN v_user_level >= v_required_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Function: Get user credit summary
-- ============================================
CREATE OR REPLACE FUNCTION public.get_credit_summary(p_user_id UUID)
RETURNS TABLE (
    balance INTEGER,
    lifetime_earned INTEGER,
    lifetime_spent INTEGER,
    tier TEXT,
    tier_credits_monthly INTEGER,
    next_refill_at TIMESTAMPTZ,
    usage_this_month INTEGER,
    available_models JSONB
) AS $$
DECLARE
    v_month_start TIMESTAMPTZ;
BEGIN
    v_month_start := DATE_TRUNC('month', NOW());

    RETURN QUERY
    SELECT
        uc.balance,
        uc.lifetime_earned,
        uc.lifetime_spent,
        u.subscription_tier,
        st.monthly_credits,
        uc.next_refill_at,
        COALESCE((
            SELECT SUM(ABS(ct.amount))::INTEGER
            FROM public.credit_transactions ct
            WHERE ct.user_id = p_user_id
              AND ct.transaction_type = 'usage'
              AND ct.created_at >= v_month_start
        ), 0)::INTEGER,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'model_id', am.model_id,
                'display_name', am.display_name,
                'credits_per_message', am.credits_per_message,
                'can_use', public.tier_meets_minimum(u.subscription_tier, am.min_tier)
                    AND uc.balance >= am.credits_per_message
            ))
            FROM public.ai_models am
            WHERE am.is_active = true
        )
    FROM public.user_credits uc
    JOIN public.users u ON u.id = uc.user_id
    LEFT JOIN public.subscription_tiers st ON st.slug = u.subscription_tier
    WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.spend_credits(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, credit_transaction_type, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.refill_tier_credits(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_use_model(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tier_meets_minimum(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_credit_summary(UUID) TO authenticated;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.get_credit_summary(UUID);
-- DROP FUNCTION IF EXISTS public.tier_meets_minimum(TEXT, TEXT);
-- DROP FUNCTION IF EXISTS public.can_use_model(UUID, TEXT);
-- DROP FUNCTION IF EXISTS public.refill_tier_credits(UUID);
-- DROP FUNCTION IF EXISTS public.add_credits(UUID, INTEGER, credit_transaction_type, TEXT, TEXT, JSONB);
-- DROP FUNCTION IF EXISTS public.spend_credits(UUID, TEXT, TEXT);
-- COMMIT;
