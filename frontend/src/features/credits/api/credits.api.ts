/**
 * Credits API - Credit balance and usage communication
 */
import { apiClient } from '@/lib/api/client'

/**
 * Credit balance information
 */
export interface CreditBalance {
  balance: number
  totalCredits: number
  usedCredits: number
  periodStart: string
  periodEnd: string
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
}

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string
  amount: number
  type: 'usage' | 'purchase' | 'refund' | 'bonus'
  description: string
  model?: string
  createdAt: string
}

export interface CreditBalanceResponse {
  success: boolean
  data?: CreditBalance
  error?: string
}

export interface CreditTransactionsResponse {
  success: boolean
  data?: {
    transactions: CreditTransaction[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
  error?: string
}

export const creditsApi = {
  /**
   * Get current credit balance for the authenticated user
   */
  getBalance: async (): Promise<CreditBalanceResponse> => {
    try {
      const response = await apiClient.get('/api/credits/balance')
      return response
    } catch {
      // Return a default response if endpoint doesn't exist yet
      return { success: false }
    }
  },

  /**
   * Get credit transaction history
   */
  getTransactions: async (page = 1, limit = 20): Promise<CreditTransactionsResponse> => {
    try {
      const response = await apiClient.get(`/api/credits/transactions?page=${page}&limit=${limit}`)
      return response
    } catch {
      return { success: false }
    }
  },
}
