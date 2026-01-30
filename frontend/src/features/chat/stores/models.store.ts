/**
 * Models Store - AI model selection and management
 * Epic 9: Credit-based model selection system
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api/client'

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000

export interface AIModel {
  id: string
  provider: string
  modelId: string
  displayName: string
  creditCost: number
  minTierSlug: string
  isEnabled: boolean
  capabilities?: Record<string, unknown>
  maxTokens?: number
}

interface ModelsState {
  models: AIModel[]
  selectedModelId: string | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
}

interface ModelsActions {
  fetchModels: (forceRefresh?: boolean) => Promise<void>
  selectModel: (id: string) => void
  getDefaultModel: (tierSlug: string) => AIModel | null
  reset: () => void
}

// Tier hierarchy for filtering available models
const TIER_HIERARCHY: Record<string, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  enterprise: 3,
}

/**
 * Check if a tier meets the minimum required tier
 */
function tierMeetsMinimum(userTier: string, minTier: string): boolean {
  const userLevel = TIER_HIERARCHY[userTier] ?? 0
  const minLevel = TIER_HIERARCHY[minTier] ?? 0
  return userLevel >= minLevel
}

/**
 * Check if cache is still valid
 */
function isCacheValid(lastFetched: Date | null): boolean {
  if (!lastFetched) return false
  const now = Date.now()
  const fetchedAt = new Date(lastFetched).getTime()
  return now - fetchedAt < CACHE_DURATION_MS
}

const initialState: ModelsState = {
  models: [],
  selectedModelId: null,
  loading: false,
  error: null,
  lastFetched: null,
}

export const useModelsStore = create<ModelsState & ModelsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Fetch available models from API
       * Uses cache unless forceRefresh is true
       */
      fetchModels: async (forceRefresh = false) => {
        const state = get()

        // Return cached data if valid and not forcing refresh
        if (!forceRefresh && isCacheValid(state.lastFetched) && state.models.length > 0) {
          return
        }

        set({ loading: true, error: null })

        try {
          const response = await apiClient.get<{ models: AIModel[] }>('/api/models')
          const models = response.models || []

          set({
            models,
            loading: false,
            lastFetched: new Date(),
            error: null,
          })

          // If no model selected and we have models, select the first enabled one
          const currentState = get()
          if (!currentState.selectedModelId && models.length > 0) {
            const defaultModel = models.find((m) => m.isEnabled)
            if (defaultModel) {
              set({ selectedModelId: defaultModel.id })
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models'
          set({
            loading: false,
            error: errorMessage,
          })
        }
      },

      /**
       * Select a model by ID
       */
      selectModel: (id: string) => {
        const state = get()
        const model = state.models.find((m) => m.id === id)

        if (model && model.isEnabled) {
          set({ selectedModelId: id })
        }
      },

      /**
       * Get the default model for a given tier
       * Returns the cheapest enabled model the user has access to
       */
      getDefaultModel: (tierSlug: string) => {
        const state = get()
        const availableModels = state.models.filter(
          (m) => m.isEnabled && tierMeetsMinimum(tierSlug, m.minTierSlug)
        )

        if (availableModels.length === 0) return null

        // Return cheapest available model
        return availableModels.reduce((cheapest, current) =>
          current.creditCost < cheapest.creditCost ? current : cheapest
        )
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'models-storage',
      // Only persist selectedModelId to localStorage
      partialize: (state) => ({
        selectedModelId: state.selectedModelId,
      }),
    }
  )
)

// ============================================================================
// Computed Selectors
// ============================================================================

/**
 * Get the currently selected model object
 */
export const useSelectedModel = (): AIModel | null => {
  return useModelsStore((state) => {
    if (!state.selectedModelId) return null
    return state.models.find((m) => m.id === state.selectedModelId) ?? null
  })
}

/**
 * Get models available for a user's tier
 */
export const useAvailableModels = (tierSlug: string): AIModel[] => {
  return useModelsStore((state) =>
    state.models.filter((m) => m.isEnabled && tierMeetsMinimum(tierSlug, m.minTierSlug))
  )
}

/**
 * Get models grouped by provider
 */
export const useModelsByProvider = (): Record<string, AIModel[]> => {
  return useModelsStore((state) => {
    const grouped: Record<string, AIModel[]> = {}

    for (const model of state.models) {
      if (!model.isEnabled) continue

      if (!grouped[model.provider]) {
        grouped[model.provider] = []
      }
      grouped[model.provider].push(model)
    }

    return grouped
  })
}

/**
 * Get the cheapest available model for a tier
 */
export const useCheapestModel = (tierSlug: string): AIModel | null => {
  return useModelsStore((state) => {
    const availableModels = state.models.filter(
      (m) => m.isEnabled && tierMeetsMinimum(tierSlug, m.minTierSlug)
    )

    if (availableModels.length === 0) return null

    return availableModels.reduce((cheapest, current) =>
      current.creditCost < cheapest.creditCost ? current : cheapest
    )
  })
}
