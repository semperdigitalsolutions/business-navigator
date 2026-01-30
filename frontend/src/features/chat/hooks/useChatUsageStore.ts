/**
 * Chat Usage Store - Track message usage limits
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatUsageState {
  // Usage tracking
  messagesUsed: number
  messagesLimit: number
  resetsAt: string | null
  limitReached: boolean

  // Computed
  remaining: number

  // Actions
  setUsage: (usage: { messagesUsed: number; messagesLimit: number; resetsAt: string }) => void
  setLimitReached: (usage: {
    messagesUsed: number
    messagesLimit: number
    resetsAt: string
  }) => void
  incrementUsage: () => void
  reset: () => void
}

/**
 * Calculate time until reset in human-readable format
 */
export function getTimeUntilReset(resetsAt: string | null): string | null {
  if (!resetsAt) return null

  const now = new Date()
  const reset = new Date(resetsAt)
  const diffMs = reset.getTime() - now.getTime()

  if (diffMs <= 0) return null

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Check if the reset time has passed
 */
function hasResetPassed(resetsAt: string | null): boolean {
  if (!resetsAt) return false
  return new Date(resetsAt).getTime() <= Date.now()
}

export const useChatUsageStore = create<ChatUsageState>()(
  persist(
    (set, get) => ({
      // Initial state
      messagesUsed: 0,
      messagesLimit: 20, // Default limit (will be updated from API)
      resetsAt: null,
      limitReached: false,
      remaining: 20,

      // Set usage from API response
      setUsage: ({ messagesUsed, messagesLimit, resetsAt }) => {
        // Check if reset time has passed - if so, reset the counter
        if (hasResetPassed(get().resetsAt)) {
          set({
            messagesUsed,
            messagesLimit,
            resetsAt,
            remaining: messagesLimit - messagesUsed,
            limitReached: false,
          })
        } else {
          set({
            messagesUsed,
            messagesLimit,
            resetsAt,
            remaining: messagesLimit - messagesUsed,
            limitReached: messagesUsed >= messagesLimit,
          })
        }
      },

      // Set limit reached state (from 429 response)
      setLimitReached: ({ messagesUsed, messagesLimit, resetsAt }) => {
        set({
          messagesUsed,
          messagesLimit,
          resetsAt,
          remaining: 0,
          limitReached: true,
        })
      },

      // Increment usage after sending a message (optimistic update)
      incrementUsage: () => {
        const state = get()

        // Check if reset time has passed first
        if (hasResetPassed(state.resetsAt)) {
          set({
            messagesUsed: 1,
            remaining: state.messagesLimit - 1,
            limitReached: false,
            resetsAt: null, // Will be updated from next API response
          })
          return
        }

        const newUsed = state.messagesUsed + 1
        const newRemaining = Math.max(0, state.messagesLimit - newUsed)

        set({
          messagesUsed: newUsed,
          remaining: newRemaining,
          limitReached: newRemaining === 0,
        })
      },

      // Reset usage (e.g., when limit period expires)
      reset: () => {
        set({
          messagesUsed: 0,
          remaining: get().messagesLimit,
          limitReached: false,
          resetsAt: null,
        })
      },
    }),
    {
      name: 'chat-usage-storage',
      // Only persist certain fields
      partialize: (state) => ({
        messagesUsed: state.messagesUsed,
        messagesLimit: state.messagesLimit,
        resetsAt: state.resetsAt,
        remaining: state.remaining,
        limitReached: state.limitReached,
      }),
    }
  )
)
