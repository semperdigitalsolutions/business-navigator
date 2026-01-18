/**
 * HeroTaskSkeleton Component
 * Loading placeholder for hero task card
 */
import { Skeleton } from './Skeleton'

export function HeroTaskSkeleton() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton width={100} height={16} />
        </div>
        <Skeleton width={80} height={24} className="rounded-full" />
      </div>

      {/* Task Details */}
      <div className="mb-6">
        <Skeleton width="60%" height={32} className="mb-2" />
        <Skeleton width="100%" height={20} className="mb-2" />
        <Skeleton width="80%" height={20} />
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton width={120} height={16} />
        <Skeleton width={100} height={16} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Skeleton width={180} height={40} className="rounded-lg" />
        <Skeleton width={120} height={40} className="rounded-lg" />
        <Skeleton width={120} height={40} className="rounded-lg" />
      </div>
    </div>
  )
}
