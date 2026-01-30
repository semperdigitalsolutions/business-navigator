/**
 * TaskLinkChip Component
 * Issue #103: Clickable task link chip for AI message navigation
 *
 * Renders task links as inline clickable chips that navigate to the task detail page.
 */
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'

export interface TaskLinkChipProps {
  /** Task ID (UUID) */
  taskId: string
  /** Task title to display */
  taskTitle: string
  /** Additional CSS classes */
  className?: string
}

/**
 * TaskLinkChip - Inline clickable chip for navigating to tasks from chat
 *
 * Styled as a subtle, inline button that fits within message text.
 * Uses the task_alt Material icon to indicate it's a task reference.
 */
export function TaskLinkChip({ taskId, taskTitle, className }: TaskLinkChipProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/tasks/${taskId}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        // Base styles - inline chip appearance
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md',
        // Colors - subtle but noticeable
        'bg-primary-50 text-primary-700 hover:bg-primary-100',
        'dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
        // Border for definition
        'border border-primary-200 dark:border-primary-700/50',
        // Interactive feedback
        'transition-colors duration-150 cursor-pointer',
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
        'dark:focus:ring-offset-gray-800',
        // Text styling
        'text-sm font-medium whitespace-nowrap',
        className
      )}
      title={`Go to task: ${taskTitle}`}
      aria-label={`Navigate to task: ${taskTitle}`}
    >
      <Icon name="task_alt" size={16} className="flex-shrink-0" />
      <span className="truncate max-w-[200px]">{taskTitle}</span>
      <Icon name="arrow_forward" size={14} className="flex-shrink-0 opacity-60" />
    </button>
  )
}
