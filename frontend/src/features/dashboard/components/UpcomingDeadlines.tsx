/**
 * UpcomingDeadlines Component
 * Issue #49: Display upcoming deadlines section on dashboard
 *
 * Shows tasks with due dates, sorted by urgency
 * Uses DeadlineCard for individual deadline rendering
 */
import { useMemo } from 'react'
import { DeadlineCard, type DeadlineItem } from './DeadlineCard'
import type { UserTask } from '@shared/types'
import { cn } from '@/utils/classnames'

interface UpcomingDeadlinesProps {
  /** Tasks to extract deadlines from */
  tasks: UserTask[]
  /** Additional CSS classes */
  className?: string
  /** Maximum number of deadlines to display */
  maxVisible?: number
}

/**
 * Converts UserTask to DeadlineItem for DeadlineCard compatibility
 */
function taskToDeadline(task: UserTask): DeadlineItem | null {
  if (!task.dueDate) {
    return null
  }

  return {
    id: task.id,
    title: task.title,
    dueDate: new Date(task.dueDate),
    taskId: task.id,
    category: task.category,
  }
}

/**
 * Extracts and transforms tasks with due dates into deadline items
 */
function extractDeadlines(tasks: UserTask[]): DeadlineItem[] {
  return tasks.map(taskToDeadline).filter((deadline): deadline is DeadlineItem => deadline !== null)
}

export function UpcomingDeadlines({ tasks, className, maxVisible = 3 }: UpcomingDeadlinesProps) {
  const deadlines = useMemo(() => extractDeadlines(tasks), [tasks])

  return <DeadlineCard deadlines={deadlines} maxVisible={maxVisible} className={cn(className)} />
}
