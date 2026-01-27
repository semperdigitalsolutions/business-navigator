/**
 * Supabase database configuration
 *
 * SECURITY AUDIT (2026-01-18): Service role key properly separated
 */
import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'
import type { Database } from '@/types/database.js'

/**
 * Client for authenticated requests (uses anon key)
 *
 * USE THIS CLIENT for:
 * - All user-facing operations (routes, services)
 * - Operations that should respect RLS policies
 * - Standard CRUD operations with user authentication
 *
 * This client respects Row Level Security (RLS) policies.
 */
export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
})

/**
 * Admin client for server-side operations (uses service role key)
 *
 * ⚠️ WARNING: This client BYPASSES Row Level Security (RLS)
 *
 * USE THIS CLIENT ONLY for:
 * - Database migrations and seeding
 * - Background jobs that need admin access
 * - System-level operations (e.g., user deletion, cleanup)
 *
 * NEVER use this in:
 * - Route handlers
 * - User-facing services
 * - Operations with user input
 *
 * AUDIT LOG: Currently unused (2026-01-18) - reserved for future admin operations
 */
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    return !error
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}
