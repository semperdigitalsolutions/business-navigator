/**
 * ChecklistItem Component
 * Issue #78: Renders a single step in a task checklist with status icon,
 * title, time estimate, completion date, and expandable details.
 */
import { useState } from 'react'
import { cn } from '@/utils/classnames'

type ChecklistStatus = 'complete' | 'active' | 'locked'

interface ChecklistItemProps {
  /** Step title */
  title: string
  /** Current status of the step */
  status: ChecklistStatus
  /** Estimated time to complete (e.g., "5 min", "15 min") */
  timeEstimate?: string
  /** Date/time the step was completed */
  completedAt?: Date | string | null
  /** Expandable details content rendered below the header */
  children?: React.ReactNode
  /** Callback fired when "Start this step" button is clicked */
  onStart?: () => void
  /** Additional class names for the root element */
  className?: string
}

function formatCompletedDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const TITLE_CLASSES: Record<ChecklistStatus, string> = {
  complete: 'text-zinc-500 line-through dark:text-zinc-400',
  active: 'font-semibold text-zinc-900 dark:text-white',
  locked: 'text-zinc-400 dark:text-zinc-500',
}

const CONTAINER_CLASSES: Record<ChecklistStatus, string> = {
  complete: 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800',
  active: 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800',
  locked: 'border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-700 dark:bg-zinc-800/50',
}

function StatusIcon({ status }: { status: ChecklistStatus }) {
  if (status === 'complete') {
    return <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
  }
  if (status === 'active') {
    return <PlayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
  }
  return <LockIcon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
}

function MetaInfo({
  status,
  timeEstimate,
  completedAt,
}: {
  status: ChecklistStatus
  timeEstimate?: string
  completedAt?: Date | string | null
}) {
  const showCompleted = status === 'complete' && completedAt
  if (!timeEstimate && !showCompleted) return null

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
      {timeEstimate && <span>Est. {timeEstimate}</span>}
      {showCompleted && (
        <span className="text-green-600 dark:text-green-400">
          Completed {formatCompletedDate(completedAt)}
        </span>
      )}
    </div>
  )
}

function StartButton({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onStart()
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
        'bg-blue-600 text-white transition-colors hover:bg-blue-700',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      Start this step
    </button>
  )
}

interface HeaderRowProps {
  title: string
  status: ChecklistStatus
  timeEstimate?: string
  completedAt?: Date | string | null
  onStart?: () => void
  canExpand: boolean
  expanded: boolean
  onToggle: () => void
}

function HeaderRow(props: HeaderRowProps) {
  const { title, status, timeEstimate, completedAt, onStart, canExpand, expanded, onToggle } = props

  return (
    <div
      role={canExpand ? 'button' : undefined}
      tabIndex={canExpand ? 0 : undefined}
      aria-expanded={canExpand ? expanded : undefined}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle()
        }
      }}
      className={cn('flex items-center gap-3 p-4', canExpand && 'cursor-pointer select-none')}
    >
      <div className="flex-shrink-0">
        <StatusIcon status={status} />
      </div>
      <div className="min-w-0 flex-1">
        <span className={cn('block text-sm', TITLE_CLASSES[status])}>{title}</span>
        <MetaInfo status={status} timeEstimate={timeEstimate} completedAt={completedAt} />
      </div>
      {status === 'active' && onStart && (
        <div className="flex-shrink-0">
          <StartButton onStart={onStart} />
        </div>
      )}
      {canExpand && (
        <div className="flex-shrink-0">
          <ChevronIcon
            className={cn(
              'h-5 w-5 text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
              expanded && 'rotate-90'
            )}
          />
        </div>
      )}
    </div>
  )
}

function ExpandedDetails({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
      <div className="pl-9 text-sm text-zinc-600 dark:text-zinc-400">{children}</div>
    </div>
  )
}

export function ChecklistItem({
  title,
  status,
  timeEstimate,
  completedAt,
  children,
  onStart,
  className,
}: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = status !== 'locked' && !!children

  function handleToggle() {
    if (canExpand) setExpanded((prev) => !prev)
  }

  return (
    <div
      className={cn('rounded-lg border transition-colors', CONTAINER_CLASSES[status], className)}
    >
      <HeaderRow
        title={title}
        status={status}
        timeEstimate={timeEstimate}
        completedAt={completedAt}
        onStart={onStart}
        canExpand={canExpand}
        expanded={expanded}
        onToggle={handleToggle}
      />
      {canExpand && expanded && <ExpandedDetails>{children}</ExpandedDetails>}
    </div>
  )
}
