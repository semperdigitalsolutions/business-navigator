-- Migration: 019_users_is_admin
-- Description: Add is_admin column to users table for Epic 9 admin functionality
-- Author: AI Assistant
-- Date: 2026-01-29
-- Issue: #195

-- ============================================
-- Add is_admin column to users table
-- ============================================
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial index for admin lookups (only indexes TRUE values)
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

COMMENT ON COLUMN public.users.is_admin IS 'Whether user has admin privileges. Only modifiable by service role.';

-- ============================================
-- Helper function: is_admin(user_id)
-- Returns the is_admin value for a specific user
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    SELECT is_admin INTO v_is_admin
    FROM public.users
    WHERE id = p_user_id;

    RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_admin(UUID) IS 'Returns whether the specified user has admin privileges';

-- ============================================
-- RLS helper function: current_user_is_admin()
-- Returns true if the current authenticated user is an admin
-- Used in RLS policies for admin-only access
-- ============================================
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.current_user_is_admin() IS 'Returns true if auth.uid() has is_admin = true. For use in RLS policies.';

-- ============================================
-- RLS Policies for is_admin column
-- ============================================

-- Note: The existing "Users can view own profile" policy already allows users
-- to read their own row including is_admin. No changes needed for SELECT.

-- Note: The existing "Users can update own profile" policy allows users to
-- update their own row. We need to prevent users from modifying is_admin.

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Recreate the update policy (same as before - users can update own profile)
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create a trigger to prevent users from modifying is_admin
-- This provides defense-in-depth since RLS WITH CHECK cannot compare OLD vs NEW
CREATE OR REPLACE FUNCTION public.protect_is_admin_column()
RETURNS TRIGGER AS $$
BEGIN
    -- If is_admin is being changed
    IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
        -- Service role bypasses RLS entirely, so if we're here with RLS active,
        -- it means a regular user is trying to change is_admin
        -- Check if the current session is using authenticated role (not service_role)
        IF current_setting('role', true) = 'authenticated' OR
           current_setting('role', true) = 'anon' THEN
            RAISE EXCEPTION 'Only service role can modify is_admin column';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_is_admin_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_is_admin_column();

COMMENT ON FUNCTION public.protect_is_admin_column() IS 'Prevents non-service-role from modifying is_admin';

-- ============================================
-- Grant necessary permissions
-- ============================================

-- Grant execute on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

-- Note: is_admin can only be modified via service role (which bypasses RLS)
-- or via direct database access. The trigger provides additional protection.

-- ============================================
-- NOTE: No default admin users are set
-- Admin users must be manually designated using service role:
--
-- Example (run with service role/direct DB access):
-- UPDATE public.users SET is_admin = TRUE WHERE email = 'admin@example.com';
-- ============================================
