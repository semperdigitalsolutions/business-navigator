/**
 * Audit Log Types
 * Types for the admin audit log system
 */

export type AuditAction = 'create' | 'update' | 'delete'

export type AuditResourceType = 'model' | 'tier' | 'api_key' | 'setting'

export interface AuditLogEntry {
  id: string
  timestamp: string
  adminId: string
  adminEmail: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId: string
  changes: AuditChanges
  ipAddress: string
  metadata?: Record<string, unknown>
}

export interface AuditChanges {
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

export interface AuditLogFilters {
  startDate?: string
  endDate?: string
  adminId?: string
  actions?: AuditAction[]
  resourceTypes?: AuditResourceType[]
  resourceId?: string
  page?: number
  pageSize?: number
}

export interface AuditLogResponse {
  items: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface AdminUser {
  id: string
  email: string
}

export interface AdminUsersResponse {
  admins: AdminUser[]
}
