import { KeyboardEvent, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'

export interface SuggestedAction {
  label: string
  icon: string
  variant?: 'primary' | 'default'
}

export interface ChatInputProps {
  suggestedActions?: SuggestedAction[]
  onSend: (message: string) => void
  onActionClick?: (action: SuggestedAction) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({
  suggestedActions = [],
  onSend,
  onActionClick,
  placeholder = 'Type your next request...',
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-shrink-0 p-6">
      <div className="mx-auto max-w-3xl">
        {suggestedActions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => onActionClick?.(action)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  action.variant === 'primary'
                    ? 'border-sky-100 bg-sky-50 text-sky-700 hover:border-sky-200 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-400'
                }`}
              >
                <Icon name={action.icon} size={16} />
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-primary-500/10 opacity-0 blur-xl transition-opacity group-focus-within:opacity-40" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-catalyst transition-all focus-within:border-primary-500/40 focus-within:ring-4 focus-within:ring-primary-500/5 dark:border-zinc-700 dark:bg-zinc-800">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[100px] w-full resize-none border-none bg-transparent p-5 pb-16 text-[15px] text-slate-800 placeholder-slate-400 focus:ring-0 dark:text-white dark:placeholder-slate-500"
            />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-zinc-700">
              <div className="flex items-center gap-1">
                <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-zinc-700">
                  <Icon name="attach_file" size={20} />
                </button>
                <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-zinc-700">
                  <Icon name="mic" size={20} />
                </button>
                <div className="mx-2 h-4 w-px bg-slate-200 dark:bg-zinc-600" />
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-500 transition-all hover:text-slate-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-slate-400">
                  <Icon name="auto_awesome" size={16} />
                  Web Search
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Icon name="arrow_upward" size={20} />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] font-medium tracking-wide text-slate-400">
          BUSINESS NAVIGATOR AI - ACCURACY SUBJECT TO VERIFICATION
        </p>
      </div>
    </div>
  )
}
