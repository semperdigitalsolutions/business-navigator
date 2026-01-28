/**
 * PullToRefresh Component
 * Issue #53: Pull-to-refresh wrapper for mobile dashboard
 *
 * Wraps content and provides visual feedback during pull-to-refresh gesture
 */
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/utils/classnames'
import { usePullToRefresh, type PullToRefreshOptions } from '@/hooks/use-pull-to-refresh'

export interface PullToRefreshProps extends Omit<PullToRefreshOptions, 'onRefresh'> {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
}

interface RefreshIndicatorProps {
  progress: number
  isRefreshing: boolean
  pullDistance: number
}

function RefreshIndicator({ progress, isRefreshing, pullDistance }: RefreshIndicatorProps) {
  const rotation = isRefreshing ? 0 : progress * 180
  const opacity = Math.min(progress * 1.5, 1)

  return (
    <div
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-10 transition-transform duration-200',
        'flex items-center justify-center'
      )}
      style={{
        top: Math.max(pullDistance - 40, 8),
        opacity,
      }}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          'bg-white dark:bg-zinc-800 shadow-lg',
          'border border-zinc-200 dark:border-zinc-700'
        )}
      >
        {isRefreshing ? (
          <SpinnerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
        ) : (
          <ArrowIcon
            className={cn(
              'h-5 w-5 transition-transform duration-150',
              progress >= 1
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-zinc-400 dark:text-zinc-500'
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>
    </div>
  )
}

function ArrowIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(
  ({ children, onRefresh, enabled = true, threshold, maxPull, resistance, className }, ref) => {
    const { state, handlers, containerRef } = usePullToRefresh({
      onRefresh,
      enabled,
      threshold,
      maxPull,
      resistance,
    })

    const { pullDistance, isPulling, isRefreshing, progress } = state
    const showIndicator = (isPulling || isRefreshing) && pullDistance > 0

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn('relative h-full overflow-y-auto overscroll-none', className)}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
      >
        {showIndicator && (
          <RefreshIndicator
            progress={progress}
            isRefreshing={isRefreshing}
            pullDistance={pullDistance}
          />
        )}
        <div
          className={cn('transition-transform duration-200', !isPulling && 'duration-300')}
          style={{
            transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)

PullToRefresh.displayName = 'PullToRefresh'
