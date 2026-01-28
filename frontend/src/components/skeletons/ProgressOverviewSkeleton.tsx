/**
 * ProgressOverviewSkeleton Component
 * Loading placeholder for progress overview with phase bars
 * Matches the visual structure of ProgressOverview component
 */
import { Skeleton } from './Skeleton'

interface ProgressOverviewSkeletonProps {
  phaseCount?: number
}

export function ProgressOverviewSkeleton({ phaseCount = 4 }: ProgressOverviewSkeletonProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          {/* Title */}
          <Skeleton width={120} height={24} />
          {/* Progress badge */}
          <Skeleton width={50} height={24} className="rounded-full" />
        </div>
      </div>

      {/* Card content with phase bars */}
      <div className="px-6 pb-6 space-y-4">
        {Array.from({ length: phaseCount }).map((_, index) => (
          <div key={index} className="space-y-2">
            {/* Phase label and count */}
            <div className="flex items-center justify-between">
              <Skeleton width={100} height={16} />
              <Skeleton width={30} height={16} />
            </div>
            {/* Progress bar */}
            <Skeleton width="100%" height={8} className="rounded-full" />
          </div>
        ))}

        {/* View all link */}
        <Skeleton width={100} height={16} className="mt-2" />
      </div>
    </div>
  )
}
