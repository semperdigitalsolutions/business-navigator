/**
 * ProgressOverview Component
 * Issue #46: Phase bars with gradient blue, collapsible on mobile
 * Displays "Your Progress [X/Y]" with phase breakdown bars
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/classnames'

interface PhaseProgressItem {
  id: string
  name: string
  completed: number
  total: number
}

interface ProgressOverviewProps {
  phases: PhaseProgressItem[]
  totalCompleted: number
  totalTasks: number
  className?: string
}

function PhaseBar({ phase }: { phase: PhaseProgressItem }) {
  const percentage = phase.total > 0 ? (phase.completed / phase.total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{phase.name}</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {phase.completed}/{phase.total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

export function ProgressOverview({
  phases,
  totalCompleted,
  totalTasks,
  className,
}: ProgressOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const chevronIcon = isExpanded ? (
    <ChevronUpIcon className="h-5 w-5 text-zinc-400" />
  ) : (
    <ChevronDownIcon className="h-5 w-5 text-zinc-400" />
  )
  const contentClasses = cn(
    'space-y-4 transition-all duration-300',
    !isExpanded && 'max-h-0 overflow-hidden opacity-0 md:max-h-none md:opacity-100',
    isExpanded && 'max-h-96 opacity-100'
  )

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between md:cursor-default"
          aria-expanded={isExpanded}
        >
          <CardTitle className="flex items-center gap-2">
            Your Progress
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {totalCompleted}/{totalTasks}
            </span>
          </CardTitle>
          <span className="md:hidden">{chevronIcon}</span>
        </button>
      </CardHeader>
      <CardContent className={contentClasses}>
        {phases.map((phase) => (
          <PhaseBar key={phase.id} phase={phase} />
        ))}
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1 pt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all tasks
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </CardContent>
    </Card>
  )
}
