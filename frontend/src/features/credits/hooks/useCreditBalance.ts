/**
 * useCreditBalance Hook - Manage credit balance state and fetching
 * Issue #212: Credit balance display for Epic 9
 */
import { useCallback, useEffect, useState } from 'react'
import { type CreditBalance, creditsApi } from '../api/credits.api'

/** Threshold percentages for visual states */
const LOW_THRESHOLD = 0.2 // 20%
const CRITICAL_THRESHOLD = 0.05 // 5%

export interface UseCreditBalanceResult {
  /** Current credit balance */
  balance: number
  /** Total credits for the period */
  totalCredits: number
  /** Credits used this period */
  usedCredits: number
  /** Percentage of credits remaining (0-100) */
  percentRemaining: number
  /** Period end date */
  periodEnd: string | null
  /** Period start date */
  periodStart: string | null
  /** User's current tier */
  tier: CreditBalance['tier'] | null
  /** Whether credits are low (< 20%) */
  isLow: boolean
  /** Whether credits are critical (< 5%) */
  isCritical: boolean
  /** Whether data is loading */
  isLoading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Refresh the credit balance */
  refresh: () => Promise<void>
}

/**
 * Format time until period end in human-readable format
 */
export function formatTimeUntilReset(periodEnd: string | null): string | null {
  if (!periodEnd) return null

  const now = new Date()
  const end = new Date(periodEnd)
  const diffMs = end.getTime() - now.getTime()

  if (diffMs <= 0) return null

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${minutes}m`
}

/**
 * Hook to fetch and manage credit balance state
 * Auto-refreshes after messages are sent
 */
export function useCreditBalance(): UseCreditBalanceResult {
  const [balance, setBalance] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)
  const [usedCredits, setUsedCredits] = useState(0)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [periodStart, setPeriodStart] = useState<string | null>(null)
  const [tier, setTier] = useState<CreditBalance['tier'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await creditsApi.getBalance()

      if (response.success && response.data) {
        setBalance(response.data.balance)
        setTotalCredits(response.data.totalCredits)
        setUsedCredits(response.data.usedCredits)
        setPeriodEnd(response.data.periodEnd)
        setPeriodStart(response.data.periodStart)
        setTier(response.data.tier)
      } else {
        // Use default values if API not available yet
        setBalance(100)
        setTotalCredits(100)
        setUsedCredits(0)
        setPeriodEnd(null)
        setPeriodStart(null)
        setTier('free')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // Calculate derived values
  const percentRemaining = totalCredits > 0 ? (balance / totalCredits) * 100 : 0
  const isLow =
    percentRemaining <= LOW_THRESHOLD * 100 && percentRemaining > CRITICAL_THRESHOLD * 100
  const isCritical = percentRemaining <= CRITICAL_THRESHOLD * 100

  return {
    balance,
    totalCredits,
    usedCredits,
    percentRemaining,
    periodEnd,
    periodStart,
    tier,
    isLow,
    isCritical,
    isLoading,
    error,
    refresh: fetchBalance,
  }
}
