/**
 * Supabase database configuration
 */
import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'
import type { Database } from '@/types/database.js'

// Client for authenticated requests (uses anon key)
export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
})

// Admin client for server-side operations (uses service role key)
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
