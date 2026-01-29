import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'
import { ReactNode } from 'react'

export interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: ReactNode
  userName?: string
}

export function ChatMessage({ role, content, userName = 'You' }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className="border-b border-slate-100 px-4 py-8 last:border-0 dark:border-zinc-800">
      <div className="flex items-start gap-6">
        {isUser ? (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 dark:border-zinc-700 dark:bg-zinc-800">
            {userName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-glow">
            <Icon name="smart_toy" size={16} />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div
            className={cn(
              'text-xs font-bold uppercase tracking-widest',
              isUser ? 'text-slate-400' : 'text-primary-600 dark:text-primary-400'
            )}
          >
            {isUser ? 'You' : 'Business Navigator'}
          </div>
          <div
            className={cn(
              'space-y-4 text-[15px] leading-relaxed',
              isUser
                ? 'font-medium text-slate-800 dark:text-slate-200'
                : 'text-slate-700 dark:text-slate-300'
            )}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}
