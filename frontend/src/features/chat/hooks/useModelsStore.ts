/**
 * Models Store - Global AI model selection state
 * Persists selected model to localStorage and manages model preferences
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SubscriptionTier } from '@shared/types'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  description?: string
  creditCost: number
  /** Minimum tier required to use this model */
  minTier: SubscriptionTier
  /** Whether the model is currently available */
  available: boolean
}

interface ModelsState {
  selectedModelId: string | null
  models: AIModel[]
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedModel: (modelId: string) => void
  setModels: (models: AIModel[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  getSelectedModel: () => AIModel | null
  getDefaultModel: (userTier: SubscriptionTier) => AIModel | null
}

/** Tier hierarchy for comparison */
const tierOrder: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  enterprise: 3,
}

/** Check if user tier meets minimum tier requirement */
export function canAccessModel(userTier: SubscriptionTier, minTier: SubscriptionTier): boolean {
  return tierOrder[userTier] >= tierOrder[minTier]
}

/** Get the display name for a tier */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  return names[tier]
}

export const useModelsStore = create<ModelsState>()(
  persist(
    (set, get) => ({
      selectedModelId: null,
      models: [],
      isLoading: false,
      error: null,

      setSelectedModel: (modelId: string) => {
        set({ selectedModelId: modelId })
      },

      setModels: (models: AIModel[]) => {
        set({ models })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      getSelectedModel: () => {
        const { selectedModelId, models } = get()
        if (!selectedModelId) return null
        return models.find((m) => m.id === selectedModelId) || null
      },

      getDefaultModel: (userTier: SubscriptionTier) => {
        const { models } = get()
        // Find the cheapest available model the user can access
        const accessibleModels = models.filter(
          (m) => m.available && canAccessModel(userTier, m.minTier)
        )
        if (accessibleModels.length === 0) return null

        // Sort by credit cost ascending
        return accessibleModels.sort((a, b) => a.creditCost - b.creditCost)[0]
      },
    }),
    {
      name: 'models-storage',
      partialize: (state) => ({
        selectedModelId: state.selectedModelId,
      }),
    }
  )
)
