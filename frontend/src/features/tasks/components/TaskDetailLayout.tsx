/**
 * TaskDetailLayout Component
 * Issue #67: Breadcrumb, header with icon, content area, bottom nav area
 * Provides consistent layout for task detail pages
 */
import { Link } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import type { TaskPhase } from '@shared/types'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TaskDetailLayoutProps {
  /** Task title */
  title: string
  /** Task description */
  description?: string
  /** Task icon (emoji or icon component) */
  icon?: string
  /** Phase the task belongs to */
  phase?: TaskPhase
  /** Phase display name */
  phaseName?: string
  /** Estimated time to complete */
  estimatedTime?: string
  /** Task content */
  children: React.ReactNode
  /** Bottom navigation (TaskNavigation component) */
  navigation?: React.ReactNode
  /** Additional class names */
  className?: string
}

const PHASE_COLORS: Record<TaskPhase, string> = {
  ideation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  legal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  financial: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  launch_prep: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            to="/"
            className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRightIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
            {item.href ? (
              <Link
                to={item.href}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function TaskDetailLayout({
  title,
  description,
  icon,
  phase,
  phaseName,
  estimatedTime,
  children,
  navigation,
  className,
}: TaskDetailLayoutProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Tasks', href: '/tasks' },
    ...(phaseName ? [{ label: phaseName, href: `/tasks?phase=${phase}` }] : []),
    { label: title },
  ]

  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      {/* Main Content Area */}
      <div className="flex-1 pb-24">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-4">
              {/* Task Icon */}
              {icon && (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl dark:bg-zinc-800">
                  {icon}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {/* Phase Badge */}
                {phase && phaseName && (
                  <span
                    className={cn(
                      'mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                      PHASE_COLORS[phase]
                    )}
                  >
                    {phaseName}
                  </span>
                )}

                {/* Title */}
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>

                {/* Description and Meta */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {description && <p className="text-zinc-600 dark:text-zinc-400">{description}</p>}
                  {estimatedTime && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      Est. {estimatedTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task Content */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Sticky) */}
      {navigation && (
        <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
          <div className="mx-auto max-w-3xl px-4 py-4">{navigation}</div>
        </div>
      )}
    </div>
  )
}
