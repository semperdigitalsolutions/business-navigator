/**
 * Admin API Keys API
 * Endpoints for platform-level API key management
 */
import { apiClient } from '@/lib/api/client'
import type { ApiResponse } from '@shared/types'
import type {
  AdminApiKey,
  AdminApiKeysResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  RotateApiKeyRequest,
  RotateApiKeyResponse,
} from '../types/admin-api-keys.types'

export const adminApiKeysApi = {
  /** Get all platform API keys (masked) */
  getApiKeys: (): Promise<ApiResponse<AdminApiKeysResponse>> =>
    apiClient.get('/api/admin/api-keys'),

  /** Add a new platform API key */
  createApiKey: (data: CreateApiKeyRequest): Promise<ApiResponse<CreateApiKeyResponse>> =>
    apiClient.post('/api/admin/api-keys', data),

  /** Rotate an existing API key */
  rotateApiKey: (
    keyId: string,
    data: RotateApiKeyRequest
  ): Promise<ApiResponse<RotateApiKeyResponse>> =>
    apiClient.post(`/api/admin/api-keys/${keyId}/rotate`, data),

  /** Delete an API key */
  deleteApiKey: (keyId: string): Promise<ApiResponse<DeleteApiKeyResponse>> =>
    apiClient.delete(`/api/admin/api-keys/${keyId}`),

  /** Toggle API key status (active/inactive) */
  toggleApiKeyStatus: (keyId: string): Promise<ApiResponse<{ key: AdminApiKey }>> =>
    apiClient.patch(`/api/admin/api-keys/${keyId}/toggle`),
}
