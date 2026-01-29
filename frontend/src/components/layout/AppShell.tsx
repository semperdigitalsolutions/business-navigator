import { cn } from '@/utils/classnames'
import { ReactNode } from 'react'

export interface AppShellProps {
  /** Left sidebar content */
  leftSidebar: ReactNode
  /** Main content area */
  children: ReactNode
  /** Right sidebar content (optional, hidden on smaller screens) */
  rightSidebar?: ReactNode
  /** Additional className for main content area */
  mainClassName?: string
}

/**
 * Three-column app shell layout for authenticated screens
 * - Left sidebar: 72px collapsed, 256px expanded (lg+)
 * - Main content: flex-1, scrollable
 * - Right sidebar: 320px, hidden below xl
 */
export function AppShell({ leftSidebar, children, rightSidebar, mainClassName }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
      {/* Left Sidebar */}
      <aside className="w-[72px] flex-shrink-0 border-r border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 lg:w-64">
        {leftSidebar}
      </aside>

      {/* Main Content */}
      <main className={cn('flex min-w-0 flex-1 flex-col overflow-hidden', mainClassName)}>
        {children}
      </main>

      {/* Right Sidebar */}
      {rightSidebar && (
        <aside className="hidden w-80 flex-shrink-0 border-l border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 xl:flex xl:flex-col">
          {rightSidebar}
        </aside>
      )}
    </div>
  )
}
