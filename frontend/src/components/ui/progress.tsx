import { forwardRef } from 'react'
import { cn } from '@/utils/classnames'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressColor = 'primary' | 'success' | 'warning' | 'error' | 'accent'

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  value: number
  max?: number
  size?: ProgressSize
  color?: ProgressColor
  showValue?: boolean
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const colorClasses: Record<ProgressColor, string> = {
  primary: 'bg-blue-600 dark:bg-blue-500',
  success: 'bg-green-600 dark:bg-green-500',
  warning: 'bg-amber-500 dark:bg-amber-400',
  error: 'bg-red-600 dark:bg-red-500',
  accent: 'bg-purple-600 dark:bg-purple-500',
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    { value, max = 100, size = 'md', color = 'primary', showValue = false, className, ...props },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            'w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div className="mt-1 text-right text-sm text-zinc-500 dark:text-zinc-400">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'
