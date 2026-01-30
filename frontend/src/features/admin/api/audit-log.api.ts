/**
 * Admin Audit Log API
 * API client for admin audit log endpoints
 */
import { apiClient } from '@/lib/api/client'
import type { ApiResponse } from '@shared/types'
import type {
  AdminUsersResponse,
  AuditLogFilters,
  AuditLogResponse,
} from '../types/audit-log.types'

const PAGE_SIZE = 50

function appendIfPresent(params: URLSearchParams, key: string, value?: string) {
  if (value) params.append(key, value)
}

function appendArray(params: URLSearchParams, key: string, values?: string[]) {
  values?.forEach((value) => params.append(key, value))
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: AuditLogFilters): string {
  const params = new URLSearchParams()

  appendIfPresent(params, 'startDate', filters.startDate)
  appendIfPresent(params, 'endDate', filters.endDate)
  appendIfPresent(params, 'adminId', filters.adminId)
  appendIfPresent(params, 'resourceId', filters.resourceId)
  appendArray(params, 'actions', filters.actions)
  appendArray(params, 'resourceTypes', filters.resourceTypes)
  params.append('page', String(filters.page ?? 1))
  params.append('pageSize', String(filters.pageSize ?? PAGE_SIZE))

  return params.toString()
}

export const auditLogApi = {
  /**
   * Get paginated audit logs with filters
   */
  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<ApiResponse<AuditLogResponse>> => {
    const query = buildQueryString(filters)
    return apiClient.get(`/api/admin/audit-logs?${query}`)
  },

  /**
   * Get list of admin users for filter dropdown
   */
  getAdminUsers: async (): Promise<ApiResponse<AdminUsersResponse>> =>
    apiClient.get('/api/admin/users'),

  /**
   * Export audit logs to CSV
   */
  exportToCsv: async (filters: AuditLogFilters = {}): Promise<Blob> => {
    const query = buildQueryString({ ...filters, page: 1, pageSize: 10000 })
    const response = await apiClient.get(`/api/admin/audit-logs/export?${query}`, {
      responseType: 'blob',
    })
    return response as unknown as Blob
  },
}
