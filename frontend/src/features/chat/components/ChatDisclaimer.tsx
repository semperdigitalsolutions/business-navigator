/**
 * Chat Disclaimer Component
 *
 * Displays a persistent disclaimer below the chat input to remind users
 * that AI responses are for informational purposes only.
 *
 * Features:
 * - Can be collapsed/dismissed by user
 * - Returns on new session (uses sessionStorage)
 * - Subtle, muted styling that doesn't distract from the conversation
 */
import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'

const DISCLAIMER_DISMISSED_KEY = 'chat_disclaimer_dismissed'

interface ChatDisclaimerProps {
  /** Optional additional CSS classes */
  className?: string
  /** Whether to show the expanded version or just the compact reminder */
  variant?: 'full' | 'compact'
}

// Helper function to read sessionStorage safely (works during SSR)
function getInitialDismissedState(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(DISCLAIMER_DISMISSED_KEY) === 'true'
}

export function ChatDisclaimer({ className = '', variant = 'full' }: ChatDisclaimerProps) {
  const [isDismissed, setIsDismissed] = useState(getInitialDismissedState)
  const [isExpanded, setIsExpanded] = useState(true)

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true')
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Compact variant - always shows minimal text
  if (variant === 'compact') {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
          AI responses are for informational purposes only. Consult professionals for advice.
        </p>
      </div>
    )
  }

  // Full variant - dismissible with expand/collapse
  if (isDismissed) {
    // Show minimal reminder even after dismissal
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className={`group flex w-full items-center justify-center gap-1.5 py-2 text-[10px] font-medium tracking-wide text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 ${className}`}
      >
        <Icon
          name="info"
          size={12}
          className="opacity-60 transition-opacity group-hover:opacity-100"
        />
        <span>View AI disclaimer</span>
      </button>
    )
  }

  return (
    <div
      className={`mx-auto max-w-3xl rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-zinc-700/50 dark:bg-zinc-800/30 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Icon
            name="info"
            size={16}
            className="mt-0.5 flex-shrink-0 text-slate-400 dark:text-slate-500"
          />
          <div className="space-y-1">
            <button
              onClick={handleToggleExpand}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <span>AI Disclaimer</span>
              <Icon
                name={isExpanded ? 'expand_less' : 'expand_more'}
                size={14}
                className="transition-transform"
              />
            </button>
            {isExpanded && (
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                AI responses are for{' '}
                <span className="font-medium">informational purposes only</span> and do not
                constitute legal, tax, financial, or investment advice. Every business situation is
                unique. Please <span className="font-medium">consult licensed professionals</span>{' '}
                (attorneys, CPAs, financial advisors) for advice specific to your circumstances.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-zinc-700 dark:hover:text-slate-400"
          aria-label="Dismiss disclaimer"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  )
}

/**
 * Inline disclaimer for use within message bubbles or other compact spaces
 */
export function InlineDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p
      className={`mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400 dark:border-zinc-700 dark:text-slate-500 ${className}`}
    >
      This information is for educational purposes only. Consult licensed professionals for advice
      specific to your situation.
    </p>
  )
}
