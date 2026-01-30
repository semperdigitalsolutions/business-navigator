/**
 * Credits Store - Manage user's credit balance
 * Part of Epic 9: Credit-based usage system
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CreditsState {
  // Current credit balance
  balance: number
  // Loading state
  isLoading: boolean
  // Error state
  error: string | null
  // Last fetched timestamp
  lastFetched: number | null

  // Actions
  setBalance: (balance: number) => void
  deductCredits: (amount: number) => void
  addCredits: (amount: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed helpers
  canAfford: (cost: number) => boolean
  getBalanceAfter: (cost: number) => number
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      // Initial state
      balance: 0,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Set balance from API
      setBalance: (balance: number) => {
        set({ balance, error: null, lastFetched: Date.now() })
      },

      // Deduct credits (optimistic update)
      deductCredits: (amount: number) => {
        const currentBalance = get().balance
        set({ balance: Math.max(0, currentBalance - amount) })
      },

      // Add credits
      addCredits: (amount: number) => {
        const currentBalance = get().balance
        set({ balance: currentBalance + amount })
      },

      // Set loading state
      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      // Set error
      setError: (error: string | null) => {
        set({ error })
      },

      // Check if user can afford a cost
      canAfford: (cost: number) => get().balance >= cost,

      // Get balance after deduction
      getBalanceAfter: (cost: number) => Math.max(0, get().balance - cost),
    }),
    {
      name: 'credits-storage',
      partialize: (state) => ({
        balance: state.balance,
        lastFetched: state.lastFetched,
      }),
    }
  )
)
