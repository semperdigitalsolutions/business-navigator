import { useCallback, useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'

export interface UseNavigationGuardOptions {
  /** Whether there are unsaved changes to protect */
  isDirty: boolean
  /** Optional callback to save before leaving */
  onSave?: () => Promise<void>
  /** Whether the guard is enabled (default: true) */
  enabled?: boolean
}

export interface NavigationGuardDialogProps {
  /** Whether the dialog should be shown */
  isOpen: boolean
  /** Called when user wants to stay on the page */
  onCancel: () => void
  /** Called when user wants to leave without saving */
  onConfirmLeave: () => void
  /** Called when user wants to save and then leave */
  onSaveAndLeave: () => Promise<void>
  /** Whether a save operation is in progress */
  isSaving: boolean
}

export interface UseNavigationGuardReturn {
  /** Props to spread onto the UnsavedChangesDialog component */
  dialogProps: NavigationGuardDialogProps
}

/**
 * Hook to warn users when they attempt to navigate away with unsaved changes.
 * Uses React Router's useBlocker for SPA navigation and beforeunload for
 * browser close/refresh.
 *
 * @example
 * ```tsx
 * const { dialogProps } = useNavigationGuard({
 *   isDirty: formState.isDirty,
 *   onSave: handleSave,
 * })
 *
 * return (
 *   <>
 *     <Form />
 *     <UnsavedChangesDialog {...dialogProps} />
 *   </>
 * )
 * ```
 */
export function useNavigationGuard({
  isDirty,
  onSave,
  enabled = true,
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const [isSaving, setIsSaving] = useState(false)

  const shouldBlock = useCallback(() => {
    return isDirty && enabled
  }, [isDirty, enabled])

  const blocker = useBlocker(shouldBlock)

  // Handle browser close/refresh with beforeunload
  useEffect(() => {
    if (!isDirty || !enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Modern browsers ignore custom messages but require returnValue
      e.returnValue = ''
      return ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, enabled])

  const handleCancel = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  const handleConfirmLeave = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed()
    }
  }, [blocker])

  const handleSaveAndLeave = useCallback(async () => {
    if (blocker.state !== 'blocked') return

    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
        blocker.proceed()
      } catch {
        // Save failed - stay on page, user will see error from save handler
        setIsSaving(false)
      }
    } else {
      blocker.proceed()
    }
  }, [blocker, onSave])

  return {
    dialogProps: {
      isOpen: blocker.state === 'blocked',
      onCancel: handleCancel,
      onConfirmLeave: handleConfirmLeave,
      onSaveAndLeave: handleSaveAndLeave,
      isSaving,
    },
  }
}
