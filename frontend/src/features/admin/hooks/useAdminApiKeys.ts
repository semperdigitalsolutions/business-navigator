/**
 * useAdminApiKeys Hook
 * Manages admin API keys state with TanStack Query
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiKeysApi } from '../api/admin-api-keys.api'
import type { CreateApiKeyRequest, RotateApiKeyRequest } from '../types/admin-api-keys.types'

const QUERY_KEY = ['admin', 'api-keys']

export function useAdminApiKeys() {
  const queryClient = useQueryClient()

  // Fetch all API keys
  const {
    data: apiKeysData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await adminApiKeysApi.getApiKeys()
      if (response.success && response.data) {
        return response.data.keys
      }
      throw new Error(response.error || 'Failed to fetch API keys')
    },
  })

  // Create API key mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyRequest) => adminApiKeysApi.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // Rotate API key mutation
  const rotateMutation = useMutation({
    mutationFn: ({ keyId, data }: { keyId: string; data: RotateApiKeyRequest }) =>
      adminApiKeysApi.rotateApiKey(keyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // Delete API key mutation
  const deleteMutation = useMutation({
    mutationFn: (keyId: string) => adminApiKeysApi.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // Toggle API key status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (keyId: string) => adminApiKeysApi.toggleApiKeyStatus(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    apiKeys: apiKeysData ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
    createApiKey: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as Error | null,
    rotateApiKey: rotateMutation.mutateAsync,
    isRotating: rotateMutation.isPending,
    rotateError: rotateMutation.error as Error | null,
    deleteApiKey: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as Error | null,
    toggleApiKeyStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
  }
}
