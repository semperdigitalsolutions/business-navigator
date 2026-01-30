/**
 * Admin Audit Log Page
 * Main page component for viewing and filtering admin audit logs
 * Epic 9 - Issue #210
 */
import { useCallback, useEffect } from 'react'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { useAuditLogStore } from '../hooks/useAuditLogStore'
import { auditLogApi } from '../api/audit-log.api'
import { AuditLogFilters } from '../components/AuditLogFilters'
import { AuditLogTable } from '../components/AuditLogTable'
import { AuditLogPagination } from '../components/AuditLogPagination'
import { ChangesViewerModal } from '../components/ChangesViewerModal'

export function AdminAuditLogPage() {
  const {
    logs,
    adminUsers,
    total,
    hasMore,
    isLoading,
    isExporting,
    error,
    filters,
    selectedEntry,
    setLogs,
    setAdminUsers,
    setLoading,
    setExporting,
    setError,
    setPage,
    setSelectedEntry,
  } = useAuditLogStore()

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await auditLogApi.getAuditLogs(filters)
      if (response.success && response.data) {
        setLogs(response.data.items, response.data.total, response.data.hasMore)
      } else {
        setError(response.error || 'Failed to load audit logs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [filters, setLogs, setLoading, setError])

  // Fetch admin users for filter dropdown
  const fetchAdminUsers = useCallback(async () => {
    try {
      const response = await auditLogApi.getAdminUsers()
      if (response.success && response.data) {
        setAdminUsers(response.data.admins)
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err)
    }
  }, [setAdminUsers])

  // Initial fetch
  useEffect(() => {
    fetchAdminUsers()
  }, [fetchAdminUsers])

  // Fetch logs when filters change
  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  // Handle export to CSV
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const blob = await auditLogApi.exportToCsv(filters)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export audit logs')
    } finally {
      setExporting(false)
    }
  }, [filters, setExporting, setError])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page)
    },
    [setPage]
  )

  // Handle view changes
  const handleViewChanges = useCallback(
    (entry: typeof selectedEntry) => {
      setSelectedEntry(entry)
    },
    [setSelectedEntry]
  )

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null)
  }, [setSelectedEntry])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">Audit Log</h1>
          <Text className="mt-2">View and search administrative actions across the platform</Text>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <Text className="text-red-700 dark:text-red-400">{error}</Text>
            </div>
          </div>
        )}

        {/* Filters */}
        <AuditLogFilters
          adminUsers={adminUsers}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {/* Table */}
        <AuditLogTable logs={logs} isLoading={isLoading} onViewChanges={handleViewChanges} />

        {/* Pagination */}
        <AuditLogPagination
          currentPage={filters.page ?? 1}
          totalItems={total}
          pageSize={filters.pageSize ?? 50}
          hasMore={hasMore}
          onPageChange={handlePageChange}
        />

        {/* Changes Modal */}
        <ChangesViewerModal entry={selectedEntry} onClose={handleCloseModal} />
      </div>
    </div>
  )
}
