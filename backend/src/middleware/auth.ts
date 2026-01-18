/**
 * Authentication middleware using Supabase
 */
import type { Context } from 'elysia'
import { supabase } from '@/config/database.js'

export interface AuthUser {
  id: string
  email: string
}

export interface AuthResult {
  success: boolean
  userId?: string
  email?: string
  user?: AuthUser
  error?: string
  status?: number
}

export async function authMiddleware(context: Context): Promise<AuthResult> {
  const authorization = context.request.headers.get('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Missing or invalid authorization header',
      status: 401,
    }
  }

  const token = authorization.replace('Bearer ', '')

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401,
      }
    }

    // Return with both userId and user for compatibility
    return {
      success: true,
      userId: user.id,
      email: user.email!,
      user: {
        id: user.id,
        email: user.email!,
      } as AuthUser,
    }
  } catch {
    return {
      success: false,
      error: 'Authentication failed',
      status: 500,
    }
  }
}

// Optional auth middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(context: Context): Promise<AuthResult> {
  const authorization = context.request.headers.get('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      success: true,
    }
  }

  return authMiddleware(context)
}
