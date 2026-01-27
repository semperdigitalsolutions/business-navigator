/**
 * MobileBottomNav Component
 * Fixed bottom navigation for mobile devices
 */
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid'
import { useNavigationStore } from '../hooks/useNavigationStore'

export function MobileBottomNav() {
  const location = useLocation()
  const { badgeCounts } = useNavigationStore()

  const tabs = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      badge: badgeCounts.home,
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: ListBulletIcon,
      activeIcon: ListBulletIconSolid,
      badge: badgeCounts.tasks,
    },
    {
      name: 'Assistant',
      path: '/assistant',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
      badge: badgeCounts.assistant,
    },
    {
      name: 'Progress',
      path: '/progress',
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid,
      badge: badgeCounts.progress,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothIconSolid,
      badge: badgeCounts.settings,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          const Icon = isActive ? tab.activeIcon : tab.icon

          return (
            <Link
              key={tab.name}
              to={tab.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive
                      ? 'text-indigo-600'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}
              >
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
