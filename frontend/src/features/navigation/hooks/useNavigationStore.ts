/**
 * Navigation Store - App navigation state
 * Manages active tab, sidebar state, and mobile navigation
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NavigationTab = 'home' | 'tasks' | 'assistant' | 'progress' | 'settings'

interface NavigationState {
  // Active navigation
  activeTab: NavigationTab
  isSidebarCollapsed: boolean
  isMobileMenuOpen: boolean

  // Navigation history
  previousTab: NavigationTab | null

  // Badge counts (for notifications)
  badgeCounts: Record<NavigationTab, number>

  // Actions
  setActiveTab: (tab: NavigationTab) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
  setBadgeCount: (tab: NavigationTab, count: number) => void
  clearBadgeCount: (tab: NavigationTab) => void
  reset: () => void

  // Helper methods
  hasBadge: (tab: NavigationTab) => boolean
  getTotalBadgeCount: () => number
}

const initialState = {
  activeTab: 'home' as NavigationTab,
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  previousTab: null,
  badgeCounts: {
    home: 0,
    tasks: 0,
    assistant: 0,
    progress: 0,
    settings: 0,
  },
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveTab: (tab) => {
        const state = get()
        set({
          activeTab: tab,
          previousTab: state.activeTab,
          isMobileMenuOpen: false, // Close mobile menu on navigation
        })
      },

      toggleSidebar: () => {
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ isSidebarCollapsed: collapsed })
      },

      openMobileMenu: () => set({ isMobileMenuOpen: true }),

      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      toggleMobileMenu: () => {
        set((state) => ({
          isMobileMenuOpen: !state.isMobileMenuOpen,
        }))
      },

      setBadgeCount: (tab, count) => {
        set((state) => ({
          badgeCounts: {
            ...state.badgeCounts,
            [tab]: Math.max(0, count),
          },
        }))
      },

      clearBadgeCount: (tab) => {
        set((state) => ({
          badgeCounts: {
            ...state.badgeCounts,
            [tab]: 0,
          },
        }))
      },

      reset: () => set(initialState),

      // Helper: Check if tab has badge
      hasBadge: (tab) => {
        const state = get()
        return state.badgeCounts[tab] > 0
      },

      // Helper: Get total badge count across all tabs
      getTotalBadgeCount: () => {
        const state = get()
        return Object.values(state.badgeCounts).reduce((sum, count) => sum + count, 0)
      },
    }),
    {
      name: 'navigation-storage',
      // Only persist sidebar and active tab, not transient state
      partialize: (state) => ({
        activeTab: state.activeTab,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
)
