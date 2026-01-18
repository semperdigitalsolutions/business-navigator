/**
 * Dashboard Store - Dashboard state management
 * Manages hero task, confidence score, and dashboard UI state
 */
import { create } from 'zustand'
import type { UserTask, ConfidenceScore, DashboardData } from '@shared/types'

interface DashboardState {
  // Dashboard data
  dashboardData: DashboardData | null
  heroTask: UserTask | null
  confidenceScore: ConfidenceScore | null

  // UI state
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastFetchedAt: Date | null

  // Expandable sections state
  expandedSections: Set<string>

  // Actions
  setDashboardData: (data: DashboardData) => void
  setHeroTask: (task: UserTask | null) => void
  setConfidenceScore: (score: ConfidenceScore) => void
  setLoading: (loading: boolean) => void
  setRefreshing: (refreshing: boolean) => void
  setError: (error: string | null) => void
  toggleSection: (sectionId: string) => void
  expandSection: (sectionId: string) => void
  collapseSection: (sectionId: string) => void
  refresh: () => void
  reset: () => void

  // Helper methods
  isSectionExpanded: (sectionId: string) => boolean
  shouldRefresh: () => boolean
}

const initialState = {
  dashboardData: null,
  heroTask: null,
  confidenceScore: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
  expandedSections: new Set<string>(['hero-task', 'confidence-score']),
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...initialState,

  setDashboardData: (data) =>
    set({
      dashboardData: data,
      heroTask: data.heroTask || null,
      confidenceScore: data.confidenceScore,
      lastFetchedAt: new Date(),
      isLoading: false,
      isRefreshing: false,
      error: null,
    }),

  setHeroTask: (task) => set({ heroTask: task }),

  setConfidenceScore: (score) => set({ confidenceScore: score }),

  setLoading: (loading) => set({ isLoading: loading }),

  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
      isRefreshing: false,
    }),

  toggleSection: (sectionId) => {
    const state = get()
    const expanded = new Set(state.expandedSections)
    if (expanded.has(sectionId)) {
      expanded.delete(sectionId)
    } else {
      expanded.add(sectionId)
    }
    set({ expandedSections: expanded })
  },

  expandSection: (sectionId) => {
    const state = get()
    const expanded = new Set(state.expandedSections)
    expanded.add(sectionId)
    set({ expandedSections: expanded })
  },

  collapseSection: (sectionId) => {
    const state = get()
    const expanded = new Set(state.expandedSections)
    expanded.delete(sectionId)
    set({ expandedSections: expanded })
  },

  refresh: () => {
    set({ isRefreshing: true, error: null })
    // Actual refresh logic will be in the component/hook that calls the API
  },

  reset: () => set(initialState),

  // Helper: Check if section is expanded
  isSectionExpanded: (sectionId) => {
    const state = get()
    return state.expandedSections.has(sectionId)
  },

  // Helper: Check if data needs refresh (older than 5 minutes)
  shouldRefresh: () => {
    const state = get()
    if (!state.lastFetchedAt) return true
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return new Date(state.lastFetchedAt).getTime() < fiveMinutesAgo
  },
}))
