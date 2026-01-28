/**
 * GreetingHeaderSkeleton Component
 * Loading placeholder for dashboard greeting header
 */
import { Skeleton } from './Skeleton'

export function GreetingHeaderSkeleton() {
  return (
    <div className="mb-8">
      {/* Main greeting text */}
      <Skeleton width="40%" height={36} className="mb-2" />
      {/* Subtitle text */}
      <Skeleton width="30%" height={20} />
    </div>
  )
}
