import { type ElementType, forwardRef, type ReactNode } from 'react'
import { cn } from '@/utils/classnames'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: ElementType
  title: string
  description?: string
  action?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'size-8',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'size-12',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'size-16',
    title: 'text-xl',
    description: 'text-base',
  },
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, action, size = 'md', className, ...props }, ref) => {
    const styles = sizeClasses[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          styles.container,
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mb-4 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
            <Icon
              className={cn('text-zinc-400 dark:text-zinc-500', styles.icon)}
              aria-hidden="true"
            />
          </div>
        )}
        <h3 className={cn('font-semibold text-zinc-900 dark:text-white', styles.title)}>{title}</h3>
        {description && (
          <p className={cn('mt-1 text-zinc-500 dark:text-zinc-400', styles.description)}>
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
