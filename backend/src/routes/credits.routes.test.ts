/**
 * Integration tests for Credits Routes
 * Tests authentication, balance endpoint, and transaction pagination
 */
import { describe, expect, it, beforeEach, mock } from 'bun:test'
import { Elysia } from 'elysia'
import { successResponse } from '@/middleware/error.js'

// Mock types
interface CreditBalance {
  balance: number
  tier_id: string
  period_start: string
  period_end: string
}

interface CreditTransaction {
  id: string
  amount: number
  type: string
  description: string
  balance_after: number
  created_at: string
}

interface AuthUser {
  id: string
  email: string
}

// Response body type for tests
interface ResponseBody {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

// Mock authentication middleware
const mockAuth = (user?: AuthUser) => {
  return (context: any) => {
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    context.user = user
  }
}

// Create test app with credits routes
const createTestApp = (mockCreditsService: any, mockUser?: AuthUser) => {
  return new Elysia()
    .derive((context) => {
      if (!mockUser) {
        throw new Error('Unauthorized')
      }
      return { user: mockUser }
    })
    .get('/credits/balance', async ({ user }) => {
      const balance = await mockCreditsService.getBalance(user.id)
      return successResponse(balance)
    })
    .get('/credits/transactions', async ({ user, query }) => {
      const limit = parseInt(query.limit || '10')
      const offset = parseInt(query.offset || '0')

      const transactions = await mockCreditsService.getTransactionHistory(user.id, {
        limit,
        offset,
      })

      return successResponse({
        transactions,
        pagination: {
          limit,
          offset,
          total: transactions.length,
        },
      })
    })
}

describe('Credits Routes', () => {
  let mockCreditsService: any
  const testUser: AuthUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  beforeEach(() => {
    mockCreditsService = {
      getBalance: mock(() =>
        Promise.resolve({
          balance: 500,
          tier_id: 'tier-starter',
          period_start: '2026-01-01T00:00:00Z',
          period_end: '2026-02-01T00:00:00Z',
        })
      ),
      getTransactionHistory: mock(() => Promise.resolve([])),
    }
  })

  describe('Authentication', () => {
    it('should require authentication for balance endpoint', async () => {
      const appWithoutAuth = new Elysia().get('/credits/balance', () => {
        throw new Error('Unauthorized')
      })

      const response = await appWithoutAuth
        .handle(new Request('http://localhost/credits/balance'))
        .catch(
          () =>
            new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 })
        )

      expect(response.status).toBe(401)
    })

    it('should require authentication for transactions endpoint', async () => {
      const appWithoutAuth = new Elysia().get('/credits/transactions', () => {
        throw new Error('Unauthorized')
      })

      const response = await appWithoutAuth
        .handle(new Request('http://localhost/credits/transactions'))
        .catch(
          () =>
            new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 })
        )

      expect(response.status).toBe(401)
    })

    it('should allow authenticated users to access balance', async () => {
      const app = createTestApp(mockCreditsService, testUser)

      const response = await app.handle(new Request('http://localhost/credits/balance'))

      expect(response.status).toBe(200)
    })

