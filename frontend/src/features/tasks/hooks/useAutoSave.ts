/**
 * useAutoSave Hook
 * Issue #70: Debounced auto-save for task draft data
 * Saves every 30 seconds when data changes
 */
import { useCallback, useEffect, useRef, useState } from 'react'
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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

async function performSave(
  taskId: string,
  data: Record<string, unknown>,
  businessId?: string
): Promise<{ savedAt: Date }> {
  const response = await apiClient.post<{ savedAt: string }>(`/api/tasks/${taskId}/save`, {
    draftData: data,
    businessId,
  })
  if (!response.success || !response.data) throw new Error('Failed to save draft')
  return { savedAt: new Date(response.data.savedAt) }
}

export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const {
    taskId,
    businessId,
    debounceMs = 30000,
    onSaveSuccess,
    onSaveError,
    enabled = true,
  } = options
  const [draftData, setDraftData] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const lastSavedDataRef = useRef<string>('')
  const debouncedData = useDebounce(draftData, debounceMs)

  const saveDraft = useCallback(
    async (data: Record<string, unknown>) => {
      if (!taskId || !enabled) return
      const dataString = JSON.stringify(data)
      if (dataString === lastSavedDataRef.current) return
      setStatus('saving')
      setError(null)
      try {
        const { savedAt } = await performSave(taskId, data, businessId)
        setLastSavedAt(savedAt)
        setStatus('saved')
        setIsDirty(false)
        lastSavedDataRef.current = dataString
        onSaveSuccess?.(savedAt)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save draft'
        setError(errorMessage)
        setStatus('error')
        onSaveError?.(err instanceof Error ? err : new Error(errorMessage))
      }
    },
    [taskId, businessId, enabled, onSaveSuccess, onSaveError]
  )

  useEffect(() => {
    if (!enabled || !isDirty) return
    const dataString = JSON.stringify(debouncedData)
    if (dataString !== lastSavedDataRef.current && Object.keys(debouncedData).length > 0) {
      queueMicrotask(() => saveDraft(debouncedData))
    }
  }, [debouncedData, enabled, isDirty, saveDraft])

  const updateDraft = useCallback((data: Record<string, unknown>) => {
    setDraftData((prev) => ({ ...prev, ...data }))
    setIsDirty(true)
    setStatus('idle')
  }, [])

  const saveNow = useCallback(async () => {
    if (Object.keys(draftData).length > 0) await saveDraft(draftData)
  }, [draftData, saveDraft])

  return { status, lastSavedAt, error, saveNow, updateDraft, draftData, isDirty }
}
