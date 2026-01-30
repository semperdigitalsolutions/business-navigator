-- ============================================
-- Epic 9: Data-Driven Credits & Tier System
-- Emergency Rollback Script
-- ============================================
--
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System
--
-- WARNING: This script will DROP all Epic 9 tables and functions!
-- All data in these tables will be PERMANENTLY LOST!
--
-- Use this script only in emergency situations where you need to
-- completely undo the Epic 9 migrations.
--
-- Usage:
--   psql $DATABASE_URL -f rollback_epic9.sql
--
-- ============================================

-- ============================================
-- SAFETY CHECK
-- ============================================

DO $$
BEGIN
    RAISE WARNING '===============================================';
    RAISE WARNING 'DANGER: This will DELETE all Epic 9 data!';
    RAISE WARNING '===============================================';
    RAISE WARNING 'Tables to be dropped:';
    RAISE WARNING '  - credit_transactions (all transaction history)';
    RAISE WARNING '  - user_credits (all user balances)';
    RAISE WARNING '  - ai_models (model catalog)';
    RAISE WARNING '  - subscription_tiers (tier definitions)';
    RAISE WARNING '  - site_settings (all configuration)';
    RAISE WARNING '  - admin_api_keys (encrypted API keys)';
    RAISE WARNING '  - admin_audit_log (audit trail)';
    RAISE WARNING '  - feature_flags (feature toggles)';
    RAISE WARNING '===============================================';
    RAISE WARNING 'Proceeding with rollback in 3 seconds...';
    PERFORM pg_sleep(3);
END $$;

-- ============================================
-- SECTION 10: ROLLBACK CREDIT FUNCTIONS (020)
-- Remove credit operation functions first
-- ============================================

\echo '=== Rolling back 020_credit_functions.sql ==='

BEGIN;

