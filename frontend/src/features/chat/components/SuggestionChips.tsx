/**
 * SuggestionChips Component - Display clickable suggested questions
 * Issue #96: Context-aware suggested questions
 */
import { type SuggestedQuestion } from '../api/chat.api'

export interface SuggestionChipsProps {
  suggestions: SuggestedQuestion[]
  onSelect: (question: string) => void
  loading?: boolean
  disabled?: boolean
}

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  legal: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
  financial: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
  tasks: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
  general: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200',
}

// SVG path data for each category icon
const iconPaths: Record<string, string> = {
  legal:
    'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  financial:
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  tasks: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  general:
    'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
}

export function SuggestionChips({
  suggestions,
  onSelect,
  loading = false,
  disabled = false,
}: SuggestionChipsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-48 animate-pulse rounded-full bg-slate-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.text)}
          disabled={disabled}
          className={`
            inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium
            transition-all duration-200
            ${categoryColors[suggestion.category] || categoryColors.general}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            dark:bg-opacity-20 dark:hover:bg-opacity-30
          `}
        >
          <CategoryIcon category={suggestion.category} />
          <span className="max-w-xs truncate">{suggestion.text}</span>
        </button>
      ))}
    </div>
  )
}

// Simple icon component based on category
function CategoryIcon({ category }: { category: string }) {
  const pathData = iconPaths[category] || iconPaths.general

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={pathData} />
    </svg>
  )
}
