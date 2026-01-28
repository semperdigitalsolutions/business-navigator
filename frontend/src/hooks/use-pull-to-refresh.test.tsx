import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePullToRefresh } from './use-pull-to-refresh'

// Mock navigator.vibrate
const mockVibrate = vi.fn()

describe('usePullToRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup navigator.vibrate mock
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper to create touch events
  function createTouchEvent(clientY: number): React.TouchEvent {
    return {
      touches: [{ clientY }],
    } as unknown as React.TouchEvent
  }

  // Helper to setup containerRef with scrollTop
  function setupContainerRef(containerRef: React.RefObject<HTMLDivElement | null>, scrollTop = 0) {
    const mockElement = { scrollTop } as HTMLDivElement
    ;(containerRef as { current: HTMLDivElement | null }).current = mockElement
  }

  describe('initial state', () => {
    it('returns correct initial state', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      expect(result.current.state).toEqual({
        pullDistance: 0,
        isPulling: false,
        isRefreshing: false,
        progress: 0,
      })
    })

    it('returns handlers object with touch event handlers', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      expect(result.current.handlers).toHaveProperty('onTouchStart')
      expect(result.current.handlers).toHaveProperty('onTouchMove')
      expect(result.current.handlers).toHaveProperty('onTouchEnd')
      expect(typeof result.current.handlers.onTouchStart).toBe('function')
      expect(typeof result.current.handlers.onTouchMove).toBe('function')
      expect(typeof result.current.handlers.onTouchEnd).toBe('function')
    })

    it('returns containerRef', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      expect(result.current.containerRef).toBeDefined()
      expect(result.current.containerRef.current).toBeNull()
    })
  })

  describe('touch events update pull progress', () => {
    it('sets isPulling to true on touch start when at top of scroll', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      // Setup container at top
      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      expect(result.current.state.isPulling).toBe(true)
    })

    it('does not set isPulling when not at top of scroll', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      // Setup container scrolled down
      setupContainerRef(result.current.containerRef, 100)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      expect(result.current.state.isPulling).toBe(false)
    })

    it('updates pullDistance on touch move', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, resistance: 1 }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(150))
      })

      // With resistance = 1, delta of 50 should give pullDistance of 50
      expect(result.current.state.pullDistance).toBe(50)
      expect(result.current.state.isPulling).toBe(true)
    })

    it('applies resistance to pull distance', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, resistance: 2 }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      // Delta is 100, with resistance 2, pullDistance should be 50
      expect(result.current.state.pullDistance).toBe(50)
    })

    it('caps pullDistance at maxPull', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, maxPull: 100, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(350))
      })

      // Delta is 250, but should be capped at maxPull of 100
      expect(result.current.state.pullDistance).toBe(100)
    })

    it('calculates progress based on threshold', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(140))
      })

      // Delta of 40 with threshold of 80 = 50% progress
      expect(result.current.state.progress).toBe(0.5)
    })

    it('caps progress at 1', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, maxPull: 200, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(300))
      })

      // Delta of 200 exceeds threshold of 80, progress should cap at 1
      expect(result.current.state.progress).toBe(1)
    })

    it('resets state when pulling up (negative delta)', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, resistance: 1 }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(150))
      })

      expect(result.current.state.pullDistance).toBe(50)

      // Now move up past start
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(50))
      })

      expect(result.current.state.pullDistance).toBe(0)
      expect(result.current.state.progress).toBe(0)
      expect(result.current.state.isPulling).toBe(false)
    })
  })

  describe('triggers refresh callback when threshold is reached', () => {
    it('calls onRefresh when progress >= 1 on touch end', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      // Progress should be >= 1
      expect(result.current.state.progress).toBeGreaterThanOrEqual(1)

      await act(async () => {
        await result.current.handlers.onTouchEnd()
      })

      expect(onRefresh).toHaveBeenCalledTimes(1)
    })

    it('does not call onRefresh when progress < 1 on touch end', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(130))
      })

      // Progress should be < 1 (30/80 = 0.375)
      expect(result.current.state.progress).toBeLessThan(1)

      await act(async () => {
        await result.current.handlers.onTouchEnd()
      })

      expect(onRefresh).not.toHaveBeenCalled()
    })

    it('triggers haptic feedback on refresh', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      await act(async () => {
        await result.current.handlers.onTouchEnd()
      })

      expect(mockVibrate).toHaveBeenCalledWith(50)
    })

    it('sets isRefreshing to true during refresh', async () => {
      let resolveRefresh: () => void
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve
      })
      const onRefresh = vi.fn().mockReturnValue(refreshPromise)

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      let touchEndPromise: Promise<void>
      act(() => {
        touchEndPromise = result.current.handlers.onTouchEnd()
      })

      // Should be refreshing now
      expect(result.current.state.isRefreshing).toBe(true)
      expect(result.current.state.isPulling).toBe(false)

      await act(async () => {
        resolveRefresh!()
        await touchEndPromise
      })
    })
  })

  describe('resets state after refresh completes', () => {
    it('resets all state values after successful refresh', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      await act(async () => {
        await result.current.handlers.onTouchEnd()
      })

      expect(result.current.state).toEqual({
        pullDistance: 0,
        isPulling: false,
        isRefreshing: false,
        progress: 0,
      })
    })

    it('resets state even if onRefresh throws', async () => {
      const onRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'))
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      // The hook's onTouchEnd doesn't catch errors, so the rejection propagates
      // We need to catch it here but still verify state is reset due to finally block
      await act(async () => {
        try {
          await result.current.handlers.onTouchEnd()
        } catch {
          // Expected - error propagates from onRefresh
        }
      })

      // State should be reset even on error (due to finally block)
      expect(result.current.state).toEqual({
        pullDistance: 0,
        isPulling: false,
        isRefreshing: false,
        progress: 0,
      })
    })

    it('resets state when pull does not reach threshold', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(130))
      })

      expect(result.current.state.pullDistance).toBeGreaterThan(0)

      await act(async () => {
        await result.current.handlers.onTouchEnd()
      })

      expect(result.current.state).toEqual({
        pullDistance: 0,
        isPulling: false,
        isRefreshing: false,
        progress: 0,
      })
    })
  })

  describe('respects enabled prop', () => {
    it('does not respond to touch events when disabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, enabled: false }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      expect(result.current.state.isPulling).toBe(false)

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      expect(result.current.state.pullDistance).toBe(0)
    })

    it('does not trigger refresh when disabled', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, enabled: false }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      await act(async () => {
        await result.current.handlers.onTouchEnd()
      })

      expect(onRefresh).not.toHaveBeenCalled()
    })

    it('resets state when disabled after being enabled', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ enabled }) => usePullToRefresh({ onRefresh, enabled, resistance: 1 }),
        { initialProps: { enabled: true } }
      )

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(150))
      })

      expect(result.current.state.pullDistance).toBe(50)

      // Disable
      rerender({ enabled: false })

      expect(result.current.state).toEqual({
        pullDistance: 0,
        isPulling: false,
        isRefreshing: false,
        progress: 0,
      })
    })
  })

  describe('does not respond during refresh', () => {
    it('ignores touch events while refreshing', async () => {
      let resolveRefresh: () => void
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve
      })
      const onRefresh = vi.fn().mockReturnValue(refreshPromise)

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, threshold: 80, resistance: 1 })
      )

      setupContainerRef(result.current.containerRef, 0)

      // Start a pull and trigger refresh
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      let touchEndPromise: Promise<void>
      act(() => {
        touchEndPromise = result.current.handlers.onTouchEnd()
      })

      expect(result.current.state.isRefreshing).toBe(true)

      // Try to start a new pull while refreshing
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(200))
      })

      // State should not have changed from the refreshing state
      expect(result.current.state.isRefreshing).toBe(true)

      // Clean up
      await act(async () => {
        resolveRefresh!()
        await touchEndPromise
      })
    })
  })

  describe('default options', () => {
    it('uses default threshold of 80', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, resistance: 1 }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(140))
      })

      // 40/80 = 0.5 progress with default threshold
      expect(result.current.state.progress).toBe(0.5)
    })

    it('uses default maxPull of 120', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh, resistance: 1 }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(400))
      })

      // Should be capped at default maxPull of 120
      expect(result.current.state.pullDistance).toBe(120)
    })

    it('uses default resistance of 2.5', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent(350))
      })

      // Delta of 250 / 2.5 = 100 pullDistance
      expect(result.current.state.pullDistance).toBe(100)
    })

    it('is enabled by default', () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePullToRefresh({ onRefresh }))

      setupContainerRef(result.current.containerRef, 0)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent(100))
      })

      expect(result.current.state.isPulling).toBe(true)
    })
  })
})
