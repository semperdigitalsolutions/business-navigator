/**
 * Credit utility functions - Shared utilities for credit components
 * Issue #212: Credit balance display for Epic 9
 */
import type { ProgressColor } from '@/components/ui/progress'

export interface StateColors {
  text: string
  bg: string
  border: string
  progress: ProgressColor
  icon: string
}

/**
 * Get visual state colors based on credit percentage
 */
export function getStateColors(isLow: boolean, isCritical: boolean): StateColors {
  if (isCritical) {
    return {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      progress: 'error',
      icon: 'text-red-500 dark:text-red-400',
    }
  }
  if (isLow) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      progress: 'warning',
      icon: 'text-amber-500 dark:text-amber-400',
    }
  }
  return {
    text: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-50 dark:bg-zinc-800',
    border: 'border-zinc-200 dark:border-zinc-700',
    progress: 'primary',
    icon: 'text-blue-500 dark:text-blue-400',
  }
}
