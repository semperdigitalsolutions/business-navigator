/**
 * DeadlineCard Component
 * Issue #48: Urgency colors based on days until deadline
 *
 * Color coding:
 * - Red: < 7 days
 * - Orange: 7-30 days
 * - Yellow: 31-60 days
 * - Gray: > 60 days
 *
 * Max 3 deadlines shown with "View all" option
 */
import { Link } from 'react-router-dom'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/classnames'

export interface DeadlineItem {
  id: string
  title: string
  dueDate: Date
  taskId?: string
  category?: string
}

interface DeadlineCardProps {
  deadlines: DeadlineItem[]
  className?: string
  maxVisible?: number
}

interface UrgencyConfig {
  label: string
  bgClass: string
  textClass: string
  dotClass: string
}

function getDaysUntil(dueDate: Date): number {
  const now = new Date()
  const due = new Date(dueDate)
  // Reset time to start of day for accurate day calculation
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getUrgencyConfig(daysUntil: number): UrgencyConfig {
  if (daysUntil < 0) {
    // Overdue
    return {
      label: 'Overdue',
      bgClass: 'bg-red-100 dark:bg-red-900/30',
      textClass: 'text-red-700 dark:text-red-300',
      dotClass: 'bg-red-500',
    }
  }
  if (daysUntil < 7) {
    return {
      label: 'Urgent',
      bgClass: 'bg-red-100 dark:bg-red-900/30',
      textClass: 'text-red-700 dark:text-red-300',
      dotClass: 'bg-red-500',
    }
  }
  if (daysUntil <= 30) {
    return {
      label: 'Soon',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      textClass: 'text-orange-700 dark:text-orange-300',
      dotClass: 'bg-orange-500',
    }
  }
  if (daysUntil <= 60) {
    return {
      label: 'Upcoming',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-700 dark:text-yellow-300',
      dotClass: 'bg-yellow-500',
    }
  }
  // > 60 days
  return {
    label: 'Later',
    bgClass: 'bg-zinc-100 dark:bg-zinc-800',
    textClass: 'text-zinc-600 dark:text-zinc-400',
    dotClass: 'bg-zinc-400',
  }
}

function formatTimeRemaining(daysUntil: number): string {
  if (daysUntil < 0) {
    const overdueDays = Math.abs(daysUntil)
    return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`
  }
  if (daysUntil === 0) {
    return 'Due today'
  }
  if (daysUntil === 1) {
    return 'Due tomorrow'
  }
  if (daysUntil < 7) {
    return `${daysUntil} days left`
  }
  if (daysUntil < 30) {
    const weeks = Math.floor(daysUntil / 7)
    return weeks === 1 ? '1 week left' : `${weeks} weeks left`
  }
  const months = Math.floor(daysUntil / 30)
  return months === 1 ? '1 month left' : `${months} months left`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

function DeadlineItemRow({ deadline }: { deadline: DeadlineItem }) {
  const daysUntil = getDaysUntil(deadline.dueDate)
  const urgency = getUrgencyConfig(daysUntil)
  const timeRemaining = formatTimeRemaining(daysUntil)

  const content = (
    <div className="flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <div className="flex items-center gap-3">
        {/* Urgency dot */}
        <div className={cn('h-2.5 w-2.5 rounded-full', urgency.dotClass)} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {deadline.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{formatDate(deadline.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Time remaining badge */}
      <div
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          urgency.bgClass,
          urgency.textClass
        )}
      >
        <ClockIcon className="h-3 w-3" />
        <span>{timeRemaining}</span>
      </div>
    </div>
  )

  if (deadline.taskId) {
    return (
      <Link to={`/tasks/${deadline.taskId}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}

export function DeadlineCard({ deadlines, className, maxVisible = 3 }: DeadlineCardProps) {
  // Sort by due date ascending (most urgent first)
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  const visibleDeadlines = sortedDeadlines.slice(0, maxVisible)
  const hasMore = sortedDeadlines.length > maxVisible

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-zinc-500" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1">
        {visibleDeadlines.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">You're all caught up!</p>
          </div>
        ) : (
          <>
            {visibleDeadlines.map((deadline) => (
              <DeadlineItemRow key={deadline.id} deadline={deadline} />
            ))}

            {hasMore && (
              <Link
                to="/deadlines"
                className="mt-2 inline-flex items-center gap-1 pt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all deadlines
                <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
