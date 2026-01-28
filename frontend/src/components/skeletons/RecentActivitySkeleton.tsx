/**
 * RecentActivitySkeleton Component
 * Loading placeholder for recent activity section
 */
import { Skeleton } from './Skeleton'

interface RecentActivitySkeletonProps {
  itemCount?: number
}

export function RecentActivitySkeleton({ itemCount = 3 }: RecentActivitySkeletonProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
      {/* Section header */}
      <Skeleton width={150} height={24} className="mb-4" />

      {/* Activity items */}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50"
          >
            {/* Activity icon placeholder */}
            <Skeleton variant="circular" width={40} height={40} />

            {/* Activity content */}
            <div className="flex-1 min-w-0">
              <Skeleton width="70%" height={16} className="mb-2" />
              <Skeleton width="40%" height={14} />
            </div>

            {/* Timestamp */}
            <Skeleton width={60} height={14} />
          </div>
        ))}
      </div>
    </div>
  )
}
