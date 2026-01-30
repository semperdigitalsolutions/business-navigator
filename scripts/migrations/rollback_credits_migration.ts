/**
 * Rollback Script: Undo Credits Migration
 * Issue #220: Migrate Existing Users to Credits System
 *
 * This script rolls back the credits migration by:
 * 1. Deleting credit_transactions with type='migration'
 * 2. Deleting user_credits records created during migration
 *
 * Usage:
 *   bun scripts/migrations/rollback_credits_migration.ts [options]
 *
 * Options:
 *   --dry-run         Preview changes without executing (default: false)
 *   --batch-size=N    Process records in batches of N (default: 100)
 *   --confirm         Required flag to actually run the rollback (safety measure)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// Types
interface RollbackSummary {
  transactionsDeleted: number
  creditsDeleted: number
  errors: string[]
}

// Parse command line arguments
function parseArgs(): {
  dryRun: boolean
  batchSize: number
  confirmed: boolean
} {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const confirmed = args.includes('--confirm')

  let batchSize = 100
  const batchArg = args.find((arg) => arg.startsWith('--batch-size='))
  if (batchArg) {
    const value = parseInt(batchArg.split('=')[1], 10)
    if (!isNaN(value) && value > 0) {
      batchSize = value
    }
  }

  return { dryRun, batchSize, confirmed }
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

// Get count of migration transactions
async function getMigrationTransactionCount(supabase: AnySupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', 'migration')

  if (error) {
    throw new Error(`Failed to count migration transactions: ${error.message}`)
  }

  return count || 0
}

// Get user IDs from migration transactions
async function getMigrationUserIds(
  supabase: AnySupabaseClient,
  offset: number,
  limit: number
): Promise<string[]> {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('user_id')
    .eq('transaction_type', 'migration')
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch migration user IDs: ${error.message}`)
  }

  return (data || []).map((row: { user_id: string }) => row.user_id)
}

// Delete migration transactions for a batch of users
async function deleteMigrationTransactions(
  supabase: AnySupabaseClient,
  userIds: string[],
  dryRun: boolean
): Promise<number> {
  if (dryRun) {
    return userIds.length
  }

  const { error } = await supabase
    .from('credit_transactions')
    .delete()
    .eq('transaction_type', 'migration')
    .in('user_id', userIds)

  if (error) {
    throw new Error(`Failed to delete migration transactions: ${error.message}`)
  }

  return userIds.length
}

// Delete user_credits for a batch of users
async function deleteUserCredits(
  supabase: AnySupabaseClient,
  userIds: string[],
  dryRun: boolean
): Promise<number> {
  if (dryRun) {
    return userIds.length
  }

  const { error } = await supabase.from('user_credits').delete().in('user_id', userIds)

  if (error) {
    throw new Error(`Failed to delete user_credits: ${error.message}`)
  }

  return userIds.length
}

// Main rollback function
async function runRollback(): Promise<void> {
  const { dryRun, batchSize, confirmed } = parseArgs()
  const { supabaseUrl, supabaseServiceKey } = validateEnvironment()

  console.log('='.repeat(60))
  console.log('Credits Migration Rollback Script')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`)
  console.log(`Batch Size: ${batchSize}`)
  console.log('='.repeat(60))

  // Safety check
  if (!dryRun && !confirmed) {
    console.error('\nError: This is a destructive operation.')
    console.error('To proceed, run with --confirm flag:')
    console.error('  bun scripts/migrations/rollback_credits_migration.ts --confirm')
    console.error('\nOr preview changes first with:')
    console.error('  bun scripts/migrations/rollback_credits_migration.ts --dry-run')
    process.exit(1)
  }

  const supabase = createSupabaseAdmin(supabaseUrl, supabaseServiceKey)

  const summary: RollbackSummary = {
    transactionsDeleted: 0,
    creditsDeleted: 0,
    errors: [],
  }

  // Get total count of migration transactions
  const totalTransactions = await getMigrationTransactionCount(supabase)
  console.log(`\nFound ${totalTransactions} migration transactions to rollback`)

  if (totalTransactions === 0) {
    console.log('No migration transactions found. Nothing to rollback.')
    return
  }

  // Collect all user IDs first
  console.log('\nCollecting user IDs from migration transactions...')
  const allUserIds: string[] = []
  let offset = 0

  while (offset < totalTransactions) {
    const userIds = await getMigrationUserIds(supabase, offset, batchSize)
    if (userIds.length === 0) break
    allUserIds.push(...userIds)
    offset += batchSize
  }

  // Remove duplicates
  const uniqueUserIds = Array.from(new Set(allUserIds))
  console.log(`Found ${uniqueUserIds.length} unique users to process`)

  // Process in batches
  const totalBatches = Math.ceil(uniqueUserIds.length / batchSize)

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const start = batchNum * batchSize
    const end = Math.min(start + batchSize, uniqueUserIds.length)
    const batchUserIds = uniqueUserIds.slice(start, end)

    console.log(
      `\nProcessing batch ${batchNum + 1}/${totalBatches} (${batchUserIds.length} users)...`
    )

    try {
      // Delete migration transactions first
      const transactionsDeleted = await deleteMigrationTransactions(supabase, batchUserIds, dryRun)
      summary.transactionsDeleted += transactionsDeleted
      console.log(`  Deleted ${transactionsDeleted} migration transactions`)

      // Delete user_credits records
      const creditsDeleted = await deleteUserCredits(supabase, batchUserIds, dryRun)
      summary.creditsDeleted += creditsDeleted
      console.log(`  Deleted ${creditsDeleted} user_credits records`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      summary.errors.push(`Batch ${batchNum + 1}: ${errorMessage}`)
      console.error(`  Error in batch ${batchNum + 1}: ${errorMessage}`)
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Rollback Summary')
  console.log('='.repeat(60))
  console.log(`Migration Transactions Deleted: ${summary.transactionsDeleted}`)
  console.log(`User Credits Deleted:           ${summary.creditsDeleted}`)
  console.log(`Errors:                         ${summary.errors.length}`)
  console.log('='.repeat(60))

  if (summary.errors.length > 0) {
    console.log('\nErrors encountered:')
    summary.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`)
    })
  }

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made to the database.')
    console.log('Run with --confirm to apply changes.')
  }

  // Exit with error code if there were errors
  if (summary.errors.length > 0) {
    process.exit(1)
  }
}

// Run the rollback
runRollback().catch((error) => {
  console.error('Rollback failed with unexpected error:', error)
  process.exit(1)
})
