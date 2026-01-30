/**
 * useAvailableModels Hook - Fetch and filter available AI models
 * Fetches models from GET /api/models and filters by user's tier
 */
import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { SubscriptionTier } from '@shared/types'
import { DEFAULT_MODELS } from '../constants/models'
import { type AIModel, type AIProvider, canAccessModel, useModelsStore } from './useModelsStore'

interface ModelsApiResponse {
  success: boolean
  data?: { models: ApiModel[] }
  error?: string
}

interface ApiModel {
  id: string
  name: string
  provider: string
  description?: string
  creditCost: number
  minTier: SubscriptionTier
}

interface UseAvailableModelsOptions {
  userTier?: SubscriptionTier
  autoFetch?: boolean
}

interface UseAvailableModelsReturn {
  models: AIModel[]
  accessibleModels: AIModel[]
  modelsByProvider: Map<AIProvider, AIModel[]>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/** Transform API model to internal model type */
function transformApiModel(m: ApiModel): AIModel {
  return {
    id: m.id,
    name: m.name,
    provider: m.provider as AIProvider,
    description: m.description,
    creditCost: m.creditCost,
    minTier: m.minTier,
    available: true,
  }
}

/** Group models by provider */
function groupByProvider(models: AIModel[]): Map<AIProvider, AIModel[]> {
  return models.reduce((acc, model) => {
    const existing = acc.get(model.provider) || []
    acc.set(model.provider, [...existing, model])
    return acc
  }, new Map<AIProvider, AIModel[]>())
}

export function useAvailableModels(
  options: UseAvailableModelsOptions = {}
): UseAvailableModelsReturn {
  const { userTier = 'free', autoFetch = true } = options
  const { models, setModels, setLoading, setError, isLoading, error } = useModelsStore()
  const [hasFetched, setHasFetched] = useState(false)

  const fetchModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response: ModelsApiResponse = await apiClient.get('/api/models')
      const fetchedModels =
        response.success && response.data?.models
          ? response.data.models.map(transformApiModel)
          : DEFAULT_MODELS
      setModels(fetchedModels)
    } catch (err) {
      console.error('Error fetching models:', err)
      setModels(DEFAULT_MODELS)
      setError('Failed to fetch models, using defaults')
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }, [setModels, setLoading, setError])

  useEffect(() => {
    if (autoFetch && !hasFetched && models.length === 0) {
      fetchModels()
    }
  }, [autoFetch, hasFetched, models.length, fetchModels])

  const effectiveModels = models.length > 0 ? models : DEFAULT_MODELS
  const accessibleModels = effectiveModels.filter((m) => canAccessModel(userTier, m.minTier))

  return {
    models: effectiveModels,
    accessibleModels,
    modelsByProvider: groupByProvider(effectiveModels),
    isLoading,
    error,
    refetch: fetchModels,
  }
}
