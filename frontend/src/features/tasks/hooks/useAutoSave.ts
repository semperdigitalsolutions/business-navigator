/**
 * useAutoSave Hook
 * Issue #70: Debounced auto-save for task draft data
 * Saves every 30 seconds when data changes
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { apiClient } from '@/lib/api/client'

interface UseAutoSaveOptions {
  /** Task ID to save draft for */
  taskId: string
  /** Business ID (optional) */
  businessId?: string
  /** Debounce delay in milliseconds (default: 30000ms = 30 seconds) */
  debounceMs?: number
  /** Callback on successful save */
  onSaveSuccess?: (savedAt: Date) => void
  /** Callback on save error */
  onSaveError?: (error: Error) => void
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: 'idle' | 'saving' | 'saved' | 'error'
  /** Last save timestamp */
  lastSavedAt: Date | null
  /** Error message if save failed */
  error: string | null
  /** Trigger an immediate save */
  saveNow: () => Promise<void>
  /** Update draft data (will trigger debounced save) */
  updateDraft: (data: Record<string, unknown>) => void
  /** Current draft data */
  draftData: Record<string, unknown>
  /** Whether there are unsaved changes */
  isDirty: boolean
}

export function useAutoSave({
  taskId,
  businessId,
  debounceMs = 30000,
  onSaveSuccess,
  onSaveError,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [draftData, setDraftData] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Track the last saved data to detect actual changes
  const lastSavedDataRef = useRef<string>('')

  // Debounce the draft data
  const debouncedData = useDebounce(draftData, debounceMs)

  // Save function
  const saveDraft = useCallback(
    async (data: Record<string, unknown>) => {
      if (!taskId || !enabled) return

      // Check if data actually changed
      const dataString = JSON.stringify(data)
      if (dataString === lastSavedDataRef.current) {
        return
      }

      try {
        setStatus('saving')
        setError(null)

        const response = await apiClient.post<{ savedAt: string }>(`/api/tasks/${taskId}/save`, {
          draftData: data,
          businessId,
        })

        if (response.success && response.data) {
          const savedAt = new Date(response.data.savedAt)
          setLastSavedAt(savedAt)
          setStatus('saved')
          setIsDirty(false)
          lastSavedDataRef.current = dataString
          onSaveSuccess?.(savedAt)
        } else {
          throw new Error('Failed to save draft')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save draft'
        setError(errorMessage)
        setStatus('error')
        onSaveError?.(err instanceof Error ? err : new Error(errorMessage))
      }
    },
    [taskId, businessId, enabled, onSaveSuccess, onSaveError]
  )

  // Auto-save when debounced data changes
  useEffect(() => {
    if (!enabled || !isDirty) return

    const dataString = JSON.stringify(debouncedData)
    if (dataString !== lastSavedDataRef.current && Object.keys(debouncedData).length > 0) {
      saveDraft(debouncedData)
    }
  }, [debouncedData, enabled, isDirty, saveDraft])

  // Update draft data
  const updateDraft = useCallback((data: Record<string, unknown>) => {
    setDraftData((prev) => ({ ...prev, ...data }))
    setIsDirty(true)
    setStatus('idle')
  }, [])

  // Manual save function
  const saveNow = useCallback(async () => {
    if (Object.keys(draftData).length > 0) {
      await saveDraft(draftData)
    }
  }, [draftData, saveDraft])

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty && Object.keys(draftData).length > 0) {
        // Fire and forget - we can't await in cleanup
        saveDraft(draftData)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    lastSavedAt,
    error,
    saveNow,
    updateDraft,
    draftData,
    isDirty,
  }
}
