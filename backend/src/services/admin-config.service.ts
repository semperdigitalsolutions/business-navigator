/**
 * Admin Config Service
 * Issue #201: Backend service for site configuration management in Epic 9
 *
 * Manages site settings, feature flags, and admin API keys.
 */
import { supabaseAdmin } from '@/config/database.js'
import { encrypt, decrypt } from '@/utils/crypto.js'

export interface SiteSetting {
  id: string
  key: string
  value: unknown
  description: string | null
  category: string
  isPublic: boolean
  isSensitive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FeatureFlag {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  targetTiers: string[]
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AdminApiKey {
  id: string
  keyIdentifier: string
  provider: string
  lastUsedAt: Date | null
  isActive: boolean
  createdAt: Date
}

export interface CreateApiKeyInput {
  provider: string
  apiKey: string
}

export interface AuditLogEntry {
  id: string
  adminUserId: string | null
  adminEmail: string | null
  action: string
  resourceType: string
  resourceId: string | null
  details: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export class AdminConfigService {
  // Site Settings Methods

  async getAllSettings(category?: string): Promise<SiteSetting[]> {
    let query = supabaseAdmin.from('site_settings').select('*').order('key')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`)
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      category: row.category,
      isPublic: row.is_public,
      isSensitive: row.is_sensitive,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  }

  async getSetting(key: string): Promise<unknown | null> {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch setting: ${error.message}`)
    }

    return data?.value
  }

  async setSetting(
    key: string,
    value: unknown,
    options?: {
      description?: string
      category?: string
      isPublic?: boolean
      isSensitive?: boolean
    }
  ): Promise<void> {
    const { error } = await supabaseAdmin.from('site_settings').upsert(
      {
        key,
        value: value as import('@/types/database.js').Json,
        description: options?.description ?? null,
        category: options?.category ?? 'general',
        is_public: options?.isPublic ?? false,
        is_sensitive: options?.isSensitive ?? false,
      },
      { onConflict: 'key' }
    )

    if (error) {
      throw new Error(`Failed to set setting: ${error.message}`)
    }
  }

  // Feature Flags Methods

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabaseAdmin.from('feature_flags').select('*').order('key')

    if (error) {
      throw new Error(`Failed to fetch feature flags: ${error.message}`)
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      key: row.key,
      enabled: row.is_enabled,
      rolloutPercentage: row.rollout_percentage,
      targetTiers: row.enabled_for_tiers ?? [],
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  }

  async isFeatureEnabled(key: string, userTier?: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('feature_flags')
      .select('is_enabled, rollout_percentage, enabled_for_tiers')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return false
      throw new Error(`Failed to check feature flag: ${error.message}`)
    }

    if (!data?.is_enabled) return false

    // Check tier targeting
    if (userTier && data.enabled_for_tiers?.length > 0) {
      if (!data.enabled_for_tiers.includes(userTier)) return false
    }

    // Check rollout percentage (simple hash-based)
    if (data.rollout_percentage < 100) {
      const hash = Math.abs(key.split('').reduce((a, b) => a + b.charCodeAt(0), 0))
      return hash % 100 < data.rollout_percentage
    }

    return true
  }

  async setFeatureFlag(
    key: string,
    enabled: boolean,
    options?: {
      name?: string
      rolloutPercentage?: number
      targetTiers?: string[]
      description?: string
    }
  ): Promise<void> {
    const { error } = await supabaseAdmin.from('feature_flags').upsert(
      {
        key,
        name: options?.name ?? key,
        is_enabled: enabled,
        rollout_percentage: options?.rolloutPercentage ?? 100,
        enabled_for_tiers: options?.targetTiers ?? [],
        description: options?.description ?? null,
      },
      { onConflict: 'key' }
    )

    if (error) {
      throw new Error(`Failed to set feature flag: ${error.message}`)
    }
  }

  // Admin API Keys Methods

  async getAllApiKeys(): Promise<AdminApiKey[]> {
    const { data, error } = await supabaseAdmin
      .from('admin_api_keys')
      .select('id, key_identifier, provider, last_used_at, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch API keys: ${error.message}`)
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      keyIdentifier: row.key_identifier,
      provider: row.provider,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    }))
  }

  async createApiKey(input: CreateApiKeyInput): Promise<AdminApiKey> {
    const encrypted = encrypt(input.apiKey)
    // Show last 4 characters for identification (e.g., "...xxxx")
    const keyIdentifier = '...' + input.apiKey.slice(-4)

    const { data, error } = await supabaseAdmin
      .from('admin_api_keys')
      .insert({
        provider: input.provider,
        encrypted_key: encrypted,
        key_identifier: keyIdentifier,
        is_active: true,
      })
      .select('id, key_identifier, provider, last_used_at, is_active, created_at')
      .single()

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`)
    }

    return {
      id: data.id,
      keyIdentifier: data.key_identifier,
      provider: data.provider,
      lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : null,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
    }
  }

  async getDecryptedApiKey(id: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('admin_api_keys')
      .select('encrypted_key, is_active')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch API key: ${error.message}`)
    }

    if (!data?.is_active) return null

    // Update last_used_at
    await supabaseAdmin
      .from('admin_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', id)

    return decrypt(data.encrypted_key)
  }

  async rotateApiKey(id: string, newApiKey: string): Promise<void> {
    const encrypted = encrypt(newApiKey)
    const keyIdentifier = '...' + newApiKey.slice(-4)

    const { error } = await supabaseAdmin
      .from('admin_api_keys')
      .update({
        encrypted_key: encrypted,
        key_identifier: keyIdentifier,
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to rotate API key: ${error.message}`)
    }
  }

  async deleteApiKey(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('admin_api_keys').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`)
    }
  }

  // Audit Log Methods

  async logAction(
    adminUserId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, unknown>,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const { error } = await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: adminUserId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details as import('@/types/database.js').Json,
      ip_address: context?.ipAddress ?? null,
      user_agent: context?.userAgent ?? null,
    })

    if (error) {
      console.error('Failed to log admin action:', error)
      // Don't throw - audit logging should not break operations
    }
  }

  async getAuditLog(options?: {
    limit?: number
    offset?: number
    adminUserId?: string
    resourceType?: string
    action?: string
  }): Promise<{ entries: AuditLogEntry[]; total: number }> {
    // Join with users table to get admin email
    let query = supabaseAdmin
      .from('admin_audit_log')
      .select('*, users!admin_audit_log_admin_user_id_fkey(email)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options?.adminUserId) {
      query = query.eq('admin_user_id', options.adminUserId)
    }
    if (options?.resourceType) {
      query = query.eq('resource_type', options.resourceType)
    }
    if (options?.action) {
      query = query.eq('action', options.action)
    }

    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch audit log: ${error.message}`)
    }

    return {
      entries: (data ?? []).map((row) => ({
        id: row.id,
        adminUserId: row.admin_user_id,
        adminEmail: (row.users as { email: string } | null)?.email ?? null,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        details: row.details as Record<string, unknown>,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: new Date(row.created_at),
      })),
      total: count ?? 0,
    }
  }
}

export const adminConfigService = new AdminConfigService()
