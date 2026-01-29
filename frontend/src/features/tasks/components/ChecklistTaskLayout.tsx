/**
 * ChecklistTaskLayout Component
 * Issue #77: Layout for tasks with sequential sub-tasks (checklist items).
 * Shows progress, sequential unlocking, and completion status.
 */
import { cn } from '@/utils/classnames'
import { Progress } from '@/components/ui/progress'
import { ChecklistItem } from './ChecklistItem'
import { TaskNavigation } from './TaskNavigation'

type ChecklistStatus = 'complete' | 'active' | 'locked'

export interface ChecklistItemData {
  /** Unique identifier for the item */
  id: string
  /** Item title */
  title: string
  /** Current status of the item */
  status: ChecklistStatus
  /** Estimated time to complete */
  timeEstimate?: string
  /** Date/time the item was completed */
  completedAt?: Date | string | null
  /** Expandable details content */
  children?: React.ReactNode
}

interface ChecklistTaskLayoutProps {
  /** Task title */
  title: string
  /** Task description */
  description?: string
  /** List of checklist items */
  items: ChecklistItemData[]
  /** Callback when an item's "Start this step" is clicked */
  onItemStart?: (itemId: string) => void
  /** Callback when an item is completed */
  onItemComplete?: (itemId: string) => void
  /** Callback when entire task is completed */
  onComplete?: () => void
  /** Callback for back navigation */
  onBack?: () => void
  /** Whether task completion is in progress */
  isCompleting?: boolean
  /** Additional class names */
  className?: string
}

function getCompletedCount(items: ChecklistItemData[]): number {
  return items.filter((item) => item.status === 'complete').length
}

function computeItemStatus(items: ChecklistItemData[], index: number): ChecklistStatus {
  const item = items[index]
  if (item.status === 'complete') {
    return 'complete'
  }
  if (index === 0) {
    return 'active'
  }
  const prevItem = items[index - 1]
  if (prevItem.status === 'complete') {
    return 'active'
  }
  return 'locked'
}

function findPreviousIncompleteStep(items: ChecklistItemData[], index: number): number | null {
  for (let i = index - 1; i >= 0; i--) {
    if (items[i].status !== 'complete') {
      return i + 1
    }
  }
  return null
}

interface ProgressHeaderProps {
  completedCount: number
  totalCount: number
}

function ProgressHeader({ completedCount, totalCount }: ProgressHeaderProps) {
  const progressValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {completedCount} of {totalCount} complete
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          [{completedCount}/{totalCount} done]
        </span>
      </div>
      <Progress
        value={progressValue}
        max={100}
        size="md"
        color={completedCount === totalCount ? 'success' : 'primary'}
      />
    </div>
  )
}

interface LockedMessageProps {
  stepNumber: number
}

function LockedMessage({ stepNumber }: LockedMessageProps) {
  return (
    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
      Complete step {stepNumber} first
    </p>
  )
}

interface ChecklistItemsListProps {
  items: ChecklistItemData[]
  onItemStart?: (itemId: string) => void
}

function ChecklistItemsList({ items, onItemStart }: ChecklistItemsListProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const effectiveStatus = computeItemStatus(items, index)
        const blockedByStep = findPreviousIncompleteStep(items, index)

        return (
          <div key={item.id}>
            <ChecklistItem
              title={item.title}
              status={effectiveStatus}
              timeEstimate={item.timeEstimate}
              completedAt={item.completedAt}
              onStart={
                effectiveStatus === 'active' && onItemStart ? () => onItemStart(item.id) : undefined
              }
            >
              {item.children}
            </ChecklistItem>
            {effectiveStatus === 'locked' && blockedByStep !== null && (
              <LockedMessage stepNumber={blockedByStep} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ChecklistTaskLayout(props: ChecklistTaskLayoutProps) {
  const {
    title,
    description,
    items,
    onItemStart,
    onItemComplete: _onItemComplete,
    onComplete,
    onBack,
    isCompleting = false,
    className,
  } = props

  const completedCount = getCompletedCount(items)
  const totalCount = items.length
  const allComplete = completedCount === totalCount && totalCount > 0

  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <div className="flex-1 pb-24">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
            {description && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>}
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <ProgressHeader completedCount={completedCount} totalCount={totalCount} />
            <ChecklistItemsList items={items} onItemStart={onItemStart} />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <TaskNavigation
            onBack={onBack}
            onComplete={allComplete ? onComplete : undefined}
            showSave={false}
            showComplete={true}
            isCompleting={isCompleting}
            isCompleted={false}
            completeLabel={
              allComplete ? 'Complete Task' : `${completedCount}/${totalCount} Steps Done`
            }
          />
        </div>
      </div>
    </div>
  )
}
