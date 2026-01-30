/**
 * Tiers Service
 * Issue #200: Backend service for subscription tier management in Epic 9
 *
 * Manages subscription tier catalog with caching and tier comparisons.
 */
import { supabaseAdmin } from '@/config/database.js'

export interface SubscriptionTierData {
  id: string
  slug: string
  name: string
  description: string
  monthlyCredits: number
  priceCents: number
  features: string[] // JSON array of feature strings
  isDefault: boolean
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateTierInput {
  slug: string
  name: string
  description?: string
  monthlyCredits: number
  priceCents: number
  features?: string[]
  isDefault?: boolean
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateTierInput {
  name?: string
  description?: string
  monthlyCredits?: number
  priceCents?: number
  features?: string[]
  isDefault?: boolean
  displayOrder?: number
  isActive?: boolean
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export class TiersService {
  private cache = new Map<string, CacheEntry<SubscriptionTierData[]>>()

  private getCacheKey(): string {
    return 'tiers:all'
  }

  private getFromCache(key: string): SubscriptionTierData[] | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  private setCache(key: string, data: SubscriptionTierData[]): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })
  }

  private invalidateCache(): void {
    this.cache.clear()
  }

  private mapRowToTier(row: Record<string, unknown>): SubscriptionTierData {
    return {
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      description: (row.description as string) ?? '',
      monthlyCredits: row.monthly_credits as number,
      priceCents: row.price_cents as number,
      features: (row.features as string[]) ?? [],
      isDefault: row.is_default as boolean,
      displayOrder: row.display_order as number,
      isActive: row.is_active as boolean,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }
  }

  async getAllTiers(includeInactive = false): Promise<SubscriptionTierData[]> {
    const cacheKey = this.getCacheKey()
    const cached = this.getFromCache(cacheKey)
    if (cached && !includeInactive) {
      return cached.filter((t) => t.isActive)
    }

    let query = supabaseAdmin
      .from('subscription_tiers')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch tiers: ${error.message}`)
    }

    const tiers = (data ?? []).map((row) => this.mapRowToTier(row))

    if (!includeInactive) {
      this.setCache(cacheKey, tiers)
    }

    return tiers
  }

  async getTierBySlug(slug: string): Promise<SubscriptionTierData | null> {
    const { data, error } = await supabaseAdmin
      .from('subscription_tiers')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch tier: ${error.message}`)
    }

    return data ? this.mapRowToTier(data) : null
  }

  async getTierById(id: string): Promise<SubscriptionTierData | null> {
    const { data, error } = await supabaseAdmin
      .from('subscription_tiers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch tier: ${error.message}`)
    }

    return data ? this.mapRowToTier(data) : null
  }

  async getDefaultTier(): Promise<SubscriptionTierData | null> {
    const { data, error } = await supabaseAdmin
      .from('subscription_tiers')
      .select('*')
      .eq('is_default', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch default tier: ${error.message}`)
    }

    return data ? this.mapRowToTier(data) : null
  }

  async getTierCredits(slug: string): Promise<number> {
    const tier = await this.getTierBySlug(slug)
    if (!tier) {
      throw new Error(`Tier not found: ${slug}`)
    }
    return tier.monthlyCredits
  }

  async createTier(input: CreateTierInput): Promise<SubscriptionTierData> {
    const { data, error } = await supabaseAdmin
      .from('subscription_tiers')
      .insert({
        slug: input.slug,
        name: input.name,
        description: input.description ?? null,
        monthly_credits: input.monthlyCredits,
        price_cents: input.priceCents,
        features: input.features ?? [],
        is_default: input.isDefault ?? false,
        display_order: input.displayOrder ?? 0,
        is_active: input.isActive ?? true,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create tier: ${error.message}`)
    }

    this.invalidateCache()
    return this.mapRowToTier(data)
  }

  async updateTier(id: string, input: UpdateTierInput): Promise<SubscriptionTierData> {
    const updateData: Record<string, unknown> = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.monthlyCredits !== undefined) updateData.monthly_credits = input.monthlyCredits
    if (input.priceCents !== undefined) updateData.price_cents = input.priceCents
    if (input.features !== undefined) updateData.features = input.features
    if (input.isDefault !== undefined) updateData.is_default = input.isDefault
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { data, error } = await supabaseAdmin
      .from('subscription_tiers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update tier: ${error.message}`)
    }

    this.invalidateCache()
    return this.mapRowToTier(data)
  }

  async toggleTierActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabaseAdmin
      .from('subscription_tiers')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to toggle tier: ${error.message}`)
    }

    this.invalidateCache()
  }

  compareTiers(tierA: string, tierB: string): number {
    const hierarchy: Record<string, number> = {
      free: 0,
      basic: 1,
      pro: 2,
      enterprise: 3,
    }
    const levelA = hierarchy[tierA] ?? 0
    const levelB = hierarchy[tierB] ?? 0
    return levelA - levelB
  }
}

export const tiersService = new TiersService()
