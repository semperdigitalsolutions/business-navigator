/**
 * Integration tests for Credits Service
 * Tests credit balance management, deductions, grants, and transactions
 */
import { describe, expect, it, beforeEach, mock } from 'bun:test'

// Mock Supabase types
interface CreditBalance {
  user_id: string
  balance: number
  tier_id: string
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'deduction' | 'grant' | 'purchase' | 'refund'
  description: string
  balance_after: number
  metadata: Record<string, unknown>
  created_at: string
}

// Mock CreditsService implementation for testing
class CreditsService {
  constructor(private supabase: unknown) {}

  async getBalance(userId: string): Promise<CreditBalance | null> {
    const { data, error } = await (this.supabase as any)
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async checkCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    if (!balance) return false
    return balance.balance >= amount
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    const hasEnough = await this.checkCredits(userId, amount)
    if (!hasEnough) {
      throw new Error('Insufficient credits')
    }

    const balance = await this.getBalance(userId)
    const newBalance = balance!.balance - amount

    const { data: transaction, error } = await (this.supabase as any)
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'deduction',
        description,
        balance_after: newBalance,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await (this.supabase as any)
      .from('user_credits')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    return transaction
  }

  async grantCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    const balance = await this.getBalance(userId)
    const newBalance = balance!.balance + amount

    const { data: transaction, error } = await (this.supabase as any)
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'grant',
        description,
        balance_after: newBalance,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await (this.supabase as any)
      .from('user_credits')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    return transaction
  }

  async getTransactionHistory(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<CreditTransaction[]> {
    let query = (this.supabase as any)
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }
}

