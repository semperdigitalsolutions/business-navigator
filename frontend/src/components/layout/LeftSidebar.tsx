import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'

interface NavItem {
  label: string
  icon: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home', href: '/dashboard' },
  { label: 'Task Library', icon: 'task', href: '/tasks' },
  { label: 'Chat History', icon: 'chat_bubble', href: '/chat-history' },
  { label: 'Progress', icon: 'trending_up', href: '/progress' },
  { label: 'Documents', icon: 'folder', href: '/documents' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
]

interface NavLinkProps {
  item: NavItem
  isActive: boolean
}

function NavLink({ item, isActive }: NavLinkProps) {
  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-sky-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white'
      )}
    >
      <Icon name={item.icon} size={22} />
      <span className="hidden lg:block">{item.label}</span>
    </Link>
  )
}

interface UserProfileProps {
  userName: string
  userAvatar?: string
  userPlan: string
}

function UserProfile({ userName, userAvatar, userPlan }: UserProfileProps) {
  return (
    <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
      <div className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="h-8 w-8 rounded-full ring-2 ring-slate-100 dark:ring-zinc-700"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
            {userName}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {userPlan}
          </p>
        </div>
      </div>
    </div>
  )
}

export interface LeftSidebarProps {
  /** User display name */
  userName?: string
  /** User avatar URL */
  userAvatar?: string
  /** User plan (e.g., "Pro Plan", "Free") */
  userPlan?: string
}

export function LeftSidebar({
  userName = 'User',
  userAvatar,
  userPlan = 'Free Plan',
}: LeftSidebarProps) {
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 lg:px-6">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Icon name="bolt" size={20} />
        </div>
        <span className="ml-3 hidden text-sm font-bold tracking-tight text-slate-900 dark:text-white lg:block">
          Business Navigator
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* User Profile */}
      <UserProfile userName={userName} userAvatar={userAvatar} userPlan={userPlan} />
    </div>
  )
}
