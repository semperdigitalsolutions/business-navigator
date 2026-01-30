/**
 * Audit Log Store
 * Zustand store for managing audit log state and filters
 */
import { create } from 'zustand'
import type {
  AdminUser,
  AuditAction,
  AuditLogEntry,
  AuditLogFilters,
  AuditResourceType,
} from '../types/audit-log.types'

interface AuditLogState {
  // Data
  logs: AuditLogEntry[]
  adminUsers: AdminUser[]
  total: number
  hasMore: boolean

  // Loading states
  isLoading: boolean
  isExporting: boolean
  error: string | null

  // Filters
  filters: AuditLogFilters

  // Selected entry for modal
  selectedEntry: AuditLogEntry | null

  // Actions
  setLogs: (logs: AuditLogEntry[], total: number, hasMore: boolean) => void
  setAdminUsers: (users: AdminUser[]) => void
  setLoading: (loading: boolean) => void
  setExporting: (exporting: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<AuditLogFilters>) => void
  resetFilters: () => void
  setPage: (page: number) => void
  setSelectedEntry: (entry: AuditLogEntry | null) => void
  toggleAction: (action: AuditAction) => void
  toggleResourceType: (type: AuditResourceType) => void
}

const DEFAULT_FILTERS: AuditLogFilters = {
  startDate: undefined,
  endDate: undefined,
  adminId: undefined,
  actions: [],
  resourceTypes: [],
  resourceId: undefined,
  page: 1,
  pageSize: 50,
}

export const useAuditLogStore = create<AuditLogState>((set, _get) => ({
  // Initial state
  logs: [],
  adminUsers: [],
  total: 0,
  hasMore: false,
  isLoading: false,
  isExporting: false,
  error: null,
  filters: { ...DEFAULT_FILTERS },
  selectedEntry: null,

  // Actions
  setLogs: (logs, total, hasMore) => set({ logs, total, hasMore }),

  setAdminUsers: (users) => set({ adminUsers: users }),

  setLoading: (loading) => set({ isLoading: loading }),

  setExporting: (exporting) => set({ isExporting: exporting }),

  setError: (error) => set({ error }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  setSelectedEntry: (entry) => set({ selectedEntry: entry }),

  toggleAction: (action) =>
    set((state) => {
      const actions = state.filters.actions ?? []
      const newActions = actions.includes(action)
        ? actions.filter((a) => a !== action)
        : [...actions, action]
      return {
        filters: { ...state.filters, actions: newActions, page: 1 },
      }
    }),

  toggleResourceType: (type) =>
    set((state) => {
      const types = state.filters.resourceTypes ?? []
      const newTypes = types.includes(type) ? types.filter((t) => t !== type) : [...types, type]
      return {
        filters: { ...state.filters, resourceTypes: newTypes, page: 1 },
      }
    }),
}))
