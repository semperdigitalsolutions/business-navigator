/**
 * useSuggestions Hook - Fetch and manage suggested questions
 * Issue #96: Context-aware suggested questions
 */
import { useCallback, useEffect, useState } from 'react'
import { chatApi, type SuggestedQuestion } from '../api/chat.api'

interface UseSuggestionsOptions {
  businessId?: string
  autoFetch?: boolean
}

interface UseSuggestionsReturn {
  suggestions: SuggestedQuestion[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSuggestions(options: UseSuggestionsOptions = {}): UseSuggestionsReturn {
  const { businessId, autoFetch = true } = options
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await chatApi.getSuggestions(businessId)

      if (response.success && response.data) {
        setSuggestions(response.data.suggestions)
      } else {
        setError(response.error || 'Failed to fetch suggestions')
        setSuggestions([])
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Failed to fetch suggestions')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [businessId])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSuggestions()
    }
  }, [autoFetch, fetchSuggestions])

  return {
    suggestions,
    loading,
    error,
    refetch: fetchSuggestions,
  }
}
