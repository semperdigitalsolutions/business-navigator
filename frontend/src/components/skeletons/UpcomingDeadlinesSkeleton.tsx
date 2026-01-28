/**
 * UpcomingDeadlinesSkeleton Component
 * Loading placeholder for upcoming deadlines widget
 */
import { Skeleton } from './Skeleton'

export function UpcomingDeadlinesSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton width={20} height={20} variant="circular" />
          <Skeleton width={150} height={24} />
        </div>
      </div>

      {/* Deadline items */}
      <div className="p-6 pt-0 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-lg p-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Urgency dot */}
              <Skeleton width={10} height={10} variant="circular" />

              <div className="flex-1 space-y-2">
                {/* Title */}
                <Skeleton width="70%" height={16} />
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Skeleton width={14} height={14} />
                  <Skeleton width={60} height={12} />
                </div>
              </div>
            </div>

            {/* Time remaining badge */}
            <Skeleton width={80} height={24} />
          </div>
        ))}
      </div>
    </div>
  )
}
