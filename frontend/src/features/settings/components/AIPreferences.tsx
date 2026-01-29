import { useState } from 'react'
import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'

export type CommunicationStyle = 'strategic' | 'action' | 'educational'

export interface AIPreferencesData {
  communicationStyle: CommunicationStyle
  proactiveSuggestions: boolean
}

export interface AIPreferencesProps {
  initialData: AIPreferencesData
  onChange?: (data: AIPreferencesData) => void
}

const STYLE_OPTIONS = [
  {
    value: 'strategic' as const,
    label: 'Strategic',
    icon: 'psychology',
    description: 'High-level guidance and planning',
  },
  {
    value: 'action' as const,
    label: 'Action',
    icon: 'bolt',
    description: 'Direct, actionable steps',
  },
  {
    value: 'educational' as const,
    label: 'Educational',
    icon: 'school',
    description: 'Detailed explanations',
  },
]

export function AIPreferences({ initialData, onChange }: AIPreferencesProps) {
  const [data, setData] = useState(initialData)

  const handleStyleChange = (style: CommunicationStyle) => {
    const newData = { ...data, communicationStyle: style }
    setData(newData)
    onChange?.(newData)
  }

  const handleToggle = () => {
    const newData = { ...data, proactiveSuggestions: !data.proactiveSuggestions }
    setData(newData)
    onChange?.(newData)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
        AI Consultant Preferences
      </h3>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Customize how the Business Navigator assists you.
      </p>

      {/* Communication Style */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Communication Style
        </label>
        <div className="flex flex-wrap gap-3">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStyleChange(option.value)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                data.communicationStyle === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-600 dark:text-slate-400 dark:hover:bg-zinc-700'
              )}
            >
              <Icon name={option.icon} size={18} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proactive Suggestions Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-zinc-600">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Proactive Suggestions</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Allow AI to suggest tasks based on business state
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            data.proactiveSuggestions ? 'bg-primary-600' : 'bg-slate-200 dark:bg-zinc-600'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              data.proactiveSuggestions ? 'left-[22px]' : 'left-0.5'
            )}
          />
        </button>
      </div>
    </div>
  )
}
