-- ============================================
-- Epic 9: Data-Driven Credits & Tier System
-- Master Migration Script
-- ============================================
--
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System
--
-- Description:
-- This script runs all Epic 9 migrations in the correct order.
-- All migrations are idempotent (use IF NOT EXISTS) and can be
-- safely re-run without causing errors.
--
-- Prerequisites:
-- - Migrations 001-010 must already be applied
-- - uuid-ossp extension must be enabled
-- - update_updated_at_column() function must exist
--
-- Usage:
-- Run this entire file in the Supabase SQL Editor or via psql:
--   psql $DATABASE_URL -f run_epic9_migrations.sql
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

-- ============================================
-- SECTION 1: SUBSCRIPTION TIERS (011)
-- Foundation table for credit system
-- ============================================

\echo '=== Running 011_subscription_tiers.sql ==='

\i 011_subscription_tiers.sql

\echo '=== Completed 011_subscription_tiers.sql ==='

-- ============================================
-- SECTION 2: AI MODELS (012)
-- Model catalog with credit costs
-- Depends on: subscription_tiers
-- ============================================

\echo '=== Running 012_ai_models.sql ==='

\i 012_ai_models.sql

\echo '=== Completed 012_ai_models.sql ==='

-- ============================================
-- SECTION 3: USER CREDITS (013)
-- User balance tracking
-- Depends on: users, subscription_tiers
-- ============================================

\echo '=== Running 013_user_credits.sql ==='

\i 013_user_credits.sql

\echo '=== Completed 013_user_credits.sql ==='

-- ============================================
-- SECTION 4: CREDIT TRANSACTIONS (014)
-- Transaction ledger
-- Depends on: users
-- ============================================

\echo '=== Running 014_credit_transactions.sql ==='

\i 014_credit_transactions.sql

\echo '=== Completed 014_credit_transactions.sql ==='

-- ============================================
-- SECTION 5: SITE SETTINGS (015)
-- Application configuration store
-- No dependencies
-- ============================================

\echo '=== Running 015_site_settings.sql ==='

\i 015_site_settings.sql

\echo '=== Completed 015_site_settings.sql ==='

-- ============================================
-- SECTION 6: ADMIN API KEYS (016)
-- Platform-wide API keys for AI providers
-- Depends on: auth.users
-- ============================================

\echo '=== Running 016_admin_api_keys.sql ==='

\i 016_admin_api_keys.sql

\echo '=== Completed 016_admin_api_keys.sql ==='

-- ============================================
-- SECTION 7: ADMIN AUDIT LOG (017)
-- Audit trail for admin actions
-- Depends on: users
-- ============================================

\echo '=== Running 017_admin_audit_log.sql ==='

\i 017_admin_audit_log.sql

\echo '=== Completed 017_admin_audit_log.sql ==='

-- ============================================
-- SECTION 8: FEATURE FLAGS (018)
-- Feature toggle management
-- No dependencies
-- ============================================

\echo '=== Running 018_feature_flags.sql ==='

\i 018_feature_flags.sql

\echo '=== Completed 018_feature_flags.sql ==='

-- ============================================
-- SECTION 9: USERS IS_ADMIN (019)
-- Add admin column to users table
-- Depends on: users, admin_audit_log (for log_admin_action)
-- ============================================

\echo '=== Running 019_users_is_admin.sql ==='

\i 019_users_is_admin.sql

\echo '=== Completed 019_users_is_admin.sql ==='

-- ============================================
-- SECTION 10: CREDIT FUNCTIONS (020)
-- PL/pgSQL functions for credit operations
-- Depends on: all previous tables
-- ============================================

\echo '=== Running 020_credit_functions.sql ==='

\i 020_credit_functions.sql

\echo '=== Completed 020_credit_functions.sql ==='

-- ============================================
-- POST-MIGRATION VERIFICATION
-- ============================================

\echo '=== Verifying Epic 9 migrations ==='

DO $$
DECLARE
    v_table_count INTEGER;
    v_function_count INTEGER;
    v_expected_tables TEXT[] := ARRAY[
        'subscription_tiers',
        'ai_models',
        'user_credits',
        'credit_transactions',
        'site_settings',
        'admin_api_keys',
        'admin_audit_log',
        'feature_flags'
    ];
    v_expected_functions TEXT[] := ARRAY[
        'ensure_single_default_tier',
        'initialize_user_credits',
        'get_site_setting',
        'set_site_setting',
        'log_admin_action',
        'get_recent_admin_actions',
        'is_feature_enabled',
        'get_user_features',
        'is_admin',
        'current_user_is_admin',
        'protect_is_admin_column',
        'spend_credits',
        'add_credits',
        'refill_tier_credits',
        'can_use_model',
        'tier_meets_minimum',
        'get_credit_summary'
    ];
    v_missing_tables TEXT[] := '{}';
    v_missing_functions TEXT[] := '{}';
    v_table TEXT;
    v_function TEXT;
BEGIN
    -- Check tables
    FOREACH v_table IN ARRAY v_expected_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = v_table
        ) THEN
            v_missing_tables := array_append(v_missing_tables, v_table);
        END IF;
    END LOOP;

    -- Check functions
    FOREACH v_function IN ARRAY v_expected_functions LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = v_function
        ) THEN
            v_missing_functions := array_append(v_missing_functions, v_function);
        END IF;
    END LOOP;

    -- Report results
    IF array_length(v_missing_tables, 1) > 0 THEN
        RAISE WARNING 'Missing tables: %', v_missing_tables;
    END IF;

    IF array_length(v_missing_functions, 1) > 0 THEN
        RAISE WARNING 'Missing functions: %', v_missing_functions;
    END IF;

    IF array_length(v_missing_tables, 1) IS NULL AND array_length(v_missing_functions, 1) IS NULL THEN
        RAISE NOTICE 'SUCCESS: All Epic 9 tables and functions created successfully!';
    ELSE
        RAISE WARNING 'PARTIAL SUCCESS: Some objects may be missing. Check warnings above.';
    END IF;

    -- Display summary
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY(v_expected_tables);

    RAISE NOTICE 'Tables created: % / %', v_table_count, array_length(v_expected_tables, 1);
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

\echo ''
\echo '============================================'
\echo 'Epic 9 Migrations Complete!'
\echo '============================================'
\echo ''
\echo 'New tables created:'
\echo '  - subscription_tiers: Tier definitions with credits'
\echo '  - ai_models: AI model catalog with pricing'
\echo '  - user_credits: User credit balances'
\echo '  - credit_transactions: Transaction ledger'
\echo '  - site_settings: Application configuration'
\echo '  - admin_api_keys: Platform API keys'
\echo '  - admin_audit_log: Admin action audit trail'
\echo '  - feature_flags: Feature toggles'
\echo ''
\echo 'Users table updated:'
\echo '  - Added is_admin column'
\echo ''
\echo 'Next steps:'
\echo '  1. Verify RLS policies in Supabase dashboard'
\echo '  2. Update backend TypeScript types (database.ts)'
\echo '  3. Implement credit checking in chat routes'
\echo '  4. Build admin dashboard UI'
\echo ''
