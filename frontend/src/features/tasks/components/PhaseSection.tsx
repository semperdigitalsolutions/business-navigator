import { ReactNode } from 'react'
import { cn } from '@/utils/classnames'

export interface PhaseSectionProps {
  phaseNumber: number
  title: string
  taskCount: number
  isActive?: boolean
  children: ReactNode
}

export function PhaseSection({
  phaseNumber,
  title,
  taskCount,
  isActive = false,
  children,
}: PhaseSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2
          className={cn(
            'text-sm font-bold uppercase tracking-wide',
            isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'
          )}
        >
          Phase {phaseNumber}: {title}
        </h2>
        <span className="text-sm text-slate-400">{taskCount} Tasks Available</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}