DROP FUNCTION IF EXISTS public.get_credit_summary(UUID);
DROP FUNCTION IF EXISTS public.tier_meets_minimum(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.can_use_model(UUID, TEXT);
DROP FUNCTION IF EXISTS public.refill_tier_credits(UUID);
DROP FUNCTION IF EXISTS public.add_credits(UUID, INTEGER, credit_transaction_type, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.spend_credits(UUID, TEXT, TEXT);

COMMIT;

\echo '=== Completed rollback of 020_credit_functions.sql ==='

-- ============================================
-- SECTION 9: ROLLBACK USERS IS_ADMIN (019)
-- Remove admin column and related functions
-- ============================================

\echo '=== Rolling back 019_users_is_admin.sql ==='

BEGIN;

-- Drop admin view
DROP VIEW IF EXISTS public.admin_users;

-- Drop functions
DROP FUNCTION IF EXISTS public.set_user_admin(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.protect_is_admin_column() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Drop policies (restore original if needed)
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Recreate original policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Drop index
DROP INDEX IF EXISTS idx_users_is_admin;

-- Drop column
ALTER TABLE public.users DROP COLUMN IF EXISTS is_admin;

COMMIT;

\echo '=== Completed rollback of 019_users_is_admin.sql ==='

-- ============================================
-- SECTION 8: ROLLBACK FEATURE FLAGS (018)
-- ============================================

\echo '=== Rolling back 018_feature_flags.sql ==='

BEGIN;

DROP FUNCTION IF EXISTS public.get_user_features(UUID, TEXT);
DROP FUNCTION IF EXISTS public.is_feature_enabled(TEXT, UUID, TEXT);
DROP TABLE IF EXISTS public.feature_flags CASCADE;

COMMIT;

\echo '=== Completed rollback of 018_feature_flags.sql ==='

-- ============================================
-- SECTION 7: ROLLBACK ADMIN AUDIT LOG (017)
-- ============================================

\echo '=== Rolling back 017_admin_audit_log.sql ==='

BEGIN;

DROP FUNCTION IF EXISTS public.get_recent_admin_actions(INTEGER, INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS public.log_admin_action(UUID, admin_action_type, TEXT, TEXT, JSONB, INET, TEXT);
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TYPE IF EXISTS admin_action_type;

COMMIT;

\echo '=== Completed rollback of 017_admin_audit_log.sql ==='

-- ============================================
-- SECTION 6: ROLLBACK ADMIN API KEYS (016)
-- ============================================

\echo '=== Rolling back 016_admin_api_keys.sql ==='

BEGIN;

DROP VIEW IF EXISTS public.admin_api_keys_status;
DROP FUNCTION IF EXISTS public.reset_admin_api_budgets();
DROP FUNCTION IF EXISTS public.record_api_usage_cost(TEXT, DECIMAL);
DROP FUNCTION IF EXISTS public.get_admin_api_key(TEXT);
DROP TABLE IF EXISTS public.admin_api_keys CASCADE;

COMMIT;

\echo '=== Completed rollback of 016_admin_api_keys.sql ==='

-- ============================================
-- SECTION 5: ROLLBACK SITE SETTINGS (015)
-- ============================================

\echo '=== Rolling back 015_site_settings.sql ==='

BEGIN;

DROP FUNCTION IF EXISTS public.set_site_setting(TEXT, JSONB, TEXT, TEXT, BOOLEAN, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_site_setting(TEXT);
DROP TABLE IF EXISTS public.site_settings CASCADE;

COMMIT;

\echo '=== Completed rollback of 015_site_settings.sql ==='

-- ============================================
-- SECTION 4: ROLLBACK CREDIT TRANSACTIONS (014)
-- ============================================

\echo '=== Rolling back 014_credit_transactions.sql ==='

BEGIN;

DROP VIEW IF EXISTS public.user_credit_summary;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TYPE IF EXISTS credit_transaction_type;

COMMIT;

\echo '=== Completed rollback of 014_credit_transactions.sql ==='

-- ============================================
-- SECTION 3: ROLLBACK USER CREDITS (013)
-- ============================================

\echo '=== Rolling back 013_user_credits.sql ==='

BEGIN;

DROP TRIGGER IF EXISTS on_user_created_init_credits ON public.users;
DROP FUNCTION IF EXISTS public.initialize_user_credits() CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;

COMMIT;

\echo '=== Completed rollback of 013_user_credits.sql ==='

-- ============================================
-- SECTION 2: ROLLBACK AI MODELS (012)
-- ============================================

\echo '=== Rolling back 012_ai_models.sql ==='

BEGIN;

DROP TABLE IF EXISTS public.ai_models CASCADE;

COMMIT;

\echo '=== Completed rollback of 012_ai_models.sql ==='

-- ============================================
-- SECTION 1: ROLLBACK SUBSCRIPTION TIERS (011)
-- Must be last due to foreign key constraints
-- ============================================

\echo '=== Rolling back 011_subscription_tiers.sql ==='

BEGIN;

DROP TRIGGER IF EXISTS enforce_single_default_tier ON public.subscription_tiers;
DROP FUNCTION IF EXISTS public.ensure_single_default_tier() CASCADE;
DROP TABLE IF EXISTS public.subscription_tiers CASCADE;

COMMIT;

\echo '=== Completed rollback of 011_subscription_tiers.sql ==='

-- ============================================
-- VERIFICATION
-- ============================================

\echo '=== Verifying rollback ==='

DO $$
DECLARE
    v_remaining_tables TEXT[];
    v_epic9_tables TEXT[] := ARRAY[
        'subscription_tiers',
        'ai_models',
        'user_credits',
        'credit_transactions',
        'site_settings',
        'admin_api_keys',
        'admin_audit_log',
        'feature_flags'
    ];
    v_table TEXT;
BEGIN
    v_remaining_tables := '{}';

    FOREACH v_table IN ARRAY v_epic9_tables LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = v_table
        ) THEN
            v_remaining_tables := array_append(v_remaining_tables, v_table);
        END IF;
    END LOOP;

    IF array_length(v_remaining_tables, 1) > 0 THEN
        RAISE WARNING 'INCOMPLETE: Some tables still exist: %', v_remaining_tables;
    ELSE
        RAISE NOTICE 'SUCCESS: All Epic 9 tables have been dropped.';
    END IF;

    -- Check if is_admin column was removed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'is_admin'
    ) THEN
        RAISE WARNING 'WARNING: users.is_admin column still exists';
    ELSE
        RAISE NOTICE 'SUCCESS: users.is_admin column removed.';
    END IF;
END $$;

-- ============================================
-- ROLLBACK COMPLETE
-- ============================================

\echo ''
\echo '============================================'
\echo 'Epic 9 Rollback Complete!'
\echo '============================================'
\echo ''
\echo 'Dropped tables:'
\echo '  - subscription_tiers'
\echo '  - ai_models'
\echo '  - user_credits'
\echo '  - credit_transactions'
\echo '  - site_settings'
\echo '  - admin_api_keys'
\echo '  - admin_audit_log'
\echo '  - feature_flags'
\echo ''
\echo 'Removed from users table:'
\echo '  - is_admin column'
\echo ''
\echo 'NOTE: If you need to re-apply Epic 9 migrations,'
\echo 'run: psql $DATABASE_URL -f run_epic9_migrations.sql'
\echo ''
