/**
 * AdminGuard Component
 * Protects admin routes by checking user admin status
 * Redirects non-admin users to the dashboard
 */
import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { checkIsAdmin } from '../hooks/useIsAdmin'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()

  // Check admin status synchronously using useMemo
  const isAdmin = useMemo(() => {
    if (!isAuthenticated || !user) return false
    return checkIsAdmin(user)
  }, [isAuthenticated, user])

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Render admin content
  return <>{children}</>
}
