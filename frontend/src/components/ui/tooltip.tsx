import { forwardRef, type ReactNode } from 'react'
import clsx from 'clsx'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipSize = 'sm' | 'md' | 'lg'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: TooltipPlacement
  size?: TooltipSize
  className?: string
  delay?: number
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<TooltipPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
}

const sizeClasses: Record<TooltipSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, placement = 'top', size = 'md', className, delay = 200 }, ref) => {
    return (
      <div ref={ref} className={clsx('group relative inline-flex', className)}>
        {children}
        <div
          className={clsx(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg',
            'bg-zinc-900 text-white shadow-lg',
            'opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100',
            'dark:bg-zinc-700',
            placementClasses[placement],
            sizeClasses[size]
          )}
          style={{ transitionDelay: `${delay}ms` }}
        >
          {content}
          <div
            className={clsx(
              'absolute size-0 border-4 border-zinc-900 dark:border-zinc-700',
              arrowClasses[placement]
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  }
)
