/**
 * ChatWelcome Component - Welcome message with suggested questions
 * Issue #96: Context-aware suggested questions
 */
import { Icon } from '@/components/ui/Icon'
import { useSuggestions } from '../hooks/useSuggestions'
import { SuggestionChips } from './SuggestionChips'

export interface ChatWelcomeProps {
  onSuggestionSelect?: (question: string) => void
  businessId?: string
  disabled?: boolean
}

export function ChatWelcome({ onSuggestionSelect, businessId, disabled }: ChatWelcomeProps) {
  const { suggestions, loading } = useSuggestions({ businessId })

  const handleSuggestionSelect = (question: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(question)
    }
  }

  return (
    <div className="mb-16 text-center">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-900 dark:bg-zinc-800 dark:text-white">
        <Icon name="lightbulb" size={32} />
      </div>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Launch your vision.
      </h1>
      <p className="mx-auto mb-8 max-w-md leading-relaxed text-slate-500 dark:text-slate-400">
        I'm your strategic partner from ideation to launch. What are we building today?
      </p>

      {/* Suggested Questions */}
      <div className="mx-auto max-w-2xl">
        <p className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">Try asking:</p>
        <SuggestionChips
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          loading={loading}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
