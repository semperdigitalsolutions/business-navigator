/**
 * KeyDecisionsSkeleton Component
 * Loading placeholder for key decisions widget
 */
import { Skeleton } from './Skeleton'

export function KeyDecisionsSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton width={120} height={24} className="mb-2" />
          <Skeleton width={100} height={16} />
        </div>
        <Skeleton width={80} height={20} />
      </div>

      {/* Progress Bar */}
      <Skeleton width="100%" height={8} className="mb-4 rounded-full" />

      {/* Decisions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-700"
          >
            <Skeleton variant="circular" width={20} height={20} />
            <div className="flex-1">
              <Skeleton width={60} height={12} className="mb-1" />
              <Skeleton width={100} height={16} />
            </div>
            <Skeleton variant="circular" width={16} height={16} />
          </div>
        ))}
      </div>
    </div>
  )
}
