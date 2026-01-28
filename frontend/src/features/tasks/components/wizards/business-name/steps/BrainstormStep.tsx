/**
 * BrainstormStep Component
 * Issue #88: Step 1 of Business Name wizard - brainstorm name ideas
 */
import { useState } from 'react'
import { PlusIcon, XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import type { BusinessNameData } from '../types'

interface BrainstormStepProps {
  data: BusinessNameData
  onUpdate: (data: Partial<BusinessNameData>) => void
}

const NAME_TIPS = [
  'Keep it short and memorable (2-3 words max)',
  'Make it easy to spell and pronounce',
  'Avoid numbers and hyphens',
  'Consider how it looks as a logo',
  'Check if the .com domain is available',
  'Ensure it reflects your brand values',
]

const NAME_SUGGESTIONS = [
  'Try combining two relevant words',
  'Use alliteration for memorability',
  'Consider your target audience',
  'Think about future expansion',
  'Test it with friends and family',
]

// Validation constants
const MAX_NAME_LENGTH = 100
const MIN_NAME_LENGTH = 2
// Allow letters, numbers, spaces, hyphens, apostrophes, ampersands, periods
const VALID_NAME_PATTERN = /^[a-zA-Z0-9\s\-'&.]+$/

export function BrainstormStep({ data, onUpdate }: BrainstormStepProps) {
  const [newName, setNewName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateName = (name: string): string | null => {
    if (name.length < MIN_NAME_LENGTH) {
      return `Name must be at least ${MIN_NAME_LENGTH} characters`
    }
    if (name.length > MAX_NAME_LENGTH) {
      return `Name must be less than ${MAX_NAME_LENGTH} characters`
    }
    if (!VALID_NAME_PATTERN.test(name)) {
      return 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, ampersands, and periods'
    }
    return null
  }

  const addName = () => {
    const trimmed = newName.trim()
    setValidationError(null)

    if (!trimmed) return

    const error = validateName(trimmed)
    if (error) {
      setValidationError(error)
      return
    }

    if (data.nameIdeas.includes(trimmed)) {
      setValidationError('This name is already in your list')
      return
    }

    onUpdate({ nameIdeas: [...data.nameIdeas, trimmed] })
    setNewName('')
  }

  const removeName = (name: string) => {
    onUpdate({
      nameIdeas: data.nameIdeas.filter((n) => n !== name),
      selectedName: data.selectedName === name ? '' : data.selectedName,
    })
  }

  const selectName = (name: string) => {
    onUpdate({ selectedName: name })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addName()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tips section */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <LightBulbIcon className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Tips for a Great Business Name
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
              {NAME_TIPS.slice(0, 3).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add name input */}
      <div>
        <label
          htmlFor="name-input"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Add a name idea
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="name-input"
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setValidationError(null)
            }}
            onKeyDown={handleKeyDown}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Enter a business name idea..."
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
          />
          <button
            type="button"
            onClick={addName}
            disabled={!newName.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add
          </button>
        </div>
        {validationError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationError}</p>
        )}
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {MAX_NAME_LENGTH - newName.length} characters remaining
        </p>
      </div>

      {/* Name ideas list */}
      {data.nameIdeas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Your name ideas ({data.nameIdeas.length})
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Click a name to select it as your top choice
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.nameIdeas.map((name) => (
              <div
                key={name}
                className={`group inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  data.selectedName === name
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-zinc-300 bg-white hover:border-blue-300 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:border-blue-500'
                }`}
              >
                <button type="button" onClick={() => selectName(name)} className="font-medium">
                  {name}
                </button>
                <button
                  type="button"
                  onClick={() => removeName(name)}
                  className="ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected name highlight */}
      {data.selectedName && (
        <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Your top choice:</p>
          <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-300">
            {data.selectedName}
          </p>
        </div>
      )}

      {/* Suggestions if no names yet */}
      {data.nameIdeas.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-600">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Need inspiration? Try these approaches:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-500 dark:text-zinc-500">
            {NAME_SUGGESTIONS.map((suggestion, i) => (
              <li key={i}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
