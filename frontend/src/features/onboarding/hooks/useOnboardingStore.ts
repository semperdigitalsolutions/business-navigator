/**
 * Onboarding Store - 6-step wizard state management
 * Implements dual persistence: localStorage (instant) + server (cross-device)
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingData } from '@shared/types'

interface OnboardingState {
  // Current wizard data
  data: OnboardingData
  currentStep: number
  stepsCompleted: number[]
  isCompleted: boolean

  // UI state
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Server sync state
  lastSyncedAt: Date | null
  hasUnsavedChanges: boolean

  // Actions
  setData: (data: Partial<OnboardingData>) => void
  setCurrentStep: (step: number) => void
  markStepCompleted: (step: number) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  setSynced: () => void
  setCompleted: () => void
  reset: () => void

  // Helper methods
  isStepCompleted: (step: number) => boolean
  canNavigateToStep: (step: number) => boolean
  getProgress: () => number
}

const initialState = {
  data: {},
  currentStep: 1,
  stepsCompleted: [],
  isCompleted: false,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSyncedAt: null,
  hasUnsavedChanges: false,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setData: (newData) => {
        set((state) => ({
          data: { ...state.data, ...newData },
          hasUnsavedChanges: true,
        }))
      },

      setCurrentStep: (step) => {
        if (step >= 1 && step <= 6) {
          set({ currentStep: step })
        }
      },

      markStepCompleted: (step) => {
        // Only mark valid steps (1-6)
        if (step < 1 || step > 6) return

        set((state) => {
          const completed = new Set(state.stepsCompleted.filter((s) => s <= 6))
          completed.add(step)
          return {
            stepsCompleted: Array.from(completed).sort((a, b) => a - b),
            hasUnsavedChanges: true,
          }
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setSaving: (saving) => set({ isSaving: saving }),
      setError: (error) => set({ error }),

      setSynced: () =>
        set({
          lastSyncedAt: new Date(),
          hasUnsavedChanges: false,
        }),

      setCompleted: () =>
        set({
          isCompleted: true,
          hasUnsavedChanges: false,
        }),

      reset: () => set(initialState),

      // Helper: Check if step is completed
      isStepCompleted: (step) => {
        const state = get()
        return state.stepsCompleted.includes(step)
      },

      // Helper: Check if user can navigate to step
      canNavigateToStep: (step) => {
        const state = get()
        // Can always go to step 1
        if (step === 1) return true
        // Can go to next step after current
        if (step <= state.currentStep + 1) return true
        // Can go back to completed steps
        if (state.stepsCompleted.includes(step)) return true
        return false
      },

      // Helper: Get completion progress (0-100)
      getProgress: () => {
        const state = get()
        return Math.round((state.stepsCompleted.length / 6) * 100)
      },
    }),
    {
      name: 'onboarding-storage',
      version: 1, // Increment this to trigger migration
      // Only persist essential data, not UI state
      partialize: (state) => ({
        data: state.data,
        currentStep: state.currentStep,
        stepsCompleted: state.stepsCompleted,
        isCompleted: state.isCompleted,
        lastSyncedAt: state.lastSyncedAt,
      }),
      // Migration to handle step 7 -> 6 conversion
      migrate: (persistedState: any, version: number) => {
        // If migrating from version 0 (before versioning) or old data
        if (version === 0 || !version) {
          // Filter out step 7 from completedSteps
          if (persistedState.stepsCompleted) {
            persistedState.stepsCompleted = persistedState.stepsCompleted.filter(
              (step: number) => step <= 6
            )
          }
          // Cap currentStep at 6
          if (persistedState.currentStep > 6) {
            persistedState.currentStep = 6
          }
        }
        return persistedState
      },
    }
  )
)
