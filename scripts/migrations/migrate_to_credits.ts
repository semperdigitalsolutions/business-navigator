/**
 * Migration Script: Migrate Existing Users to Credits System
 * Issue #220: Migrate Existing Users to Credits System
 *
 * This script migrates existing users from the old tier-based system
 * to the new credit-based system.
 *
 * Usage:
 *   bun scripts/migrations/migrate_to_credits.ts [options]
 *
 * Options:
 *   --dry-run         Preview changes without executing (default: false)
 *   --batch-size=N    Process users in batches of N (default: 100)
 *   --continue-on-error  Continue processing even if individual users fail
 *
 * Tier Mapping:
 *   null/free     -> 'free' tier (50 credits)
 *   basic         -> 'starter' tier (200 credits)
 *   pro           -> 'pro' tier (500 credits)
 *   enterprise    -> 'enterprise' tier (unlimited/-1 credits)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// Types
interface User {
  id: string
  email: string
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise' | null
  created_at: string
}

interface UserCredits {
  user_id: string
  tier_slug: string
  credits_balance: number
  credits_used_this_period: number
  period_start: string
  period_end: string
}

interface CreditTransaction {
  user_id: string
  amount: number
  transaction_type: 'migration'
  description: string
  metadata: Record<string, unknown>
}

interface MigrationResult {
  userId: string
  email: string
  oldTier: string
  newTier: string
  creditsGranted: number
  status: 'migrated' | 'skipped' | 'failed'
  error?: string
}

interface MigrationSummary {
  total: number
  migrated: number
  skipped: number
  failed: number
  results: MigrationResult[]
}

// Configuration
const TIER_MAPPING: Record<string, { slug: string; credits: number }> = {
  free: { slug: 'free', credits: 50 },
  basic: { slug: 'starter', credits: 200 },
  pro: { slug: 'pro', credits: 500 },
  enterprise: { slug: 'enterprise', credits: -1 }, // Unlimited
}

const DEFAULT_TIER = TIER_MAPPING.free

// Parse command line arguments
function parseArgs(): {
  dryRun: boolean
  batchSize: number
  continueOnError: boolean
} {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const continueOnError = args.includes('--continue-on-error')

  let batchSize = 100
  const batchArg = args.find((arg) => arg.startsWith('--batch-size='))
  if (batchArg) {
    const value = parseInt(batchArg.split('=')[1], 10)
    if (!isNaN(value) && value > 0) {
      batchSize = value
    }
  }

  return { dryRun, batchSize, continueOnError }
}

// Environment validation
function validateEnvironment(): { supabaseUrl: string; supabaseServiceKey: string } {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('Error: SUPABASE_URL environment variable is required')
    process.exit(1)
  }

  if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
    process.exit(1)
  }

  return { supabaseUrl, supabaseServiceKey }
}

// Create Supabase admin client
function createSupabaseAdmin(url: string, serviceKey: string): AnySupabaseClient {
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get tier mapping for a user's subscription tier
function getTierMapping(subscriptionTier: string | null): { slug: string; credits: number } {
  if (!subscriptionTier || !(subscriptionTier in TIER_MAPPING)) {
    return DEFAULT_TIER
  }
  return TIER_MAPPING[subscriptionTier]
}

// Calculate period dates (monthly)
function calculatePeriodDates(): { periodStart: string; periodEnd: string } {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  }
}

// Check if user already has credits record
async function userHasCredits(supabase: AnySupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is expected
    throw new Error(`Error checking user credits: ${error.message}`)
  }

  return !!data
}

// Migrate a single user
async function migrateUser(
  supabase: AnySupabaseClient,
  user: User,
  dryRun: boolean
): Promise<MigrationResult> {
  const oldTier = user.subscription_tier || 'free'
  const { slug: newTier, credits: creditsGranted } = getTierMapping(user.subscription_tier)
  const { periodStart, periodEnd } = calculatePeriodDates()

  // Check if user already has credits record
  const hasCredits = await userHasCredits(supabase, user.id)
  if (hasCredits) {
    return {
      userId: user.id,
      email: user.email,
      oldTier,
      newTier,
      creditsGranted,
      status: 'skipped',
      error: 'User already has credits record',
    }
  }

  if (dryRun) {
    return {
      userId: user.id,
      email: user.email,
      oldTier,
      newTier,
      creditsGranted,
      status: 'migrated',
    }
  }

  // Create user_credits record
  const userCreditsData: UserCredits = {
    user_id: user.id,
    tier_slug: newTier,
    credits_balance: creditsGranted,
    credits_used_this_period: 0,
    period_start: periodStart,
    period_end: periodEnd,
  }

  const { error: creditsError } = await supabase.from('user_credits').insert(userCreditsData)

  if (creditsError) {
    return {
      userId: user.id,
      email: user.email,
      oldTier,
      newTier,
      creditsGranted,
      status: 'failed',
      error: `Failed to create user_credits: ${creditsError.message}`,
    }
  }

  // Create initial credit_transaction record
  const transactionData: CreditTransaction = {
    user_id: user.id,
    amount: creditsGranted,
    transaction_type: 'migration',
    description: `Migration from ${oldTier} tier to ${newTier} tier`,
    metadata: {
      old_tier: oldTier,
      new_tier: newTier,
      migration_date: new Date().toISOString(),
    },
  }

  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert(transactionData)

  if (transactionError) {
    // Rollback user_credits if transaction fails
    await supabase.from('user_credits').delete().eq('user_id', user.id)

    return {
      userId: user.id,
      email: user.email,
      oldTier,
      newTier,
      creditsGranted,
      status: 'failed',
      error: `Failed to create credit_transaction: ${transactionError.message}`,
    }
  }

  return {
    userId: user.id,
    email: user.email,
    oldTier,
    newTier,
    creditsGranted,
    status: 'migrated',
  }
}

// Fetch users in batches
async function fetchUsersBatch(
  supabase: AnySupabaseClient,
  offset: number,
  limit: number
): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, subscription_tier, created_at')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return (data as User[]) || []
}

// Get total user count
async function getTotalUserCount(supabase: AnySupabaseClient): Promise<number> {
  const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true })

  if (error) {
    throw new Error(`Failed to count users: ${error.message}`)
  }

  return count || 0
}

// Main migration function
async function runMigration(): Promise<void> {
  const { dryRun, batchSize, continueOnError } = parseArgs()
  const { supabaseUrl, supabaseServiceKey } = validateEnvironment()

  console.log('='.repeat(60))
  console.log('Credits Migration Script')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`)
  console.log(`Batch Size: ${batchSize}`)
  console.log(`Continue on Error: ${continueOnError}`)
  console.log('='.repeat(60))

  const supabase = createSupabaseAdmin(supabaseUrl, supabaseServiceKey)

  // Get total user count
  const totalUsers = await getTotalUserCount(supabase)
  console.log(`\nTotal users to process: ${totalUsers}`)

  const summary: MigrationSummary = {
    total: totalUsers,
    migrated: 0,
    skipped: 0,
    failed: 0,
    results: [],
  }

  let offset = 0
  let processedCount = 0

  while (offset < totalUsers) {
    const users = await fetchUsersBatch(supabase, offset, batchSize)

    if (users.length === 0) {
      break
    }

    console.log(`\nProcessing batch ${Math.floor(offset / batchSize) + 1}...`)

    for (const user of users) {
      processedCount++

      try {
        const result = await migrateUser(supabase, user, dryRun)
        summary.results.push(result)

        switch (result.status) {
          case 'migrated':
            summary.migrated++
            console.log(
              `  [${processedCount}/${totalUsers}] Migrated: ${user.email} ` +
                `(${result.oldTier} -> ${result.newTier}, ${result.creditsGranted} credits)`
            )
            break
          case 'skipped':
            summary.skipped++
            console.log(
              `  [${processedCount}/${totalUsers}] Skipped: ${user.email} - ${result.error}`
            )
            break
          case 'failed':
            summary.failed++
            console.error(
              `  [${processedCount}/${totalUsers}] Failed: ${user.email} - ${result.error}`
            )
            break
        }
      } catch (error) {
        summary.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        summary.results.push({
          userId: user.id,
          email: user.email,
          oldTier: user.subscription_tier || 'free',
          newTier: 'unknown',
          creditsGranted: 0,
          status: 'failed',
          error: errorMessage,
        })

        console.error(`  [${processedCount}/${totalUsers}] Error: ${user.email} - ${errorMessage}`)

        if (!continueOnError) {
          console.error('\nMigration stopped due to error. Use --continue-on-error to continue.')
          break
        }
      }
    }

    if (!continueOnError && summary.failed > 0) {
      break
    }

    offset += batchSize
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Migration Summary')
  console.log('='.repeat(60))
  console.log(`Total Users:  ${summary.total}`)
  console.log(`Migrated:     ${summary.migrated}`)
  console.log(`Skipped:      ${summary.skipped}`)
  console.log(`Failed:       ${summary.failed}`)
  console.log('='.repeat(60))

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made to the database.')
    console.log('Run without --dry-run to apply changes.')
  }

  // Exit with error code if there were failures
  if (summary.failed > 0) {
    process.exit(1)
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error('Migration failed with unexpected error:', error)
  process.exit(1)
})
