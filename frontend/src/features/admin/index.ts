/**
 * Admin Feature Exports
 */

// Layout Components (Issue #205)
export { AdminGuard } from './components/AdminGuard'
export { AdminLayout } from './components/AdminLayout'

// Pages
export { AdminApiKeysPage } from './pages/AdminApiKeysPage'
export { AdminAuditLogPage } from './pages/AdminAuditLogPage'

// Components
export { AddApiKeyModal } from './components/AddApiKeyModal'
export { ApiKeyTable } from './components/ApiKeyTable'
export { AuditLogFilters } from './components/AuditLogFilters'
export { AuditLogTable } from './components/AuditLogTable'
export { AuditLogPagination } from './components/AuditLogPagination'
export { ChangesViewerModal } from './components/ChangesViewerModal'
export { DeleteKeyModal } from './components/DeleteKeyModal'
export { RotateKeyModal } from './components/RotateKeyModal'

// Hooks
export { useAdminApiKeys } from './hooks/useAdminApiKeys'
export { useAuditLogStore } from './hooks/useAuditLogStore'
export { checkIsAdmin, useIsAdmin } from './hooks/useIsAdmin'

// Routes (Issue #205)
export { adminCatchAllRoute, adminRoutes } from './routes'
export type { AdminRoute } from './routes'

// API
export { adminApiKeysApi } from './api/admin-api-keys.api'
export { auditLogApi } from './api/audit-log.api'

// Types
export type {
  AdminApiKey,
  AdminApiKeysResponse,
  ApiKeyProvider,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  RotateApiKeyRequest,
  RotateApiKeyResponse,
} from './types/admin-api-keys.types'

export type {
  AuditAction,
  AuditResourceType,
  AuditLogEntry,
  AuditChanges,
  AuditLogFilters,
  AuditLogResponse,
  AdminUser,
  AdminUsersResponse,
} from './types/audit-log.types'
