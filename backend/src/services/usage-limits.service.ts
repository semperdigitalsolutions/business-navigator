/**
 * Usage Limits Service
 * Issue #97: Daily message counter
 * Issue #98: Tier-based usage limits
 */
import { supabase } from '@/config/database.js'
import type { SubscriptionTier } from '@/types/supabase-helpers.js'

/**
 * Tier-based daily message limits
 * Free: 10 messages/day
 * Basic: 50 messages/day
 * Pro: 200 messages/day
 * Enterprise: unlimited (-1)
 */
export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  basic: 50,
  pro: 200,
  enterprise: -1, // Unlimited
}

export interface UsageLimitResult {
  allowed: boolean
  currentCount: number
  limit: number
  remaining: number
  tier: SubscriptionTier
}

export interface UsageLimitError {
  code: 'USAGE_LIMIT_EXCEEDED'
  message: string
  currentCount: number
  limit: number
  tier: SubscriptionTier
  resetTime: string
}

export class UsageLimitsService {
  /**
   * Get the user's subscription tier
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (error || !data) {
      // Default to free tier if user not found or error
      return 'free'
    }

    return (data.subscription_tier as SubscriptionTier) || 'free'
  }

  /**
   * Get the current day's message count for a user
   */
  async getDailyMessageCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_user_message_count', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error getting message count:', error)
      return 0
    }

    return data ?? 0
  }

  /**
   * Increment the user's daily message count
   * Returns the new count after incrementing
   */
  async incrementMessageCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('increment_user_message_count', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error incrementing message count:', error)
      throw new Error(`Failed to increment message count: ${error.message}`)
    }

    return data ?? 1
  }

  /**
   * Check if a user can send a message based on their tier limits
   * Does NOT increment the counter - use incrementMessageCount after successful message
   */
  async checkUsageLimit(userId: string): Promise<UsageLimitResult> {
    const [tier, currentCount] = await Promise.all([
      this.getUserTier(userId),
      this.getDailyMessageCount(userId),
    ])

    const limit = TIER_LIMITS[tier]

    // Enterprise tier has unlimited messages
    if (limit === -1) {
      return {
        allowed: true,
        currentCount,
        limit: -1,
        remaining: -1, // Unlimited
        tier,
      }
    }

    const allowed = currentCount < limit
    const remaining = Math.max(0, limit - currentCount)

    return {
      allowed,
      currentCount,
      limit,
      remaining,
      tier,
    }
  }

  /**
   * Create a usage limit error response
   */
  createLimitExceededError(result: UsageLimitResult): UsageLimitError {
    // Calculate reset time (midnight UTC of next day)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)

    return {
      code: 'USAGE_LIMIT_EXCEEDED',
      message:
        `Daily message limit reached. You have used ${result.currentCount}/${result.limit} messages today. ` +
        `Upgrade to a higher tier for more messages, or wait until ${tomorrow.toISOString()}.`,
      currentCount: result.currentCount,
      limit: result.limit,
      tier: result.tier,
      resetTime: tomorrow.toISOString(),
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUsageStats(userId: string): Promise<{
    tier: SubscriptionTier
    dailyLimit: number
    usedToday: number
    remaining: number
    resetTime: string
  }> {
    const [tier, usedToday] = await Promise.all([
      this.getUserTier(userId),
      this.getDailyMessageCount(userId),
    ])

    const dailyLimit = TIER_LIMITS[tier]

    // Calculate reset time (midnight UTC of next day)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)

    return {
      tier,
      dailyLimit,
      usedToday,
      remaining: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - usedToday),
      resetTime: tomorrow.toISOString(),
    }
  }
}

export const usageLimitsService = new UsageLimitsService()
