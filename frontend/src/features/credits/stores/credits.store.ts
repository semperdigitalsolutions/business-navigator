/**
 * Credits Store - Global credits/balance state management
 * Epic 9: Credit-based rate limiting system
 */
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

// Default period allocation (can be adjusted based on subscription tier)
const DEFAULT_PERIOD_ALLOCATION = 100

interface CreditsState {
  balance: number
  periodStart: Date | null
  periodEnd: Date | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
}

interface CreditsActions {
  fetchBalance: () => Promise<void>
  deductCredits: (amount: number) => void
  rollbackDeduction: (amount: number) => void
  reset: () => void
}

interface CreditsGetters {
  isLow: () => boolean
  isCritical: () => boolean
  daysUntilReset: () => number
  canAfford: (amount: number) => boolean
}

type CreditsStore = CreditsState & CreditsActions & CreditsGetters

interface CreditsApiResponse {
  success: boolean
  data?: {
    balance: number
    periodStart: string
    periodEnd: string
    periodAllocation?: number
  }
  error?: string
}

const initialState: CreditsState = {
  balance: 0,
  periodStart: null,
  periodEnd: null,
  loading: false,
  error: null,
  lastFetched: null,
}

// Helper: Check if cached data is still fresh (30 second threshold)
const isCacheFresh = (lastFetched: Date | null): boolean =>
  lastFetched !== null && Date.now() - lastFetched.getTime() < 30000

// Helper: Calculate days until a target date
const calculateDaysUntil = (targetDate: Date | null): number => {
  if (!targetDate) return 0
  const diffMs = targetDate.getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export const useCreditsStore = create<CreditsStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        fetchBalance: async () => {
          const { lastFetched } = get()
          if (!isCacheFresh(lastFetched)) {
            set({ loading: true, error: null })
          }

          try {
            const response: CreditsApiResponse = await apiClient.get('/api/credits/balance')
            if (response.success && response.data) {
              set({
                balance: response.data.balance,
                periodStart: new Date(response.data.periodStart),
                periodEnd: new Date(response.data.periodEnd),
                loading: false,
                error: null,
                lastFetched: new Date(),
              })
            } else {
              set({ loading: false, error: response.error || 'Failed to fetch credits balance' })
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch credits'
            set({ loading: false, error: errorMessage })
          }
        },

        deductCredits: (amount: number) => {
          set((state) => ({ balance: Math.max(0, state.balance - amount) }))
        },

        rollbackDeduction: (amount: number) => {
          set((state) => ({ balance: state.balance + amount }))
        },

        reset: () => set(initialState),

        isLow: () => {
          const { balance } = get()
          return balance < DEFAULT_PERIOD_ALLOCATION * 0.2 && balance > 0
        },

        isCritical: () => get().balance <= DEFAULT_PERIOD_ALLOCATION * 0.05,

        daysUntilReset: () => calculateDaysUntil(get().periodEnd),

        canAfford: (amount: number) => get().balance >= amount,
      }),
      {
        name: 'credits-storage',
        // Only persist balance-related fields for offline display
        partialize: (state) => ({
          balance: state.balance,
          periodStart: state.periodStart,
          periodEnd: state.periodEnd,
          lastFetched: state.lastFetched,
        }),
        // Rehydrate dates from localStorage (stored as strings)
        onRehydrateStorage: () => (state) => {
          if (state) {
            if (state.periodStart && typeof state.periodStart === 'string') {
              state.periodStart = new Date(state.periodStart)
            }
            if (state.periodEnd && typeof state.periodEnd === 'string') {
              state.periodEnd = new Date(state.periodEnd)
            }
            if (state.lastFetched && typeof state.lastFetched === 'string') {
              state.lastFetched = new Date(state.lastFetched)
            }
          }
        },
      }
    )
  )
)

// Subscribe to auth state changes
// Fetch balance when user logs in, reset on logout
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated, previousIsAuthenticated) => {
    if (isAuthenticated && !previousIsAuthenticated) {
      // User just logged in - fetch credits
      useCreditsStore.getState().fetchBalance()
    } else if (!isAuthenticated && previousIsAuthenticated) {
      // User just logged out - reset credits
      useCreditsStore.getState().reset()
    }
  }
)

// Selectors for common use cases
export const selectCreditsBalance = (state: CreditsStore) => state.balance
export const selectCreditsLoading = (state: CreditsStore) => state.loading
export const selectCreditsError = (state: CreditsStore) => state.error
export const selectIsLowCredits = (state: CreditsStore) => state.isLow()
export const selectIsCriticalCredits = (state: CreditsStore) => state.isCritical()
