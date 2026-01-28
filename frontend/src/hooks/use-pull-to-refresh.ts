/**
 * usePullToRefresh Hook
 * Issue #53: Pull-to-refresh for mobile dashboard
 *
 * Detects vertical pull-down gestures on touch devices and triggers refresh
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export interface PullToRefreshOptions {
  /** Minimum pull distance (px) to trigger refresh */
  threshold?: number
  /** Maximum pull distance for visual feedback */
  maxPull?: number
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void>
  /** Whether pull-to-refresh is enabled */
  enabled?: boolean
  /** Resistance factor (higher = harder to pull) */
  resistance?: number
}

export interface PullToRefreshState {
  /** Current pull distance in pixels */
  pullDistance: number
  /** Whether user is actively pulling */
  isPulling: boolean
  /** Whether refresh is in progress */
  isRefreshing: boolean
  /** Progress from 0 to 1 (based on threshold) */
  progress: number
}

export interface PullToRefreshHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export interface UsePullToRefreshReturn {
  state: PullToRefreshState
  handlers: PullToRefreshHandlers
  containerRef: React.RefObject<HTMLDivElement | null>
}

const INITIAL_STATE: PullToRefreshState = {
  pullDistance: 0,
  isPulling: false,
  isRefreshing: false,
  progress: 0,
}

export function usePullToRefresh(options: PullToRefreshOptions): UsePullToRefreshReturn {
  const { threshold = 80, maxPull = 120, onRefresh, enabled = true, resistance = 2.5 } = options

  const containerRef = useRef<HTMLDivElement | null>(null)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isAtTop = useRef<boolean>(false)

  const [state, setState] = useState<PullToRefreshState>(INITIAL_STATE)

  // Check if element is scrolled to top
  const checkIfAtTop = useCallback((): boolean => {
    const container = containerRef.current
    if (!container) return false
    // Check if scrollable container is at top (allowing small tolerance)
    return container.scrollTop <= 1
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || state.isRefreshing) return

      const touch = e.touches[0]
      startY.current = touch.clientY
      currentY.current = touch.clientY
      isAtTop.current = checkIfAtTop()

      if (isAtTop.current) {
        setState((prev) => ({ ...prev, isPulling: true }))
      }
    },
    [enabled, state.isRefreshing, checkIfAtTop]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || state.isRefreshing || !isAtTop.current) return

      const touch = e.touches[0]
      currentY.current = touch.clientY
      const deltaY = currentY.current - startY.current

      // Only handle downward pulls when at top of scroll
      if (deltaY <= 0) {
        setState((prev) => ({ ...prev, pullDistance: 0, progress: 0, isPulling: false }))
        return
      }

      // Apply resistance to make it feel natural
      const adjustedDelta = Math.min(deltaY / resistance, maxPull)
      const progress = Math.min(adjustedDelta / threshold, 1)

      setState({
        pullDistance: adjustedDelta,
        isPulling: true,
        isRefreshing: false,
        progress,
      })
    },
    [enabled, state.isRefreshing, threshold, maxPull, resistance]
  )

  const onTouchEnd = useCallback(async () => {
    if (!enabled || state.isRefreshing) return

    const triggeredRefresh = state.progress >= 1

    if (triggeredRefresh) {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      setState((prev) => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullDistance: threshold, // Hold at threshold during refresh
      }))

      try {
        await onRefresh()
      } finally {
        setState(INITIAL_STATE)
      }
    } else {
      // Reset without refresh
      setState(INITIAL_STATE)
    }
  }, [enabled, state.isRefreshing, state.progress, threshold, onRefresh])

  // Reset state if disabled
  useEffect(() => {
    if (!enabled) {
      setState(INITIAL_STATE)
    }
  }, [enabled])

  return {
    state,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    containerRef,
  }
}
