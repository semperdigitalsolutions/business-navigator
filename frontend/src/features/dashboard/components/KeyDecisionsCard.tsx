/**
 * KeyDecisionsCard Component
 * Displays user's key business decisions at a glance
 */
import { useState } from 'react'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import type { KeyDecision, KeyDecisions } from '@shared/types'

interface KeyDecisionsCardProps {
  keyDecisions: KeyDecisions | null | undefined
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  building: BuildingOfficeIcon,
  document: DocumentTextIcon,
  map: MapPinIcon,
  tag: TagIcon,
  currency: CurrencyDollarIcon,
  calendar: CalendarDaysIcon,
}

function getStatusStyles(status: KeyDecision['status']): string {
  switch (status) {
    case 'decided':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    case 'needs_attention':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    case 'pending':
    default:
      return 'bg-gray-50 dark:bg-zinc-700/50 border-gray-200 dark:border-zinc-600'
  }
}

function getStatusIcon(status: KeyDecision['status']) {
  if (status === 'decided') {
    return <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
  }
  return <ClockIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
}

function DecisionItem({ decision }: { decision: KeyDecision }) {
  const IconComponent = ICON_MAP[decision.icon || 'document'] || DocumentTextIcon

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusStyles(decision.status)}`}
    >
      <div className="flex-shrink-0">
        <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {decision.label}
        </Text>
        <Text
          className={`text-sm font-semibold truncate ${
            decision.status === 'pending'
              ? 'text-gray-400 dark:text-gray-500 italic'
              : 'text-zinc-950 dark:text-white'
          }`}
        >
          {decision.value}
        </Text>
      </div>
      <div className="flex-shrink-0">{getStatusIcon(decision.status)}</div>
    </div>
  )
}

export function KeyDecisionsCard({ keyDecisions }: KeyDecisionsCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!keyDecisions) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Key Decisions</h3>
        <div className="flex items-center justify-center h-32">
          <Text className="text-gray-500 dark:text-gray-400">Loading decisions...</Text>
        </div>
      </div>
    )
  }

  const { decisions, completedCount, totalCount } = keyDecisions
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Show first 4 decisions when collapsed, all when expanded
  const visibleDecisions = isExpanded ? decisions : decisions.slice(0, 4)
  const hasMoreDecisions = decisions.length > 4

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Key Decisions</h3>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount} of {totalCount} decided
          </Text>
        </div>
        {hasMoreDecisions && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700
                       dark:hover:text-indigo-300 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Show All
                <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 dark:bg-green-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Decisions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleDecisions.map((decision) => (
          <DecisionItem key={decision.id} decision={decision} />
        ))}
      </div>

      {/* Empty state for no decisions */}
      {decisions.length === 0 && (
        <div className="text-center py-8">
          <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <Text className="text-gray-500 dark:text-gray-400">
            Complete onboarding to see your key decisions here.
          </Text>
        </div>
      )}
    </div>
  )
}
