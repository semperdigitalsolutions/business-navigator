import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner'

export interface ToasterProps {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  expand?: boolean
  richColors?: boolean
  closeButton?: boolean
  duration?: number
}

export function Toaster({
  position = 'bottom-right',
  expand = false,
  richColors = true,
  closeButton = false,
  duration = 4000,
}: ToasterProps = {}) {
  return (
    <SonnerToaster
      position={position}
      expand={expand}
      richColors={richColors}
      closeButton={closeButton}
      duration={duration}
      toastOptions={{
        classNames: {
          toast:
            'group rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
          title: 'text-sm font-semibold',
          description: 'text-sm text-zinc-500 dark:text-zinc-400',
          actionButton:
            'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900',
          cancelButton:
            'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400',
          closeButton:
            'absolute right-2 top-2 rounded-md p-1 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300',
        },
      }}
    />
  )
}

export interface ToastOptions {
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick: () => void
  }
  duration?: number
  id?: string | number
}

export const toast = {
  /**
   * Show a default toast message
   */
  message: (message: string, options?: ToastOptions) => sonnerToast(message, options),

  /**
   * Show a success toast
   */
  success: (message: string, options?: ToastOptions) => sonnerToast.success(message, options),

  /**
   * Show an error toast
   */
  error: (message: string, options?: ToastOptions) => sonnerToast.error(message, options),

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: ToastOptions) => sonnerToast.warning(message, options),

  /**
   * Show an info toast
   */
  info: (message: string, options?: ToastOptions) => sonnerToast.info(message, options),

  /**
   * Show a loading toast that can be updated
   */
  loading: (message: string, options?: ToastOptions) => sonnerToast.loading(message, options),

  /**
   * Show a promise toast that updates based on promise state
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => sonnerToast.promise(promise, options),

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
}