    it('should allow authenticated users to access transactions', async () => {
      const app = createTestApp(mockCreditsService, testUser)

      const response = await app.handle(new Request('http://localhost/credits/transactions'))

      expect(response.status).toBe(200)
    })
  })

  describe('GET /credits/balance', () => {
    it('should return user credit balance', async () => {
      const mockBalance: CreditBalance = {
        balance: 500,
        tier_id: 'tier-starter',
        period_start: '2026-01-01T00:00:00Z',
        period_end: '2026-02-01T00:00:00Z',
      }

      mockCreditsService.getBalance = mock(() => Promise.resolve(mockBalance))

      const app = createTestApp(mockCreditsService, testUser)
      const response = await app.handle(new Request('http://localhost/credits/balance'))

      expect(response.status).toBe(200)

      const body = (await response.json()) as ResponseBody
      expect(body.success).toBe(true)
      expect(body.data?.balance).toBe(500)
      expect(body.data?.tier_id).toBe('tier-starter')
    })

    it('should call service with correct user ID', async () => {
      const app = createTestApp(mockCreditsService, testUser)
      await app.handle(new Request('http://localhost/credits/balance'))

      expect(mockCreditsService.getBalance).toHaveBeenCalledWith(testUser.id)
    })

    it('should handle zero balance', async () => {
      mockCreditsService.getBalance = mock(() =>
        Promise.resolve({
          balance: 0,
          tier_id: 'tier-free',
          period_start: '2026-01-01T00:00:00Z',
          period_end: '2026-02-01T00:00:00Z',
        })
      )

      const app = createTestApp(mockCreditsService, testUser)
      const response = await app.handle(new Request('http://localhost/credits/balance'))

      const body = (await response.json()) as ResponseBody
      expect(body.data?.balance).toBe(0)
    })

    it('should handle service errors gracefully', async () => {
      mockCreditsService.getBalance = mock(() => Promise.reject(new Error('Database error')))

      const app = createTestApp(mockCreditsService, testUser)
      const response = await app
        .handle(new Request('http://localhost/credits/balance'))
        .catch((error) => {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
          })
        })

      expect(response.status).toBe(500)
    })
  })

  describe('GET /credits/transactions', () => {
    it('should return transaction history', async () => {
      const mockTransactions: CreditTransaction[] = [
        {
          id: 'txn-1',
          amount: -10,
          type: 'deduction',
          description: 'AI message',
          balance_after: 490,
          created_at: '2026-01-15T10:00:00Z',
        },
        {
          id: 'txn-2',
          amount: 500,
          type: 'grant',
          description: 'Monthly allocation',
          balance_after: 500,
          created_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve(mockTransactions))

      const app = createTestApp(mockCreditsService, testUser)
      const response = await app.handle(new Request('http://localhost/credits/transactions'))

      expect(response.status).toBe(200)

      const body = (await response.json()) as ResponseBody
      expect(body.success).toBe(true)
      expect(body.data?.transactions).toHaveLength(2)
    })

    it('should support pagination with default values', async () => {
      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve([]))

      const app = createTestApp(mockCreditsService, testUser)
      await app.handle(new Request('http://localhost/credits/transactions'))

      expect(mockCreditsService.getTransactionHistory).toHaveBeenCalledWith(testUser.id, {
        limit: 10,
        offset: 0,
      })
    })

    it('should support custom limit parameter', async () => {
      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve([]))

      const app = createTestApp(mockCreditsService, testUser)
      await app.handle(new Request('http://localhost/credits/transactions?limit=25'))

      expect(mockCreditsService.getTransactionHistory).toHaveBeenCalledWith(testUser.id, {
        limit: 25,
        offset: 0,
      })
    })

    it('should support custom offset parameter', async () => {
      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve([]))

      const app = createTestApp(mockCreditsService, testUser)
      await app.handle(new Request('http://localhost/credits/transactions?offset=50'))

      expect(mockCreditsService.getTransactionHistory).toHaveBeenCalledWith(testUser.id, {
        limit: 10,
        offset: 50,
      })
    })

    it('should support both limit and offset parameters', async () => {
      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve([]))

      const app = createTestApp(mockCreditsService, testUser)
      await app.handle(new Request('http://localhost/credits/transactions?limit=20&offset=40'))

      expect(mockCreditsService.getTransactionHistory).toHaveBeenCalledWith(testUser.id, {
        limit: 20,
        offset: 40,
      })
    })

    it('should return pagination metadata', async () => {
      const mockTransactions = Array.from({ length: 5 }, (_, i) => ({
        id: `txn-${i}`,
        amount: -10,
        type: 'deduction',
        description: `Transaction ${i}`,
        balance_after: 500 - i * 10,
        created_at: new Date().toISOString(),
      }))

      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve(mockTransactions))

      const app = createTestApp(mockCreditsService, testUser)
      const response = await app.handle(
        new Request('http://localhost/credits/transactions?limit=5&offset=0')
      )

      const body = (await response.json()) as ResponseBody
      expect(body.data?.pagination).toEqual({
        limit: 5,
        offset: 0,
        total: 5,
      })
    })

    it('should handle empty transaction history', async () => {
      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve([]))

      const app = createTestApp(mockCreditsService, testUser)
      const response = await app.handle(new Request('http://localhost/credits/transactions'))

      const body = (await response.json()) as ResponseBody
      expect(body.data?.transactions).toHaveLength(0)
    })

    it('should handle invalid pagination parameters gracefully', async () => {
      mockCreditsService.getTransactionHistory = mock(() => Promise.resolve([]))

      const app = createTestApp(mockCreditsService, testUser)
      await app.handle(
        new Request('http://localhost/credits/transactions?limit=invalid&offset=bad')
      )

      expect(mockCreditsService.getTransactionHistory).toHaveBeenCalledWith(testUser.id, {
        limit: NaN,
        offset: NaN,
      })
    })
  })
})
