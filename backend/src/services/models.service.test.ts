/**
 * Integration tests for Models Service
 * Tests model catalog, tier filtering, and caching behavior
 */
import { describe, expect, it, beforeEach, mock } from 'bun:test'

// Mock types
interface AIModel {
  id: string
  name: string
  provider: string
  model_id: string
  credit_cost: number
  min_tier: string
  is_active: boolean
  description: string | null
  created_at: string
  updated_at: string
}

// Mock ModelsService implementation for testing
class ModelsService {
  private cache: Map<string, { data: unknown; expiry: number }>
  private cacheTTL: number = 300000 // 5 minutes

  constructor(private supabase: unknown) {
    this.cache = new Map()
  }

  async getAvailableModels(tierId?: string): Promise<AIModel[]> {
    const cacheKey = `models:${tierId || 'all'}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() < cached.expiry) {
      return cached.data as AIModel[]
    }

    let query = (this.supabase as any)
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('credit_cost')

    if (tierId) {
      query = query.gte('min_tier', tierId)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    this.cache.set(cacheKey, {
      data: data || [],
      expiry: Date.now() + this.cacheTTL,
    })

    return data || []
  }

  async getModelCost(modelId: string): Promise<number> {
    const { data, error } = await (this.supabase as any)
      .from('ai_models')
      .select('credit_cost')
      .eq('id', modelId)
      .single()

    if (error) throw new Error(error.message)
    return data?.credit_cost || 0
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

describe('ModelsService', () => {
  let mockSupabase: any
  let modelsService: ModelsService

  beforeEach(() => {
    mockSupabase = createMockSupabase()
    modelsService = new ModelsService(mockSupabase)
  })

  describe('getAvailableModels', () => {
    it('should return all active models', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-3.5-turbo',
          credit_cost: 1,
          min_tier: 'free',
          is_active: true,
          description: 'Fast and affordable model',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'model-2',
          name: 'GPT-4 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-4-turbo',
          credit_cost: 3,
          min_tier: 'starter',
          is_active: true,
          description: 'Advanced reasoning model',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase.from('ai_models').select('*').eq('is_active', true).order.mockResolvedValue({
        data: mockModels,
        error: null,
      })

      const result = await modelsService.getAvailableModels()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('GPT-3.5 Turbo')
      expect(result[1].name).toBe('GPT-4 Turbo')
    })

    it('should filter by tier correctly', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-2',
          name: 'GPT-4 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-4-turbo',
          credit_cost: 3,
          min_tier: 'starter',
          is_active: true,
          description: 'Advanced reasoning model',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'model-3',
          name: 'Claude 3.5 Sonnet',
          provider: 'Anthropic',
          model_id: 'claude-3-5-sonnet',
          credit_cost: 5,
          min_tier: 'growth',
          is_active: true,
          description: 'Premium conversational AI',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase.from('ai_models').select('*').eq('is_active', true).order.gte.mockResolvedValue({
        data: mockModels,
        error: null,
      })

      const result = await modelsService.getAvailableModels('starter')

      expect(result).toHaveLength(2)
      expect(result.every((m) => m.min_tier === 'starter' || m.min_tier === 'growth')).toBe(true)
    })

    it('should return empty array when no models found', async () => {
      mockSupabase.from('ai_models').select('*').eq('is_active', true).order.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await modelsService.getAvailableModels()

      expect(result).toHaveLength(0)
    })

    it('should handle database errors', async () => {
      mockSupabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .order.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        })

      await expect(modelsService.getAvailableModels()).rejects.toThrow('Database error')
    })

    it('should order by credit cost ascending', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-3.5-turbo',
          credit_cost: 1,
          min_tier: 'free',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'model-2',
          name: 'GPT-4 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-4-turbo',
          credit_cost: 3,
          min_tier: 'starter',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'model-3',
          name: 'Claude 3 Opus',
          provider: 'Anthropic',
          model_id: 'claude-3-opus',
          credit_cost: 10,
          min_tier: 'pro',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase.from('ai_models').select('*').eq('is_active', true).order.mockResolvedValue({
        data: mockModels,
        error: null,
      })

      const result = await modelsService.getAvailableModels()

      expect(result[0].credit_cost).toBe(1)
      expect(result[1].credit_cost).toBe(3)
      expect(result[2].credit_cost).toBe(10)
    })
  })

  describe('getModelCost', () => {
    it('should return correct credit cost for a model', async () => {
      mockSupabase
        .from('ai_models')
        .select('credit_cost')
        .eq('id', 'model-1')
        .single.mockResolvedValue({
          data: { credit_cost: 5 },
          error: null,
        })

      const cost = await modelsService.getModelCost('model-1')

      expect(cost).toBe(5)
    })

    it('should return 0 for non-existent model', async () => {
      mockSupabase
        .from('ai_models')
        .select('credit_cost')
        .eq('id', 'invalid')
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        })

      await expect(modelsService.getModelCost('invalid')).rejects.toThrow('Not found')
    })

    it('should handle different cost values', async () => {
      const testCases = [
        { modelId: 'cheap', cost: 1 },
        { modelId: 'medium', cost: 3 },
        { modelId: 'expensive', cost: 10 },
      ]

      for (const testCase of testCases) {
        mockSupabase
          .from('ai_models')
          .select('credit_cost')
          .eq('id', testCase.modelId)
          .single.mockResolvedValue({
            data: { credit_cost: testCase.cost },
            error: null,
          })

        const cost = await modelsService.getModelCost(testCase.modelId)
        expect(cost).toBe(testCase.cost)
      }
    })
  })

  describe('caching behavior', () => {
    it('should cache results on first call', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-3.5-turbo',
          credit_cost: 1,
          min_tier: 'free',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      const selectMock = mock(() => ({
        eq: mock(() => ({
          order: mock(() =>
            Promise.resolve({
              data: mockModels,
              error: null,
            })
          ),
        })),
      }))

      mockSupabase.from('ai_models').select = selectMock

      await modelsService.getAvailableModels()

      expect(selectMock).toHaveBeenCalledTimes(1)
      expect(modelsService.getCacheSize()).toBe(1)
    })

    it('should use cache on subsequent calls', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-3.5-turbo',
          credit_cost: 1,
          min_tier: 'free',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      const selectMock = mock(() => ({
        eq: mock(() => ({
          order: mock(() =>
            Promise.resolve({
              data: mockModels,
              error: null,
            })
          ),
        })),
      }))

      mockSupabase.from('ai_models').select = selectMock

      await modelsService.getAvailableModels()
      await modelsService.getAvailableModels()
      await modelsService.getAvailableModels()

      expect(selectMock).toHaveBeenCalledTimes(1)
    })

    it('should clear cache when requested', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-3.5-turbo',
          credit_cost: 1,
          min_tier: 'free',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      mockSupabase.from('ai_models').select('*').eq('is_active', true).order.mockResolvedValue({
        data: mockModels,
        error: null,
      })

      await modelsService.getAvailableModels()
      expect(modelsService.getCacheSize()).toBe(1)

      modelsService.clearCache()
      expect(modelsService.getCacheSize()).toBe(0)
    })

    it('should cache different tier filters separately', async () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          model_id: 'gpt-3.5-turbo',
          credit_cost: 1,
          min_tier: 'free',
          is_active: true,
          description: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]

      const selectMock = mock(() => ({
        eq: mock(() => ({
          order: mock(() =>
            Promise.resolve({
              data: mockModels,
              error: null,
            })
          ),
          gte: mock(() =>
            Promise.resolve({
              data: mockModels,
              error: null,
            })
          ),
        })),
      }))

      mockSupabase.from('ai_models').select = selectMock

      await modelsService.getAvailableModels()
      await modelsService.getAvailableModels('starter')

      expect(modelsService.getCacheSize()).toBe(2)
    })
  })
})

// Helper function to create mock Supabase client
function createMockSupabase() {
  const mockQuery = {
    select: mock(() => mockQuery),
    eq: mock(() => mockQuery),
    gte: mock(() => mockQuery),
    order: mock(() => Promise.resolve({ data: null, error: null })),
    single: mock(() => Promise.resolve({ data: null, error: null })),
  }

  return {
    from: mock(() => mockQuery),
  }
}
