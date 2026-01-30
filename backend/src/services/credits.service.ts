/**
 * Credits Service
 * Issue #197: Backend service for Epic 9 credit-based AI usage system
 *
 * Manages user credit balances, transactions, and tier-based allocations.
 * Uses database functions created in issue #196.
 */
import { supabaseAdmin } from '@/config/database.js'
import type { SubscriptionTier } from '@shared/types'

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: 'debit' | 'credit'
  description: string
  metadata?: Record<string, unknown>
  balanceAfter: number
  createdAt: Date
}

/**
 * Credit balance with period information
 */
export interface CreditBalance {
  balance: number
  periodStart: Date
  periodEnd: Date
}

/**
 * Tier-based monthly credit allocations
 */
export const TIER_CREDITS: Record<SubscriptionTier, number> = {
  free: 100,
  basic: 500,
  pro: 2000,
  enterprise: 10000,
}

export class InsufficientCreditsError extends Error {
  constructor(
    public required: number,
    public available: number
  ) {
    super(`Insufficient credits. Required: ${required}, Available: ${available}`)
    this.name = 'InsufficientCreditsError'
  }
}

export class UserNotFoundError extends Error {
  constructor(public userId: string) {
    super(`User not found: ${userId}`)
    this.name = 'UserNotFoundError'
  }
}

export class CreditOperationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreditOperationError'
  }
}

export class CreditsService {
  async getBalance(userId: string): Promise<CreditBalance> {
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .select('balance, last_refill_at, next_refill_at')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new UserNotFoundError(userId)
      }
      throw new CreditOperationError(`Failed to get credit balance: ${error.message}`)
    }

    if (!data) {
      throw new UserNotFoundError(userId)
    }

    // Calculate period dates based on refill schedule
    const periodStart = data.last_refill_at ? new Date(data.last_refill_at) : new Date()
    const periodEnd = data.next_refill_at ? new Date(data.next_refill_at) : new Date()

    return {
      balance: data.balance ?? 0,
      periodStart,
      periodEnd,
    }
  }

  async checkCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const { balance } = await this.getBalance(userId)
      return balance >= amount
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return false
      }
      throw error
    }
  }

  async deductCredits(userId: string, modelId: string, messageId?: string): Promise<number> {
    // Use the spend_credits function which handles credit deduction atomically
    const { data, error } = await supabaseAdmin.rpc('spend_credits', {
      p_user_id: userId,
      p_model_id: modelId,
      p_message_id: messageId ?? null,
    })

    if (error) {
      throw new CreditOperationError(`Failed to deduct credits: ${error.message}`)
    }

    // spend_credits returns a table with success, credits_spent, balance_after, error_message
    const result = Array.isArray(data) ? data[0] : data
    if (!result?.success) {
      if (result?.error_message?.includes('Insufficient credits')) {
        throw new InsufficientCreditsError(result?.credits_spent ?? 0, result?.balance_after ?? 0)
      }
      throw new CreditOperationError(result?.error_message ?? 'Failed to deduct credits')
    }

    return result.balance_after
  }

  async grantCredits(
    userId: string,
    amount: number,
    transactionType: 'tier_refill' | 'purchase' | 'bonus' | 'refund' | 'adjustment',
    description?: string,
    referenceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<number> {
    // Use the add_credits function which handles credit addition atomically
    const { data, error } = await supabaseAdmin.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: transactionType,
      p_description: description ?? null,
      p_reference_id: referenceId ?? null,
      p_metadata: (metadata ?? {}) as import('@/types/database.js').Json,
    })

    if (error) {
      throw new CreditOperationError(`Failed to grant credits: ${error.message}`)
    }

    // add_credits returns a table with success, credits_added, balance_after, error_message
    const result = Array.isArray(data) ? data[0] : data
    if (!result?.success) {
      throw new CreditOperationError(result?.error_message ?? 'Failed to grant credits')
    }

    return result.balance_after
  }

  async getTransactionHistory(userId: string, limit = 50): Promise<CreditTransaction[]> {
    const { data, error } = await supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new CreditOperationError(`Failed to get transaction history: ${error.message}`)
    }

    return (data ?? []).map((tx) => ({
      id: tx.id,
      userId: tx.user_id,
      amount: tx.amount,
      type: tx.amount < 0 ? 'debit' : 'credit',
      description: tx.description ?? '',
      metadata: tx.metadata as Record<string, unknown> | undefined,
      balanceAfter: tx.balance_after,
      createdAt: new Date(tx.created_at),
    }))
  }

  async initializeUserCredits(userId: string, tierSlug: string): Promise<void> {
    const tier = tierSlug as SubscriptionTier
    const credits = TIER_CREDITS[tier] ?? TIER_CREDITS.free

    // Insert directly into user_credits table
    const { error } = await supabaseAdmin.from('user_credits').upsert(
      {
        user_id: userId,
        balance: credits,
        lifetime_earned: credits,
        lifetime_spent: 0,
        last_refill_at: new Date().toISOString(),
        next_refill_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      throw new CreditOperationError(`Failed to initialize user credits: ${error.message}`)
    }
  }

  async resetMonthlyCredits(userId: string): Promise<void> {
    // Use the refill_tier_credits function for a single user
    const { data, error } = await supabaseAdmin.rpc('refill_tier_credits', {
      p_user_id: userId,
    })

    if (error) {
      throw new CreditOperationError(`Failed to reset monthly credits: ${error.message}`)
    }

    // Check if user was processed
    const result = Array.isArray(data) ? data[0] : data
    if (!result || result.users_processed === 0) {
      throw new CreditOperationError('User not eligible for credit refill')
    }
  }

  async getUsageStats(userId: string): Promise<{
    balance: number
    periodStart: Date
    periodEnd: Date
    allocated: number
    used: number
    usagePercentage: number
    daysRemaining: number
  }> {
    const { balance, periodStart, periodEnd } = await this.getBalance(userId)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const tier = (user?.subscription_tier as SubscriptionTier) ?? 'free'
    const allocated = TIER_CREDITS[tier]
    const used = allocated - balance
    const usagePercentage = allocated > 0 ? (used / allocated) * 100 : 0

    const now = new Date()
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      balance,
      periodStart,
      periodEnd,
      allocated,
      used,
      usagePercentage: Math.round(usagePercentage * 10) / 10,
      daysRemaining: Math.max(0, daysRemaining),
    }
  }
}

export const creditsService = new CreditsService()
