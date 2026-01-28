/**
 * useSwipeGesture Hook
 * Issue #87: Swipe gesture detection for touch devices
 *
 * Detects horizontal swipe gestures and provides progress/completion callbacks
 */
import { useRef, useCallback, useState } from 'react'

interface SwipeGestureOptions {
  /** Minimum distance (px) to trigger swipe completion */
  threshold?: number
  /** Callback when swipe completes (passes threshold) */
  onSwipeComplete?: () => void
  /** Whether swipe is enabled */
  enabled?: boolean
  /** Direction: 'left' | 'right' */
  direction?: 'left' | 'right'
}

interface SwipeState {
  /** Current swipe offset in pixels */
  offset: number
  /** Whether user is actively swiping */
  isSwiping: boolean
  /** Progress from 0 to 1 (based on threshold) */
  progress: number
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function useSwipeGesture(options: SwipeGestureOptions = {}): [SwipeState, SwipeHandlers] {
  const { threshold = 100, onSwipeComplete, enabled = true, direction = 'right' } = options

  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)

  const [state, setState] = useState<SwipeState>({
    offset: 0,
    isSwiping: false,
    progress: 0,
  })

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return
      const touch = e.touches[0]
      startX.current = touch.clientX
      startY.current = touch.clientY
      isHorizontalSwipe.current = null
      setState((prev) => ({ ...prev, isSwiping: true }))
    },
    [enabled]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !state.isSwiping) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - startX.current
      const deltaY = touch.clientY - startY.current

      // Determine swipe direction on first significant movement
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY)
        }
      }

      // Only process horizontal swipes
      if (!isHorizontalSwipe.current) return

      // Prevent vertical scroll during horizontal swipe
      e.preventDefault()

      // Calculate offset based on direction
      let offset = 0
      if (direction === 'right' && deltaX > 0) {
        offset = Math.min(deltaX, threshold * 1.5)
      } else if (direction === 'left' && deltaX < 0) {
        offset = Math.max(deltaX, -threshold * 1.5)
      }

      const progress = Math.min(Math.abs(offset) / threshold, 1)

      setState({
        offset,
        isSwiping: true,
        progress,
      })
    },
    [enabled, state.isSwiping, threshold, direction]
  )

  const onTouchEnd = useCallback(() => {
    if (!enabled) return

    const completed = state.progress >= 1

    if (completed && onSwipeComplete) {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      onSwipeComplete()
    }

    // Reset state
    setState({
      offset: 0,
      isSwiping: false,
      progress: 0,
    })
    isHorizontalSwipe.current = null
  }, [enabled, state.progress, onSwipeComplete])

  return [
    state,
    {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  ]
}
