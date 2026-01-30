/**
 * AdminLayout Component
 * Responsive layout wrapper for all admin pages with collapsible sidebar navigation
 */
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftIcon,
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  KeyIcon,
  Squares2X2Icon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/admin', icon: Squares2X2Icon },
  { name: 'Models', path: '/admin/models', icon: CpuChipIcon },
  { name: 'Tiers', path: '/admin/tiers', icon: TagIcon },
  { name: 'API Keys', path: '/admin/api-keys', icon: KeyIcon },
  { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'Audit Log', path: '/admin/audit-log', icon: ClipboardDocumentListIcon },
]

export function AdminLayout() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent
          isCollapsed={isSidebarCollapsed}
          currentPath={location.pathname}
          user={user}
          onToggleSidebar={toggleSidebar}
        />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-lg font-semibold text-zinc-950 dark:text-white">Admin</span>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <SidebarContent
          isCollapsed={false}
          currentPath={location.pathname}
          user={user}
          onToggleSidebar={toggleSidebar}
          onNavClick={toggleMobileMenu}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 md:hidden"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Back to App Link */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Back to App</span>
            </Link>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-zinc-950 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  isCollapsed: boolean
  currentPath: string
  user: { firstName?: string; lastName?: string; email?: string } | null
  onToggleSidebar: () => void
  onNavClick?: () => void
}

function SidebarContent({
  isCollapsed,
  currentPath,
  user,
  onToggleSidebar,
  onNavClick,
}: SidebarContentProps) {
  return (
    <>
      {/* Header - Desktop only (mobile has its own header) */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Cog6ToothIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">Admin Panel</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
            <Cog6ToothIcon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle - Desktop only */}
      <div className="hidden md:block p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onToggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronDoubleLeftIcon className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  )
}
