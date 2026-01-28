/**
 * useIsTouchDevice Hook
 * Detects if the current device has touch capabilities
 */

/**
 * Check if device supports touch input
 * Runs once at module load to avoid SSR issues
 */
function checkTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check for touch events
  const hasTouchEvents = 'ontouchstart' in window

  // Check for coarse pointer (touch screen)
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches

  // Check for touch points
  const hasTouchPoints = navigator.maxTouchPoints > 0

  return hasTouchEvents || hasCoarsePointer || hasTouchPoints
}

/**
 * Returns true if the device supports touch input
 * Uses lazy initialization to avoid effect-based setState
 */
export function useIsTouchDevice(): boolean {
  // Lazy initialization runs once on first render
  return checkTouchDevice()
}
