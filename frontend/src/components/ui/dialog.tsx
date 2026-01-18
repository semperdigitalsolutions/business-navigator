import {
  Dialog as CatalystDialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/catalyst-ui-kit/typescript/dialog'

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'

export interface ModalProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CatalystDialog>, 'size'> {
  size?: ModalSize
}

export function Modal({ size = 'lg', ...props }: ModalProps) {
  return <CatalystDialog size={size} {...props} />
}

export const ModalTitle = DialogTitle
export const ModalDescription = DialogDescription
export const ModalBody = DialogBody
export const ModalActions = DialogActions

// Also export with Dialog naming for flexibility
export { CatalystDialog as Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions }
