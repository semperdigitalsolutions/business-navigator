/**
 * Admin Route Configuration
 * Defines all admin routes for integration with the main router
 *
 * Usage in App.tsx:
 * ```tsx
 * import { adminRoutes } from '@/features/admin/routes'
 *
 * // Add to Routes:
 * <Route
 *   element={
 *     <AdminGuard>
 *       <AdminLayout />
 *     </AdminGuard>
 *   }
 * >
 *   {adminRoutes.map((route) => (
 *     <Route key={route.path} path={route.path} element={route.element} />
 *   ))}
 * </Route>
 * ```
 */
import { Navigate } from 'react-router-dom'
import { AdminAuditLogPage } from './pages/AdminAuditLogPage'
import { AdminApiKeysPage } from './pages/AdminApiKeysPage'
import { AdminModelsPage } from './pages/AdminModelsPage'
import { AdminTiersPage } from './pages/AdminTiersPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'

// Dashboard page - overview of admin functionality
function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome to the admin panel. Select a section from the sidebar to get started.
      </p>
    </div>
  )
}

export interface AdminRoute {
  path: string
  element: React.ReactNode
  title: string
}

/**
 * Admin route definitions
 * Each route includes path, element, and title for documentation
 */
export const adminRoutes: AdminRoute[] = [
  {
    path: '/admin',
    element: <AdminDashboardPage />,
    title: 'Admin Dashboard',
  },
  {
    path: '/admin/models',
    element: <AdminModelsPage />,
    title: 'AI Models',
  },
  {
    path: '/admin/tiers',
    element: <AdminTiersPage />,
    title: 'Subscription Tiers',
  },
  {
    path: '/admin/api-keys',
    element: <AdminApiKeysPage />,
    title: 'API Keys',
  },
  {
    path: '/admin/settings',
    element: <AdminSettingsPage />,
    title: 'Admin Settings',
  },
  {
    path: '/admin/audit-log',
    element: <AdminAuditLogPage />,
    title: 'Audit Log',
  },
]

/**
 * Catch-all route for unknown admin paths
 * Redirects to admin dashboard
 */
export const adminCatchAllRoute = {
  path: '/admin/*',
  element: <Navigate to="/admin" replace />,
  title: 'Admin Redirect',
}
