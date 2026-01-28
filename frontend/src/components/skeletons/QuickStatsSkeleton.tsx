/**
 * QuickStatsSkeleton Component
 * Loading placeholder for quick stats section
 */
import { Skeleton } from './Skeleton'

interface QuickStatsSkeletonProps {
  statCount?: number
}

export function QuickStatsSkeleton({ statCount = 3 }: QuickStatsSkeletonProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
      {/* Section header */}
      <Skeleton width={120} height={24} className="mb-4" />

      {/* Stats items */}
      <div className="space-y-4">
        {Array.from({ length: statCount }).map((_, index) => (
          <div key={index}>
            {/* Stat label */}
            <Skeleton width={80} height={16} className="mb-2" />
            {/* Stat value */}
            <Skeleton width={60} height={32} />
          </div>
        ))}
      </div>
    </div>
  )
}
