import { forwardRef } from 'react'
import { cn } from '@/utils/classnames'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, className, style, ...props }, ref) => {
    const variantClasses = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-zinc-200 dark:bg-zinc-700',
          variantClasses[variant],
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number
  lastLineWidth?: string
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          style={{
            width: index === lines - 1 ? lastLineWidth : '100%',
          }}
          {...props}
        />
      ))}
    </div>
  )
}

export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function SkeletonAvatar({ size = 'md', className, ...props }: SkeletonAvatarProps) {
  const sizeValue = avatarSizes[size]

  return (
    <Skeleton
      variant="circular"
      width={sizeValue}
      height={sizeValue}
      className={className}
      {...props}
    />
  )
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean
  showTitle?: boolean
  showDescription?: boolean
  showActions?: boolean
}

export function SkeletonCard({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showActions = false,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5',
        'dark:bg-zinc-900 dark:ring-white/10',
        className
      )}
      {...props}
    >
      {showAvatar && (
        <div className="mb-4 flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="25%" height={12} />
          </div>
        </div>
      )}
      {showTitle && <Skeleton variant="text" width="70%" height={20} className="mb-2" />}
      {showDescription && <SkeletonText lines={2} className="mb-4" />}
      {showActions && (
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      )}
    </div>
  )
}
