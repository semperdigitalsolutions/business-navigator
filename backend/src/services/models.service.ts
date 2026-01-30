/**
 * Models Service
 * Issue #198: Backend service for AI model management in Epic 9
 *
 * Manages AI model catalog with tier-based access control and caching.
 */
import { supabaseAdmin } from '@/config/database.js'
import type { SubscriptionTier } from '@shared/types'

export interface AIModel {
  id: string
  provider: string
  modelId: string
  displayName: string
  creditCost: number
  minTierSlug: string | null
  isEnabled: boolean
  capabilities?: Record<string, unknown>
  maxTokens?: number
  contextWindow?: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateModelInput {
  provider: string
  modelId: string
  displayName: string
  creditCost: number
  minTierSlug?: string
  isEnabled?: boolean
  capabilities?: Record<string, unknown>
  maxTokens?: number
  contextWindow?: number
  description?: string
}

export interface UpdateModelInput {
  displayName?: string
  creditCost?: number
  minTierSlug?: string | null
  isEnabled?: boolean
  capabilities?: Record<string, unknown>
  maxTokens?: number
  contextWindow?: number
  description?: string
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  enterprise: 3,
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export class ModelsService {
  private cache = new Map<string, CacheEntry<AIModel[]>>()

  private hasAccess(userTier: SubscriptionTier, minTier: string | null): boolean {
    if (!minTier) return true
    const userLevel = TIER_HIERARCHY[userTier] ?? 0
    const requiredLevel = TIER_HIERARCHY[minTier as SubscriptionTier] ?? 0
    return userLevel >= requiredLevel
  }

  private getCacheKey(tierSlug?: string): string {
    return tierSlug ? `models:${tierSlug}` : 'models:all'
  }

  private getFromCache(key: string): AIModel[] | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  private setCache(key: string, data: AIModel[]): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })
  }

  private invalidateCache(): void {
    this.cache.clear()
  }

  private mapRowToModel(row: Record<string, unknown>): AIModel {
    return {
      id: row.id as string,
      provider: row.provider as string,
      modelId: row.model_id as string,
      displayName: row.display_name as string,
      creditCost: row.credits_per_message as number,
      minTierSlug: row.min_tier as string | null,
      isEnabled: row.is_active as boolean,
      capabilities: row.capabilities as Record<string, unknown> | undefined,
      maxTokens: row.max_output_tokens as number | undefined,
      contextWindow: row.context_window as number | undefined,
      description: row.description as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }
  }

  async getAvailableModels(userTierSlug?: string): Promise<AIModel[]> {
    const cacheKey = this.getCacheKey(userTierSlug)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const { data, error } = await supabaseAdmin
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch models: ${error.message}`)
    }

    let models = (data ?? []).map((row) => this.mapRowToModel(row))

    if (userTierSlug) {
      const tier = userTierSlug as SubscriptionTier
      models = models.filter((m) => this.hasAccess(tier, m.minTierSlug))
    }

    this.setCache(cacheKey, models)
    return models
  }

  async getModelById(modelId: string): Promise<AIModel | null> {
    const { data, error } = await supabaseAdmin
      .from('ai_models')
      .select('*')
      .eq('id', modelId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch model: ${error.message}`)
    }

    return data ? this.mapRowToModel(data) : null
  }

  async getModelCost(modelId: string): Promise<number> {
    const model = await this.getModelById(modelId)
    if (!model) {
      throw new Error(`Model not found: ${modelId}`)
    }
    return model.creditCost
  }

  async createModel(input: CreateModelInput): Promise<AIModel> {
    const { data, error } = await supabaseAdmin
      .from('ai_models')
      .insert({
        provider: input.provider,
        model_id: input.modelId,
        display_name: input.displayName,
        credits_per_message: input.creditCost,
        min_tier: input.minTierSlug ?? 'free',
        is_active: input.isEnabled ?? true,
        capabilities: (input.capabilities ?? []) as import('@/types/database.js').Json,
        max_output_tokens: input.maxTokens ?? 4096,
        context_window: input.contextWindow ?? 4096,
        description: input.description ?? null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create model: ${error.message}`)
    }

    this.invalidateCache()
    return this.mapRowToModel(data)
  }

  async updateModel(id: string, input: UpdateModelInput): Promise<AIModel> {
    const updateData: Record<string, unknown> = {}

    if (input.displayName !== undefined) updateData.display_name = input.displayName
    if (input.creditCost !== undefined) updateData.credits_per_message = input.creditCost
    if (input.minTierSlug !== undefined) updateData.min_tier = input.minTierSlug
    if (input.isEnabled !== undefined) updateData.is_active = input.isEnabled
    if (input.capabilities !== undefined) updateData.capabilities = input.capabilities
    if (input.maxTokens !== undefined) updateData.max_output_tokens = input.maxTokens
    if (input.contextWindow !== undefined) updateData.context_window = input.contextWindow
    if (input.description !== undefined) updateData.description = input.description

    const { data, error } = await supabaseAdmin
      .from('ai_models')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update model: ${error.message}`)
    }

    this.invalidateCache()
    return this.mapRowToModel(data)
  }

  async toggleModelEnabled(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabaseAdmin
      .from('ai_models')
      .update({ is_active: enabled })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to toggle model: ${error.message}`)
    }

    this.invalidateCache()
  }
}

export const modelsService = new ModelsService()
