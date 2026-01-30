/**
 * Audit Log Filters Component
 * Filter bar for the audit log page with date range, admin, actions, and resource types
 */
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Select } from '@/components/catalyst-ui-kit/typescript/select'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Badge } from '@/components/catalyst-ui-kit/typescript/badge'
import { cn } from '@/utils/classnames'
import { useAuditLogStore } from '../hooks/useAuditLogStore'
import type { AdminUser, AuditAction, AuditResourceType } from '../types/audit-log.types'

const ACTIONS: { value: AuditAction; label: string; color: 'green' | 'yellow' | 'red' }[] = [
  { value: 'create', label: 'Create', color: 'green' },
  { value: 'update', label: 'Update', color: 'yellow' },
  { value: 'delete', label: 'Delete', color: 'red' },
]

const RESOURCE_TYPES: { value: AuditResourceType; label: string }[] = [
  { value: 'model', label: 'Model' },
  { value: 'tier', label: 'Tier' },
  { value: 'api_key', label: 'API Key' },
  { value: 'setting', label: 'Setting' },
]

interface AuditLogFiltersProps {
  adminUsers: AdminUser[]
  onExport: () => void
  isExporting: boolean
}

export function AuditLogFilters({ adminUsers, onExport, isExporting }: AuditLogFiltersProps) {
  const { filters, setFilters, toggleAction, toggleResourceType, resetFilters } = useAuditLogStore()

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Date Range */}
        <Field>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => setFilters({ startDate: e.target.value || undefined })}
          />
        </Field>

        <Field>
          <Label>End Date</Label>
          <Input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => setFilters({ endDate: e.target.value || undefined })}
          />
        </Field>

        {/* Admin User Dropdown */}
        <Field>
          <Label>Admin User</Label>
          <Select
            value={filters.adminId ?? ''}
            onChange={(e) => setFilters({ adminId: e.target.value || undefined })}
          >
            <option value="">All Admins</option>
            {adminUsers.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.email}
              </option>
            ))}
          </Select>
        </Field>

        {/* Resource ID Search */}
        <Field>
          <Label>Resource ID</Label>
          <Input
            type="text"
            placeholder="Search by resource ID..."
            value={filters.resourceId ?? ''}
            onChange={(e) => setFilters({ resourceId: e.target.value || undefined })}
          />
        </Field>
      </div>

      {/* Action Type Multi-select */}
      <div className="mb-4">
        <Label className="block mb-2">Action Types</Label>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => {
            const isSelected = filters.actions?.includes(action.value)
            return (
              <button
                key={action.value}
                onClick={() => toggleAction(action.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-transparent'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                )}
              >
                <Badge color={isSelected ? action.color : 'zinc'}>{action.label}</Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* Resource Type Multi-select */}
      <div className="mb-4">
        <Label className="block mb-2">Resource Types</Label>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map((type) => {
            const isSelected = filters.resourceTypes?.includes(type.value)
            return (
              <button
                key={type.value}
                onClick={() => toggleResourceType(type.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                )}
              >
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Button plain onClick={resetFilters}>
          Reset Filters
        </Button>
        <Button color="indigo" onClick={onExport} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </div>
    </div>
  )
}
