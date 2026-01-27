/**
 * ConfidenceScoreSkeleton Component
 * Loading placeholder for confidence score widget
 */
import { Skeleton } from './Skeleton'

export function ConfidenceScoreSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton width={140} height={20} />
        <Skeleton width={100} height={16} />
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center mb-6">
        <Skeleton variant="circular" width={180} height={180} />
      </div>
    </div>
  )
}
