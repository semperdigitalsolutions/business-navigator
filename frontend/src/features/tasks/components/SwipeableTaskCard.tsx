/**
 * SwipeableTaskCard Component
 * Issue #87: Swipe-to-complete gesture for mobile
 *
 * Wraps TaskCard with swipe gesture support for completing tasks
 */
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { TaskCard } from './TaskCard'
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/utils/classnames'
import type { TaskListItem } from '@shared/types'

interface SwipeableTaskCardProps {
  task: TaskListItem
  onComplete?: (taskId: string) => void
  className?: string
}

export function SwipeableTaskCard({ task, onComplete, className }: SwipeableTaskCardProps) {
  // Only enable swipe for tasks that can be completed
  const canComplete = task.status === 'available' || task.status === 'in_progress'

  const [swipeState, swipeHandlers] = useSwipeGesture({
    threshold: 100,
    enabled: canComplete,
    direction: 'right',
    onSwipeComplete: () => {
      onComplete?.(task.id)
    },
  })

  const { offset, isSwiping, progress } = swipeState

  // Background color transitions from gray to green as progress increases
  const bgOpacity = Math.min(progress * 0.8, 0.8)
  const checkScale = 0.5 + progress * 0.5
  const checkOpacity = progress

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Swipe reveal background */}
      {canComplete && (
        <div
          className="absolute inset-0 flex items-center justify-start pl-6"
          style={{
            backgroundColor: `rgba(34, 197, 94, ${bgOpacity})`,
          }}
        >
          <div
            className="flex items-center gap-2 text-white"
            style={{
              opacity: checkOpacity,
              transform: `scale(${checkScale})`,
            }}
          >
            <CheckIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>
      )}

      {/* Task card with swipe transform */}
      <div
        {...swipeHandlers}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        className="relative bg-white dark:bg-zinc-800"
      >
        <TaskCard task={task} />

        {/* Swipe hint indicator (subtle) */}
        {canComplete && !isSwiping && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-30 sm:hidden">
            <svg
              className="h-4 w-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
