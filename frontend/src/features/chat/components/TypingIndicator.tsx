/**
 * Typing Indicator Component
 * Shows a bouncing dots animation when the AI is generating a response
 */
import { Icon } from '@/components/ui/Icon'

export interface TypingIndicatorProps {
  /** Custom message to display alongside the dots (default: "Navigator is thinking...") */
  message?: string
}

export function TypingIndicator({ message = 'Navigator is thinking...' }: TypingIndicatorProps) {
  return (
    <div className="animate-fade-in border-b border-slate-100 px-4 py-8 dark:border-zinc-800">
      <div className="flex items-start gap-6">
        {/* AI Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-glow">
          <Icon name="smart_toy" size={16} />
        </div>

        <div className="flex-1 space-y-2">
          {/* Label */}
          <div className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Business Navigator
          </div>

          {/* Typing indicator content */}
          <div className="flex items-center gap-3">
            {/* Bouncing dots */}
            <div className="flex items-center gap-1">
              <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="typing-dot animation-delay-150 h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="typing-dot animation-delay-300 h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>

            {/* Message text */}
            <span className="text-sm text-slate-500 dark:text-slate-400">{message}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
