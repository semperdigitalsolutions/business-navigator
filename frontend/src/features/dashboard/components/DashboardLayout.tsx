/**
 * DashboardLayout Component
 * Responsive 3-column layout for dashboard
 */
import { ReactNode } from 'react'
import { DesktopSidebar } from '@/features/navigation/components/DesktopSidebar'
import { MobileBottomNav } from '@/features/navigation/components/MobileBottomNav'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