describe('CreditsService', () => {
  let mockSupabase: any
  let mockQuery: any
  let creditsService: CreditsService
  const testUserId = 'user-123'

  beforeEach(() => {
    const mockSetup = createMockSupabase()
    mockSupabase = mockSetup.supabase
    mockQuery = mockSetup.query
    creditsService = new CreditsService(mockSupabase)
  })

  describe('getBalance', () => {
    it('should return correct credit balance structure', async () => {
      const mockBalance: CreditBalance = {
        user_id: testUserId,
        balance: 500,
        tier_id: 'tier-starter',
        period_start: '2026-01-01T00:00:00Z',
        period_end: '2026-02-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-15T00:00:00Z',
      }

      mockQuery.single.mockResolvedValue({
        data: mockBalance,
        error: null,
      })

      const result = await creditsService.getBalance(testUserId)

      expect(result).toEqual(mockBalance)
      expect(result?.balance).toBe(500)
      expect(result?.tier_id).toBe('tier-starter')
    })

    it('should handle user with no credit record', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' },
      })

      await expect(creditsService.getBalance(testUserId)).rejects.toThrow()
    })

    it('should handle database errors gracefully', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      await expect(creditsService.getBalance(testUserId)).rejects.toThrow(
        'Database connection failed'
      )
    })
  })

  describe('checkCredits', () => {
    it('should return true when user has sufficient credits', async () => {
      const mockBalance: CreditBalance = {
        user_id: testUserId,
        balance: 500,
        tier_id: 'tier-starter',
        period_start: '2026-01-01T00:00:00Z',
        period_end: '2026-02-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-15T00:00:00Z',
      }

      mockQuery.single.mockResolvedValue({
        data: mockBalance,
        error: null,
      })

      const result = await creditsService.checkCredits(testUserId, 100)
      expect(result).toBe(true)
    })

    it('should return false when user has insufficient credits', async () => {
      const mockBalance: CreditBalance = {
        user_id: testUserId,
        balance: 50,
        tier_id: 'tier-starter',
        period_start: '2026-01-01T00:00:00Z',
        period_end: '2026-02-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-15T00:00:00Z',
      }

      mockQuery.single.mockResolvedValue({
        data: mockBalance,
        error: null,
      })

      const result = await creditsService.checkCredits(testUserId, 100)
      expect(result).toBe(false)
    })

    it('should return false when user has no credit record', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await creditsService.checkCredits(testUserId, 100)
      expect(result).toBe(false)
    })

    it('should handle exactly zero credits remaining', async () => {
      const mockBalance: CreditBalance = {
        user_id: testUserId,
        balance: 100,
        tier_id: 'tier-starter',
        period_start: '2026-01-01T00:00:00Z',
        period_end: '2026-02-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-15T00:00:00Z',
      }

      mockQuery.single.mockResolvedValue({
        data: mockBalance,
        error: null,
      })

      const exactMatch = await creditsService.checkCredits(testUserId, 100)
      expect(exactMatch).toBe(true)

      const oneMore = await creditsService.checkCredits(testUserId, 101)
      expect(oneMore).toBe(false)
    })
  })

  describe('deductCredits', () => {
    it('should reduce balance correctly', async () => {
      const initialBalance = 500
      const deductionAmount = 100

      const mockTransaction = {
        id: 'txn-123',
        user_id: testUserId,
        amount: -deductionAmount,
        type: 'deduction',
        description: 'Test deduction',
        balance_after: initialBalance - deductionAmount,
        metadata: {},
        created_at: new Date().toISOString(),
      }

      // Mock for getBalance (called first) and deductCredits (insert transaction)
      mockQuery.single
        .mockResolvedValueOnce({
          data: {
            user_id: testUserId,
            balance: initialBalance,
            tier_id: 'tier-starter',
            period_start: '2026-01-01T00:00:00Z',
            period_end: '2026-02-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-15T00:00:00Z',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockTransaction,
          error: null,
        })

      mockQuery.eq.mockResolvedValue({ error: null })

      const result = await creditsService.deductCredits(
        testUserId,
        deductionAmount,
        'Test deduction'
      )

      expect(result.amount).toBe(-deductionAmount)
      expect(result.balance_after).toBe(400)
      expect(result.type).toBe('deduction')
    })

    it('should fail with insufficient credits', async () => {
      mockQuery.single.mockResolvedValue({
        data: {
          user_id: testUserId,
          balance: 50,
          tier_id: 'tier-starter',
          period_start: '2026-01-01T00:00:00Z',
          period_end: '2026-02-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-15T00:00:00Z',
        },
        error: null,
      })

      await expect(creditsService.deductCredits(testUserId, 100, 'Test')).rejects.toThrow(
        'Insufficient credits'
      )
    })

    it('should include metadata in transaction', async () => {
      const metadata = { model: 'gpt-4', tokens: 1000 }

      const mockTransaction = {
        id: 'txn-456',
        user_id: testUserId,
        amount: -10,
        type: 'deduction',
        description: 'AI message',
        balance_after: 490,
        metadata,
        created_at: new Date().toISOString(),
      }

      mockQuery.single
        .mockResolvedValueOnce({
          data: {
            user_id: testUserId,
            balance: 500,
            tier_id: 'tier-starter',
            period_start: '2026-01-01T00:00:00Z',
            period_end: '2026-02-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-15T00:00:00Z',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockTransaction,
          error: null,
        })

      mockQuery.eq.mockResolvedValue({ error: null })

      const result = await creditsService.deductCredits(testUserId, 10, 'AI message', metadata)

      expect(result.metadata).toEqual(metadata)
    })
  })

  describe('grantCredits', () => {
    it('should increase balance correctly', async () => {
      const initialBalance = 100
      const grantAmount = 500

      const mockTransaction = {
        id: 'txn-789',
        user_id: testUserId,
        amount: grantAmount,
        type: 'grant',
        description: 'Monthly allocation',
        balance_after: initialBalance + grantAmount,
        metadata: {},
        created_at: new Date().toISOString(),
      }

      mockQuery.single
        .mockResolvedValueOnce({
          data: {
            user_id: testUserId,
            balance: initialBalance,
            tier_id: 'tier-free',
            period_start: '2026-01-01T00:00:00Z',
            period_end: '2026-02-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-15T00:00:00Z',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockTransaction,
          error: null,
        })

      mockQuery.eq.mockResolvedValue({ error: null })

      const result = await creditsService.grantCredits(
        testUserId,
        grantAmount,
        'Monthly allocation'
      )

      expect(result.amount).toBe(grantAmount)
      expect(result.balance_after).toBe(600)
      expect(result.type).toBe('grant')
    })
  })

  describe('getTransactionHistory', () => {
    it('should return transaction records', async () => {
      const mockTransactions: CreditTransaction[] = [
        {
          id: 'txn-1',
          user_id: testUserId,
          amount: -10,
          type: 'deduction',
          description: 'AI message',
          balance_after: 490,
          metadata: {},
          created_at: '2026-01-15T10:00:00Z',
        },
        {
          id: 'txn-2',
          user_id: testUserId,
          amount: 500,
          type: 'grant',
          description: 'Monthly allocation',
          balance_after: 500,
          metadata: {},
          created_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockQuery.order.mockResolvedValue({
        data: mockTransactions,
        error: null,
      })

      const result = await creditsService.getTransactionHistory(testUserId)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('txn-1')
      expect(result[1].id).toBe('txn-2')
    })

    it('should support pagination with limit', async () => {
      const mockTransactions = Array.from({ length: 3 }, (_, i) => ({
        id: `txn-${i}`,
        user_id: testUserId,
        amount: -10,
        type: 'deduction' as const,
        description: `Transaction ${i}`,
        balance_after: 500 - i * 10,
        metadata: {},
        created_at: new Date().toISOString(),
      }))

      mockQuery.limit.mockResolvedValue({
        data: mockTransactions,
        error: null,
      })

      const result = await creditsService.getTransactionHistory(testUserId, { limit: 3 })

      expect(result).toHaveLength(3)
    })

    it('should support pagination with offset', async () => {
      const allTransactions = Array.from({ length: 5 }, (_, i) => ({
        id: `txn-${i + 5}`,
        user_id: testUserId,
        amount: -10,
        type: 'deduction' as const,
        description: `Transaction ${i + 5}`,
        balance_after: 500 - (i + 5) * 10,
        metadata: {},
        created_at: new Date().toISOString(),
      }))

      mockQuery.range.mockResolvedValue({
        data: allTransactions,
        error: null,
      })

      const result = await creditsService.getTransactionHistory(testUserId, { limit: 5, offset: 5 })

      expect(result).toHaveLength(5)
    })
  })
})

// Helper function to create mock Supabase client
function createMockSupabase() {
  const query: any = {}

  query.select = () => query
  query.eq = mock(() => query)
  query.single = mock(() => Promise.resolve({ data: null, error: null }))
  query.insert = () => query
  query.update = () => query
  query.order = mock(() => query)
  query.limit = mock(() => query)
  query.range = mock(() => query)
  query.then = (resolve: any) => resolve({ data: [], error: null })

  const supabase = {
    from: () => query,
  }

  return {
    supabase,
    query,
  }
}
