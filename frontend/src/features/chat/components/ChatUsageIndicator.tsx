/**
 * ChatUsageIndicator - Displays remaining message count
 * Shows a subtle indicator of messages remaining today
 */
import { useChatUsageStore, getTimeUntilReset } from '../hooks/useChatUsageStore'

export interface ChatUsageIndicatorProps {
  /** Compact mode shows only the count */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

export function ChatUsageIndicator({ compact = false, className = '' }: ChatUsageIndicatorProps) {
  const { remaining, messagesLimit, resetsAt, limitReached } = useChatUsageStore()

  // Calculate usage percentage for visual indicator
  const usagePercent = Math.round(((messagesLimit - remaining) / messagesLimit) * 100)
  const timeUntilReset = getTimeUntilReset(resetsAt)

  // Don't show if no limit is set (unlimited users)
  if (messagesLimit === 0) return null

  // Determine styling based on usage level
  const getColorClass = () => {
    if (limitReached || remaining === 0) return 'text-red-500 dark:text-red-400'
    if (remaining <= 5) return 'text-amber-500 dark:text-amber-400'
    return 'text-slate-500 dark:text-slate-400'
  }

  const getBgClass = () => {
    if (limitReached || remaining === 0) return 'bg-red-50 dark:bg-red-900/20'
    if (remaining <= 5) return 'bg-amber-50 dark:bg-amber-900/20'
    return 'bg-slate-50 dark:bg-slate-800/50'
  }

  if (compact) {
    return (
      <span className={`text-xs font-medium ${getColorClass()} ${className}`}>
        {remaining}/{messagesLimit}
      </span>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${getBgClass()} ${className}`}
      title={timeUntilReset ? `Resets in ${timeUntilReset}` : 'Daily message limit'}
    >
      {/* Progress indicator dot */}
      <div className="relative h-2 w-2">
        <div
          className={`absolute inset-0 rounded-full ${
            limitReached ? 'bg-red-400' : remaining <= 5 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
        />
        {limitReached && (
          <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
        )}
      </div>

      {/* Message count */}
      <span className={`text-xs font-medium ${getColorClass()}`}>
        {limitReached ? (
          <>
            Limit reached
            {timeUntilReset && <span className="ml-1 opacity-75">({timeUntilReset})</span>}
          </>
        ) : (
          <>
            {remaining} message{remaining !== 1 ? 's' : ''} left today
          </>
        )}
      </span>

      {/* Visual progress bar (optional) */}
      {!limitReached && remaining <= 10 && (
        <div className="ml-1 h-1 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full transition-all duration-300 ${
              remaining <= 5 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${100 - usagePercent}%` }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Minimal usage indicator for tight spaces (e.g., input area)
 */
export function ChatUsageMinimal({ className = '' }: { className?: string }) {
  const { remaining, messagesLimit, limitReached } = useChatUsageStore()

  if (messagesLimit === 0) return null

  const getColorClass = () => {
    if (limitReached || remaining === 0) return 'text-red-500'
    if (remaining <= 5) return 'text-amber-500'
    return 'text-slate-400'
  }

  return (
    <span className={`text-[10px] font-medium ${getColorClass()} ${className}`}>
      {remaining}/{messagesLimit} messages
    </span>
  )
}
