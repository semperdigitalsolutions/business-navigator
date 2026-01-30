-- Migration: 017_admin_audit_log.sql
-- Description: Creates admin_audit_log table for tracking admin actions
-- Author: AI Assistant
-- Date: 2026-01-29
-- Epic: #186 - Data-Driven Credits & Tier System
-- Issue: #217 - Database Migration Scripts for Credits System

-- ============================================
-- Admin Audit Log Table
-- Immutable log of all admin actions
-- ============================================

-- UP MIGRATION
BEGIN;

-- Create admin action type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_action_type') THEN
        CREATE TYPE admin_action_type AS ENUM (
            -- User management
            'user_create',
            'user_update',
            'user_delete',
            'user_suspend',
            'user_unsuspend',
            'user_tier_change',
            'user_credit_adjustment',

            -- API key management
            'api_key_create',
            'api_key_update',
            'api_key_delete',
            'api_key_rotate',

            -- Settings management
            'setting_create',
            'setting_update',
            'setting_delete',

            -- Feature flags
            'feature_flag_create',
            'feature_flag_update',
            'feature_flag_delete',

            -- AI models
            'ai_model_create',
            'ai_model_update',
            'ai_model_delete',

            -- Tier management
            'tier_create',
            'tier_update',
            'tier_delete',

            -- System actions
            'system_maintenance_start',
            'system_maintenance_end',
            'system_migration_run',
            'system_backup_create'
        );
    END IF;
END$$;

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action admin_action_type NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.admin_audit_log IS 'Immutable audit trail of all admin actions';
COMMENT ON COLUMN public.admin_audit_log.admin_user_id IS 'Admin who performed the action (NULL if system action)';
COMMENT ON COLUMN public.admin_audit_log.action IS 'Type of action performed';
COMMENT ON COLUMN public.admin_audit_log.resource_type IS 'Type of resource affected (user, setting, api_key, etc)';
COMMENT ON COLUMN public.admin_audit_log.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN public.admin_audit_log.details IS 'JSON with before/after values and additional context';
COMMENT ON COLUMN public.admin_audit_log.ip_address IS 'IP address of the admin';
COMMENT ON COLUMN public.admin_audit_log.user_agent IS 'Browser/client user agent string';

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id
    ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
    ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource_type
    ON public.admin_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource_id
    ON public.admin_audit_log(resource_id)
    WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at
    ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_created
    ON public.admin_audit_log(admin_user_id, created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.admin_audit_log;
CREATE POLICY "Service role can manage audit logs"
    ON public.admin_audit_log FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Function to log admin action
-- ============================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_admin_user_id UUID,
    p_action admin_action_type,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_log (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    )
    VALUES (
        p_admin_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to get recent admin actions
-- ============================================
CREATE OR REPLACE FUNCTION public.get_recent_admin_actions(
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0,
    p_admin_user_id UUID DEFAULT NULL,
    p_resource_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    admin_user_id UUID,
    admin_email TEXT,
    action admin_action_type,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.admin_user_id,
        u.email AS admin_email,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.ip_address,
        al.created_at
    FROM public.admin_audit_log al
    LEFT JOIN public.users u ON u.id = al.admin_user_id
    WHERE (p_admin_user_id IS NULL OR al.admin_user_id = p_admin_user_id)
      AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.log_admin_action(UUID, admin_action_type, TEXT, TEXT, JSONB, INET, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_recent_admin_actions(INTEGER, INTEGER, UUID, TEXT) TO service_role;

COMMIT;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.get_recent_admin_actions(INTEGER, INTEGER, UUID, TEXT);
-- DROP FUNCTION IF EXISTS public.log_admin_action(UUID, admin_action_type, TEXT, TEXT, JSONB, INET, TEXT);
-- DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
-- DROP TYPE IF EXISTS admin_action_type;
-- COMMIT;
