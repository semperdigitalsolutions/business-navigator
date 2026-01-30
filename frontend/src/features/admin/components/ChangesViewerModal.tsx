/**
 * Changes Viewer Modal
 * Displays JSON diff of before/after changes in audit log entries
 */
import { useState } from 'react'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '@/components/catalyst-ui-kit/typescript/dialog'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Badge } from '@/components/catalyst-ui-kit/typescript/badge'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { cn } from '@/utils/classnames'
import type { AuditChanges, AuditLogEntry } from '../types/audit-log.types'

interface ChangesViewerModalProps {
  entry: AuditLogEntry | null
  onClose: () => void
}

interface DiffLine {
  key: string
  before: unknown
  after: unknown
  type: 'added' | 'removed' | 'changed' | 'unchanged'
}

function getDiffLines(changes: AuditChanges): DiffLine[] {
  const before = changes.before ?? {}
  const after = changes.after ?? {}
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])
  const lines: DiffLine[] = []

  allKeys.forEach((key) => {
    const beforeVal = before[key]
    const afterVal = after[key]

    if (beforeVal === undefined && afterVal !== undefined) {
      lines.push({ key, before: beforeVal, after: afterVal, type: 'added' })
    } else if (beforeVal !== undefined && afterVal === undefined) {
      lines.push({ key, before: beforeVal, after: afterVal, type: 'removed' })
    } else if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      lines.push({ key, before: beforeVal, after: afterVal, type: 'changed' })
    } else {
      lines.push({ key, before: beforeVal, after: afterVal, type: 'unchanged' })
    }
  })

  return lines.sort((a, b) => {
    const order = { added: 0, removed: 1, changed: 2, unchanged: 3 }
    return order[a.type] - order[b.type]
  })
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function CollapsibleValue({ value, label }: { value: unknown; label: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const formatted = formatValue(value)
  const isLong = formatted.length > 100 || formatted.includes('\n')

  if (!isLong) {
    return <code className="text-xs break-all">{formatted}</code>
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-1"
      >
        {isExpanded ? 'Collapse' : 'Expand'} {label}
      </button>
      {isExpanded && (
        <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto max-h-48">
          {formatted}
        </pre>
      )}
      {!isExpanded && <code className="text-xs break-all">{formatted.slice(0, 100)}...</code>}
    </div>
  )
}

export function ChangesViewerModal({ entry, onClose }: ChangesViewerModalProps) {
  const [showUnchanged, setShowUnchanged] = useState(false)

  if (!entry) return null

  const diffLines = getDiffLines(entry.changes)
  const filteredLines = showUnchanged ? diffLines : diffLines.filter((l) => l.type !== 'unchanged')

  const actionColors = {
    create: 'green',
    update: 'yellow',
    delete: 'red',
  } as const

  return (
    <Dialog open={!!entry} onClose={onClose} size="3xl">
      <DialogTitle>Audit Log Details</DialogTitle>
      <DialogBody>
        {/* Entry metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <div>
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Timestamp</Text>
            <Text className="text-sm text-zinc-950 dark:text-white">
              {new Date(entry.timestamp).toLocaleString()}
            </Text>
          </div>
          <div>
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Admin</Text>
            <Text className="text-sm text-zinc-950 dark:text-white">{entry.adminEmail}</Text>
          </div>
          <div>
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Action</Text>
            <Badge color={actionColors[entry.action]}>{entry.action.toUpperCase()}</Badge>
          </div>
          <div>
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resource</Text>
            <Text className="text-sm text-zinc-950 dark:text-white">
              {entry.resourceType} / {entry.resourceId}
            </Text>
          </div>
          <div>
            <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">IP Address</Text>
            <Text className="text-sm text-zinc-950 dark:text-white font-mono">
              {entry.ipAddress}
            </Text>
          </div>
        </div>

        {/* Toggle unchanged */}
        <div className="flex items-center justify-between mb-4">
          <Text className="font-medium text-zinc-950 dark:text-white">Changes</Text>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            <span className="text-zinc-600 dark:text-zinc-400">Show unchanged fields</span>
          </label>
        </div>

        {/* Diff view */}
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 w-1/4">
                  Field
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 w-1/3">
                  Before
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 w-1/3">
                  After
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredLines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    No changes recorded
                  </td>
                </tr>
              ) : (
                filteredLines.map((line) => (
                  <tr
                    key={line.key}
                    className={cn(
                      line.type === 'added' && 'bg-green-50 dark:bg-green-900/20',
                      line.type === 'removed' && 'bg-red-50 dark:bg-red-900/20',
                      line.type === 'changed' && 'bg-yellow-50 dark:bg-yellow-900/20'
                    )}
                  >
                    <td className="px-4 py-2 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {line.key}
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                      {line.type === 'added' ? (
                        <span className="text-zinc-400 italic">-</span>
                      ) : (
                        <CollapsibleValue value={line.before} label="before" />
                      )}
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                      {line.type === 'removed' ? (
                        <span className="text-zinc-400 italic">-</span>
                      ) : (
                        <CollapsibleValue value={line.after} label="after" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
