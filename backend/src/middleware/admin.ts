/**
 * Admin authentication middleware
 *
 * Verifies that the authenticated user has admin privileges.
 * Uses supabaseAdmin to check is_admin flag from users table.
 */
import type { Context } from 'elysia'
import { supabaseAdmin } from '@/config/database.js'
import { authMiddleware, type AuthUser } from './auth.js'

export interface AdminAuthResult {
  success: boolean
  user?: AuthUser
  isAdmin?: boolean
  error?: string
  status?: number
}

/**
 * Admin authentication middleware
 *
 * First verifies regular authentication, then checks admin status.
 * Returns 403 Forbidden if user is not an admin.
 *
 * @param context - Elysia context containing the request
 * @returns AdminAuthResult with success status and user info
 */
export async function adminMiddleware(context: Context): Promise<AdminAuthResult> {
  // First check regular auth
  const auth = await authMiddleware(context)

  if (!auth.success || !auth.user) {
    return {
      success: false,
      error: auth.error || 'Unauthorized',
      status: auth.status || 401,
    }
  }

  try {
    // Query admin status using supabaseAdmin (bypasses RLS)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', auth.user.id)
      .single()

    if (error) {
      return {
        success: false,
        error: 'Failed to verify admin status',
        status: 500,
      }
    }

    if (!user?.is_admin) {
      return {
        success: false,
        error: 'Admin access required',
        status: 403,
      }
    }

    return {
      success: true,
      user: auth.user,
      isAdmin: true,
    }
  } catch {
    return {
      success: false,
      error: 'Admin verification failed',
      status: 500,
    }
  }
}
