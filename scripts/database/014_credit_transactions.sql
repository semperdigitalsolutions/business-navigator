-- Migration: 014_credit_transactions.sql
-- Description: Creates credit_transactions table for transaction ledger
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- Credit Transactions Table
-- Immutable ledger of all credit movements
-- ============================================

-- UP MIGRATION
BEGIN;

-- Create transaction type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_transaction_type') THEN
        CREATE TYPE credit_transaction_type AS ENUM (
            'tier_refill',      -- Monthly tier credit allocation
            'purchase',         -- Purchased credit pack
            'bonus',            -- Promotional or referral bonus
            'usage',            -- Spent on AI message
            'refund',           -- Refunded credits
            'adjustment',       -- Manual admin adjustment
            'expiration'        -- Credits expired
        );
    END IF;
END$$;

-- Create credit_transactions table
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

-- Add comments for documentation
COMMENT ON TABLE public.credit_transactions IS 'Immutable ledger of all credit transactions';
COMMENT ON COLUMN public.credit_transactions.amount IS 'Positive for credits added, negative for credits spent';
COMMENT ON COLUMN public.credit_transactions.balance_before IS 'User balance before this transaction';
COMMENT ON COLUMN public.credit_transactions.balance_after IS 'User balance after this transaction';
COMMENT ON COLUMN public.credit_transactions.metadata IS 'Additional context (model_id, message_id, stripe_payment_id, etc)';
COMMENT ON COLUMN public.credit_transactions.reference_id IS 'External reference (payment ID, message ID, etc)';

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
    ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type
    ON public.credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
    ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
    ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference_id
    ON public.credit_transactions(reference_id)
    WHERE reference_id IS NOT NULL;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert transactions (through functions)
DROP POLICY IF EXISTS "Service role can manage credit transactions" ON public.credit_transactions;
CREATE POLICY "Service role can manage credit transactions"
    ON public.credit_transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- View for user transaction summary
-- ============================================
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

COMMENT ON VIEW public.user_credit_summary IS 'Aggregated credit usage statistics per user';

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.user_credit_summary TO authenticated;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP VIEW IF EXISTS public.user_credit_summary;
-- DROP TABLE IF EXISTS public.credit_transactions CASCADE;
-- DROP TYPE IF EXISTS credit_transaction_type;
-- COMMIT;
