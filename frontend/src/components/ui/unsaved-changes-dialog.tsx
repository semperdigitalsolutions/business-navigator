import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { NavigationGuardDialogProps } from '@/hooks/use-navigation-guard'

export interface UnsavedChangesDialogProps extends NavigationGuardDialogProps {
  /** Custom title (default: "You have unsaved changes") */
  title?: string
  /** Custom description */
  description?: string
}

/**
 * Confirmation dialog shown when user attempts to navigate away with unsaved changes.
 * Provides three options: Stay, Save & Leave, or Discard Changes.
 */
export function UnsavedChangesDialog({
  isOpen,
  onCancel,
  onConfirmLeave,
  onSaveAndLeave,
  isSaving,
  title = 'You have unsaved changes',
  description = "Your progress hasn't been saved yet. Would you like to save before leaving?",
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} size="sm">
      <DialogTitle className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
        {title}
      </DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogBody />
      <DialogActions>
        <Button outline onClick={onConfirmLeave} disabled={isSaving}>
          Discard Changes
        </Button>
        <Button outline onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button color="blue" onClick={onSaveAndLeave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Leave'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
