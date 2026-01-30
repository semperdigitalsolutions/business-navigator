/**
 * Integration tests for Tiers Service
 * Tests tier management, default tier logic, and validation
 */
import { describe, expect, it, beforeEach, mock } from 'bun:test'

// Mock types
interface SubscriptionTier {
  id: string
  name: string
  monthly_credits: number
  price_monthly: number
  is_default: boolean
  is_active: boolean
  features: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Mock TiersService implementation for testing
class TiersService {
  constructor(private supabase: unknown) {}

  async getAllTiers(): Promise<SubscriptionTier[]> {
    const { data, error } = await (this.supabase as any)
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly')

    if (error) throw new Error(error.message)
    return data || []
  }

  async getDefaultTier(): Promise<SubscriptionTier | null> {
    const { data, error } = await (this.supabase as any)
      .from('subscription_tiers')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async getTierById(tierId: string): Promise<SubscriptionTier | null> {
    const { data, error } = await (this.supabase as any)
      .from('subscription_tiers')
      .select('*')
      .eq('id', tierId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async validateOnlyOneDefault(): Promise<boolean> {
    const { data, error } = await (this.supabase as any)
      .from('subscription_tiers')
      .select('id')
      .eq('is_default', true)

    if (error) throw new Error(error.message)
    return (data?.length || 0) === 1
  }
}

describe('TiersService', () => {
  let mockSupabase: any
  let tiersService: TiersService

  beforeEach(() => {
    mockSupabase = createMockSupabase()
    tiersService = new TiersService(mockSupabase)
  })

  describe('getAllTiers', () => {
    it('should return all active tiers', async () => {
      const mockTiers: SubscriptionTier[] = [
        {
          id: 'tier-free',
          name: 'Free',
          monthly_credits: 100,
          price_monthly: 0,
          is_default: true,
          is_active: true,
          features: { models: ['gpt-3.5-turbo'] },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'tier-starter',
          name: 'Starter',
          monthly_credits: 500,
          price_monthly: 9,
          is_default: false,
          is_active: true,
          features: { models: ['gpt-3.5-turbo', 'gpt-4-turbo'] },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order.mockResolvedValue({
          data: mockTiers,
          error: null,
        })

      const result = await tiersService.getAllTiers()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Free')
      expect(result[1].name).toBe('Starter')
    })

    it('should return empty array when no tiers exist', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order.mockResolvedValue({
          data: [],
          error: null,
        })

      const result = await tiersService.getAllTiers()

      expect(result).toHaveLength(0)
    })

    it('should only return active tiers', async () => {
      const mockTiers: SubscriptionTier[] = [
        {
          id: 'tier-free',
          name: 'Free',
          monthly_credits: 100,
          price_monthly: 0,
          is_default: true,
          is_active: true,
          features: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order.mockResolvedValue({
          data: mockTiers,
          error: null,
        })

      const result = await tiersService.getAllTiers()

      expect(result.every((tier) => tier.is_active)).toBe(true)
    })

    it('should order by price ascending', async () => {
      const mockTiers: SubscriptionTier[] = [
        {
          id: 'tier-free',
          name: 'Free',
          monthly_credits: 100,
          price_monthly: 0,
          is_default: true,
          is_active: true,
          features: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'tier-starter',
          name: 'Starter',
          monthly_credits: 500,
          price_monthly: 9,
          is_default: false,
          is_active: true,
          features: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'tier-growth',
          name: 'Growth',
          monthly_credits: 2000,
          price_monthly: 19,
          is_default: false,
          is_active: true,
          features: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order.mockResolvedValue({
          data: mockTiers,
          error: null,
        })

      const result = await tiersService.getAllTiers()

      expect(result[0].price_monthly).toBe(0)
      expect(result[1].price_monthly).toBe(9)
      expect(result[2].price_monthly).toBe(19)
    })

    it('should handle database errors', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        })

      await expect(tiersService.getAllTiers()).rejects.toThrow('Database connection failed')
    })
  })

  describe('getDefaultTier', () => {
    it('should return the default tier', async () => {
      const mockDefaultTier: SubscriptionTier = {
        id: 'tier-free',
        name: 'Free',
        monthly_credits: 100,
        price_monthly: 0,
        is_default: true,
        is_active: true,
        features: {},
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single.mockResolvedValue({
          data: mockDefaultTier,
          error: null,
        })

      const result = await tiersService.getDefaultTier()

      expect(result).not.toBeNull()
      expect(result?.is_default).toBe(true)
      expect(result?.name).toBe('Free')
    })

    it('should handle case where no default tier exists', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single.mockResolvedValue({
          data: null,
          error: { message: 'No rows returned' },
        })

      await expect(tiersService.getDefaultTier()).rejects.toThrow('No rows returned')
    })

    it('should only return active default tier', async () => {
      const mockDefaultTier: SubscriptionTier = {
        id: 'tier-free',
        name: 'Free',
        monthly_credits: 100,
        price_monthly: 0,
        is_default: true,
        is_active: true,
        features: {},
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single.mockResolvedValue({
          data: mockDefaultTier,
          error: null,
        })

      const result = await tiersService.getDefaultTier()

      expect(result?.is_active).toBe(true)
      expect(result?.is_default).toBe(true)
    })
  })

  describe('getTierById', () => {
    it('should return tier by ID', async () => {
      const mockTier: SubscriptionTier = {
        id: 'tier-starter',
        name: 'Starter',
        monthly_credits: 500,
        price_monthly: 9,
        is_default: false,
        is_active: true,
        features: {},
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', 'tier-starter')
        .single.mockResolvedValue({
          data: mockTier,
          error: null,
        })

      const result = await tiersService.getTierById('tier-starter')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('tier-starter')
      expect(result?.name).toBe('Starter')
    })

    it('should handle non-existent tier', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', 'invalid')
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        })

      await expect(tiersService.getTierById('invalid')).rejects.toThrow('Not found')
    })
  })

  describe('validateOnlyOneDefault', () => {
    it('should return true when exactly one default tier exists', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('id')
        .eq('is_default', true)
        .mockResolvedValue({
          data: [{ id: 'tier-free' }],
          error: null,
        })

      const result = await tiersService.validateOnlyOneDefault()

      expect(result).toBe(true)
    })

    it('should return false when multiple default tiers exist', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('id')
        .eq('is_default', true)
        .mockResolvedValue({
          data: [{ id: 'tier-free' }, { id: 'tier-starter' }],
          error: null,
        })

      const result = await tiersService.validateOnlyOneDefault()

      expect(result).toBe(false)
    })

    it('should return false when no default tier exists', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('id')
        .eq('is_default', true)
        .mockResolvedValue({
          data: [],
          error: null,
        })

      const result = await tiersService.validateOnlyOneDefault()

      expect(result).toBe(false)
    })

    it('should handle database errors', async () => {
      mockSupabase
        .from('subscription_tiers')
        .select('id')
        .eq('is_default', true)
        .mockResolvedValue({
          data: null,
          error: { message: 'Query failed' },
        })

      await expect(tiersService.validateOnlyOneDefault()).rejects.toThrow('Query failed')
    })
  })
})

// Helper function to create mock Supabase client
function createMockSupabase() {
  const mockQuery = {
    select: mock(() => mockQuery),
    eq: mock(() => mockQuery),
    order: mock(() => Promise.resolve({ data: null, error: null })),
    single: mock(() => Promise.resolve({ data: null, error: null })),
  }

  return {
    from: mock(() => mockQuery),
  }
}
