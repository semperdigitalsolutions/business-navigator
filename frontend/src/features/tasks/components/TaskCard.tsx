/**
 * TaskCard Component
 * Issue #66: Task states - available, in_progress, completed, locked, skipped
 *
 * State styling:
 * - available: blue border, clickable
 * - in_progress: blue fill, clickable
 * - completed: green check, subtle style
 * - locked: gray with lock icon, not clickable
 * - skipped: strikethrough text
 */
import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { cn } from '@/utils/classnames'
import type { TaskListItem, TaskListStatus } from '@shared/types'

interface TaskCardProps {
  task: TaskListItem
  className?: string
}

interface StatusConfig {
  icon: React.ReactNode
  wrapperClass: string
  titleClass: string
  descClass: string
  isClickable: boolean
}

const STATUS_CONFIGS: Record<TaskListStatus, Omit<StatusConfig, 'icon'> & { iconType: string }> = {
  locked: {
    iconType: 'lock',
    wrapperClass: 'bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed',
    titleClass: 'text-zinc-400 dark:text-zinc-500',
    descClass: 'text-zinc-400 dark:text-zinc-500',
    isClickable: false,
  },
  available: {
    iconType: 'play',
    wrapperClass:
      'border-l-4 border-l-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer',
    titleClass: 'text-zinc-900 dark:text-zinc-100',
    descClass: 'text-zinc-600 dark:text-zinc-400',
    isClickable: true,
  },
  in_progress: {
    iconType: 'clock',
    wrapperClass:
      'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer',
    titleClass: 'text-zinc-900 dark:text-zinc-100',
    descClass: 'text-zinc-600 dark:text-zinc-400',
    isClickable: true,
  },
  completed: {
    iconType: 'check-solid',
    wrapperClass:
      'bg-green-50/50 dark:bg-green-900/20 hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer',
    titleClass: 'text-zinc-700 dark:text-zinc-300',
    descClass: 'text-zinc-500 dark:text-zinc-500',
    isClickable: true,
  },
  skipped: {
    iconType: 'check',
    wrapperClass: 'bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer',
    titleClass: 'text-zinc-400 dark:text-zinc-500 line-through',
    descClass: 'text-zinc-400 dark:text-zinc-600',
    isClickable: true,
  },
}

function getStatusIcon(iconType: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    lock: <LockClosedIcon className="h-5 w-5 text-zinc-400" />,
    play: <PlayCircleIcon className="h-5 w-5 text-blue-500" />,
    clock: <ClockIcon className="h-5 w-5 text-blue-600" />,
    'check-solid': <CheckCircleSolid className="h-5 w-5 text-green-500" />,
    check: <CheckCircleIcon className="h-5 w-5 text-zinc-400" />,
  }
  return iconMap[iconType] || <PlayCircleIcon className="h-5 w-5 text-zinc-400" />
}

function getStatusConfig(status: TaskListStatus): StatusConfig {
  const config = STATUS_CONFIGS[status]
  return { ...config, icon: getStatusIcon(config.iconType) }
}

function TaskTypeIcon({ icon }: { icon?: string }) {
  if (!icon) return null
  return <span className="text-lg">{icon}</span>
}

export function TaskCard({ task, className }: TaskCardProps) {
  const config = getStatusConfig(task.status)

  const cardContent = (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 transition-colors',
        config.wrapperClass,
        className
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">{config.icon}</div>

      {/* Task Icon (if provided) */}
      {task.icon && (
        <div className="flex-shrink-0">
          <TaskTypeIcon icon={task.icon} />
        </div>
      )}

      {/* Task Info */}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', config.titleClass)}>{task.title}</p>
        {task.description && (
          <p className={cn('mt-0.5 truncate text-xs', config.descClass)}>{task.description}</p>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {/* Estimated Time */}
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{task.estimatedTime}</span>

        {/* Arrow for clickable tasks */}
        {config.isClickable && task.status !== 'locked' && (
          <svg
            className="h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  )

  // Locked tasks are not clickable
  if (!config.isClickable) {
    return cardContent
  }

  return <Link to={`/tasks/${task.id}`}>{cardContent}</Link>
}
