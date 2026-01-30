/**
 * Audit Log Table Component
 * Displays paginated table of audit log entries
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst-ui-kit/typescript/table'
import { Badge } from '@/components/catalyst-ui-kit/typescript/badge'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type { AuditAction, AuditLogEntry } from '../types/audit-log.types'

interface AuditLogTableProps {
  logs: AuditLogEntry[]
  isLoading: boolean
  onViewChanges: (entry: AuditLogEntry) => void
}

const ACTION_COLORS: Record<AuditAction, 'green' | 'yellow' | 'red'> = {
  create: 'green',
  update: 'yellow',
  delete: 'red',
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function formatResourceType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function hasChanges(entry: AuditLogEntry): boolean {
  const before = entry.changes?.before
  const after = entry.changes?.after
  return !!(before || after)
}

export function AuditLogTable({ logs, isLoading, onViewChanges }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <Text className="mt-4">Loading audit logs...</Text>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <Text className="mt-4 text-lg font-medium text-zinc-950 dark:text-white">
            No audit logs found
          </Text>
          <Text className="mt-2">Try adjusting your filters or check back later.</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <Table dense>
        <TableHead>
          <TableRow>
            <TableHeader>Timestamp</TableHeader>
            <TableHeader>Admin</TableHeader>
            <TableHeader>Action</TableHeader>
            <TableHeader>Resource Type</TableHeader>
            <TableHeader>Resource ID</TableHeader>
            <TableHeader>Changes</TableHeader>
            <TableHeader>IP Address</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-zinc-950 dark:text-white">
                  {entry.adminEmail}
                </span>
              </TableCell>
              <TableCell>
                <Badge color={ACTION_COLORS[entry.action]}>{entry.action.toUpperCase()}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatResourceType(entry.resourceType)}
                </span>
              </TableCell>
              <TableCell>
                <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  {entry.resourceId}
                </code>
              </TableCell>
              <TableCell>
                {hasChanges(entry) ? (
                  <Button plain onClick={() => onViewChanges(entry)}>
                    View Changes
                  </Button>
                ) : (
                  <span className="text-sm text-zinc-400 italic">No data</span>
                )}
              </TableCell>
              <TableCell>
                <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {entry.ipAddress}
                </code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
