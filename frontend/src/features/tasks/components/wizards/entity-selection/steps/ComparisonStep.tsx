/**
 * ComparisonStep Component
 * Issue #76: Side-by-side comparison of entity types
 */
import { CheckIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import { ENTITY_TYPE_LABELS, type EntityType } from '../types'

interface ComparisonStepProps {
  recommendedType: EntityType | null
  onSelect: (entityType: EntityType) => void
}

interface ComparisonRow {
  label: string
  llc: string
  c_corp: string
  s_corp: string
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    label: 'Formation Cost',
    llc: '$50-$500',
    c_corp: '$100-$800',
    s_corp: '$100-$800',
  },
  {
    label: 'Taxation',
    llc: 'Pass-through (flexible)',
    c_corp: 'Double taxation',
    s_corp: 'Pass-through',
  },
  {
    label: 'Liability Protection',
    llc: 'Full protection',
    c_corp: 'Full protection',
    s_corp: 'Full protection',
  },
  {
    label: 'Ownership Structure',
    llc: 'Flexible membership',
    c_corp: 'Shareholders',
    s_corp: 'Limited shareholders',
  },
  {
    label: 'Complexity',
    llc: 'Low',
    c_corp: 'High',
    s_corp: 'Medium',
  },
  {
    label: 'Best For',
    llc: 'Small businesses',
    c_corp: 'VC-backed startups',
    s_corp: 'Profitable small biz',
  },
]

const ENTITY_TYPES: EntityType[] = ['llc', 'c_corp', 's_corp']

interface TableHeaderProps {
  type: EntityType
  isRecommended: boolean
}

function TableHeader({ type, isRecommended }: TableHeaderProps) {
  return (
    <th
      className={cn(
        'px-3 py-3 text-center text-sm font-semibold',
        isRecommended
          ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
          : 'bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-white'
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <span>{ENTITY_TYPE_LABELS[type]}</span>
        {isRecommended && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-200">
            <CheckIcon className="h-3 w-3" />
            Recommended
          </span>
        )}
      </div>
    </th>
  )
}

interface TableCellProps {
  value: string
  isRecommended: boolean
}

function TableCell({ value, isRecommended }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-3 py-3 text-center text-sm',
        isRecommended ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-zinc-800'
      )}
    >
      <span className="text-zinc-700 dark:text-zinc-300">{value}</span>
    </td>
  )
}

interface SelectButtonProps {
  type: EntityType
  isRecommended: boolean
  onSelect: (type: EntityType) => void
}

function SelectButton({ type, isRecommended, onSelect }: SelectButtonProps) {
  return (
    <td
      className={cn(
        'px-3 py-4 text-center',
        isRecommended ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-zinc-800'
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(type)}
        className={cn(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          isRecommended
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
        )}
      >
        Select {ENTITY_TYPE_LABELS[type]}
      </button>
    </td>
  )
}

export function ComparisonStep({ recommendedType, onSelect }: ComparisonStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Compare the key differences between entity types to make an informed decision.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr>
              <th className="bg-zinc-50 px-3 py-3 text-left text-sm font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white">
                Feature
              </th>
              {ENTITY_TYPES.map((type) => (
                <TableHeader key={type} type={type} isRecommended={type === recommendedType} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {COMPARISON_DATA.map((row) => (
              <tr key={row.label}>
                <td className="bg-white px-3 py-3 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white">
                  {row.label}
                </td>
                {ENTITY_TYPES.map((type) => (
                  <TableCell
                    key={type}
                    value={row[type]}
                    isRecommended={type === recommendedType}
                  />
                ))}
              </tr>
            ))}
            {/* Select buttons row */}
            <tr>
              <td className="bg-white px-3 py-4 dark:bg-zinc-800" />
              {ENTITY_TYPES.map((type) => (
                <SelectButton
                  key={type}
                  type={type}
                  isRecommended={type === recommendedType}
                  onSelect={onSelect}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Costs and requirements vary by state. Consult with a legal professional for specific
        guidance.
      </p>
    </div>
  )
}
