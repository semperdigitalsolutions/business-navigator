/**
 * DesktopSidebar Component
 * Collapsible sidebar navigation for desktop
 */
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { useNavigationStore } from '../hooks/useNavigationStore'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

export function DesktopSidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { isSidebarCollapsed, toggleSidebar, badgeCounts } = useNavigationStore()

  const navigation = [
    { name: 'Home', path: '/dashboard', icon: HomeIcon, badge: badgeCounts.home },
    { name: 'Tasks', path: '/tasks', icon: ListBulletIcon, badge: badgeCounts.tasks },
    {
      name: 'Assistant',
      path: '/assistant',
      icon: ChatBubbleLeftRightIcon,
      badge: badgeCounts.assistant,
    },
    { name: 'Progress', path: '/progress', icon: ChartBarIcon, badge: badgeCounts.progress },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon, badge: badgeCounts.settings },
  ]

  return (
    <div
      className={`hidden md:flex flex-col h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-950 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold mx-auto">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <div className="relative">
                <Icon className="h-6 w-6 flex-shrink-0" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronDoubleLeftIcon className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
