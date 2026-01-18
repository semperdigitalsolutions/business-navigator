import { useCallback, useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Returns whether the component is mounted.
 * Useful for avoiding hydration mismatches and
 * conditionally rendering client-only content.
 *
 * @returns true once the component has mounted on the client
 *
 * @example
 * ```tsx
 * const mounted = useMounted()
 *
 * // Avoid hydration mismatch
 * if (!mounted) return null
 *
 * // Safe to use browser APIs
 * return <div>Window width: {window.innerWidth}</div>
 * ```
 */
export function useMounted(): boolean {
  const getSnapshot = useCallback(() => true, [])
  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
}
