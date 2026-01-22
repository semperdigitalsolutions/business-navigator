/**
 * useTaskNavigationGuard Hook
 * Issue #86: Combines useAutoSave with useNavigationGuard for task editing
 */
import { useNavigationGuard, type NavigationGuardDialogProps } from '@/hooks/use-navigation-guard'
import { useAutoSave } from './useAutoSave'

interface UseTaskNavigationGuardOptions {
  /** Task ID for auto-save */
  taskId: string
  /** Business ID (optional) */
  businessId?: string
  /** Whether the guard is enabled (default: true) */
  enabled?: boolean
  /** Callback on successful save */
  onSaveSuccess?: (savedAt: Date) => void
  /** Callback on save error */
  onSaveError?: (error: Error) => void
}

interface UseTaskNavigationGuardReturn {
  /** Props to spread onto the UnsavedChangesDialog component */
  dialogProps: NavigationGuardDialogProps
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

/**
 * Hook that combines auto-save functionality with navigation blocking.
 * Use this in task editing layouts to protect user work.
 *
 * @example
 * ```tsx
 * const { dialogProps, updateDraft, isDirty, status } = useTaskNavigationGuard({
 *   taskId: task.id,
 *   businessId: business.id,
 * })
 *
 * return (
 *   <>
 *     <TaskForm onChange={updateDraft} />
 *     <UnsavedChangesDialog {...dialogProps} />
 *   </>
 * )
 * ```
 */
export function useTaskNavigationGuard({
  taskId,
  businessId,
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: UseTaskNavigationGuardOptions): UseTaskNavigationGuardReturn {
  const autoSave = useAutoSave({
    taskId,
    businessId,
    enabled,
    onSaveSuccess,
    onSaveError,
  })

  const { dialogProps } = useNavigationGuard({
    isDirty: autoSave.isDirty,
    onSave: autoSave.saveNow,
    enabled,
  })

  return {
    dialogProps,
    status: autoSave.status,
    lastSavedAt: autoSave.lastSavedAt,
    error: autoSave.error,
    saveNow: autoSave.saveNow,
    updateDraft: autoSave.updateDraft,
    draftData: autoSave.draftData,
    isDirty: autoSave.isDirty,
  }
}
