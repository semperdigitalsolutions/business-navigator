/**
 * Admin API Keys Types
 */

export type ApiKeyProvider = 'openai' | 'anthropic' | 'openrouter' | 'google' | 'mistral' | 'cohere'

export interface AdminApiKey {
  id: string
  provider: ApiKeyProvider
  maskedKey: string
  status: 'active' | 'inactive'
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateApiKeyRequest {
  provider: ApiKeyProvider
  apiKey: string
}

export interface RotateApiKeyRequest {
  newApiKey: string
}

export interface AdminApiKeysResponse {
  keys: AdminApiKey[]
}

export interface CreateApiKeyResponse {
  key: AdminApiKey
}

export interface RotateApiKeyResponse {
  key: AdminApiKey
}

export interface DeleteApiKeyResponse {
  success: boolean
}
