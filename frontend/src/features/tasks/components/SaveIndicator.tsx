/**
 * SaveIndicator Component
 * Issue #71: Visual indicator for auto-save status
 * Displays saving/saved/error states with appropriate animations
 * Positioned in the top-right of the task content area
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { cn } from '@/utils/classnames'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  /** Current save status from useAutoSave */
  status: SaveStatus
  /** Timestamp of the last successful save */
  lastSavedAt?: Date | null
  /** Additional class names */
  className?: string
}

/** Duration in ms before the "Saved" state fades out */
const SAVED_FADE_DELAY = 2000

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
      />
    </svg>
  )
}

function CheckCloudIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 11.25" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SavingState() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <CloudIcon className="h-4 w-4 animate-pulse" />
      Saving...
    </span>
  )
}

function SavedState({ lastSavedAt, visible }: { lastSavedAt?: Date | null; visible: boolean }) {
  const timeLabel = lastSavedAt ? ` at ${formatTime(lastSavedAt)}` : ''
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-green-600 transition-opacity duration-500',
        'dark:text-green-400',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <CheckCloudIcon className="h-4 w-4" />
      Saved{timeLabel}
    </span>
  )
}

function ErrorState() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
      <AlertIcon className="h-4 w-4" />
      Not saved
    </span>
  )
}

/**
 * Tracks whether the "Saved" label should still be visible.
 * Uses useSyncExternalStore to avoid calling setState inside an effect.
 */
function useSavedVisibility(status: SaveStatus): boolean {
  const visibleRef = useRef(false)
  const listenersRef = useRef(new Set<() => void>())

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const getSnapshot = useCallback(() => visibleRef.current, [])

  useEffect(() => {
    if (status !== 'saved') {
      visibleRef.current = false
      listenersRef.current.forEach((l) => l())
      return
    }
    visibleRef.current = true
    listenersRef.current.forEach((l) => l())

    const timer = setTimeout(() => {
      visibleRef.current = false
      listenersRef.current.forEach((l) => l())
    }, SAVED_FADE_DELAY)

    return () => clearTimeout(timer)
  }, [status])

  return useSyncExternalStore(subscribe, getSnapshot)
}

export function SaveIndicator({ status, lastSavedAt, className }: SaveIndicatorProps) {
  const savedVisible = useSavedVisibility(status)

  if (status === 'idle' && !savedVisible) return null

  return (
    <div className={cn('flex items-center justify-end', className)} aria-live="polite">
      {status === 'saving' && <SavingState />}
      {status === 'saved' && <SavedState lastSavedAt={lastSavedAt} visible={savedVisible} />}
      {status === 'error' && <ErrorState />}
    </div>
  )
}
