/**
 * useIsAdmin Hook
 * Check if the current user has admin privileges
 */
import { useMemo } from 'react'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

/**
 * Check if user has admin role
 * Currently checks for a hardcoded list of admin emails
 * TODO: Replace with proper role-based check when role field is added to User type
 */
export function checkIsAdmin(user: { email?: string } | null): boolean {
  if (!user?.email) return false

  // Temporary: Check against list of admin emails
  // This should be replaced with a proper role check when the User type includes a role field
  const adminEmails = [
    // Add admin emails here or use environment variable
    import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [],
  ].flat()

  // If no admin emails configured, allow any authenticated user (for development)
  if (adminEmails.length === 0 || adminEmails[0] === '') {
    // In development, you might want to allow all authenticated users
    // In production, this should require explicit admin configuration
    return import.meta.env.DEV
  }

  return adminEmails.includes(user.email)
}

/**
 * Hook to check admin status
 * Can be used in components to conditionally show admin features
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { user, isAuthenticated } = useAuthStore()

  // Check admin status synchronously using useMemo
  const isAdmin = useMemo(() => {
    if (!isAuthenticated || !user) return false
    return checkIsAdmin(user)
  }, [isAuthenticated, user])

  // No async loading needed for synchronous check
  return { isAdmin, isLoading: false }
}
