/**
 * TaskListPage Component
 * Issue #65: Phase accordion with lock icons for dependencies
 * Displays tasks grouped by phase with completion counts
 */
import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import { apiClient } from '@/lib/api/client'
import { TaskCard } from './TaskCard'
import type { TaskPhaseGroup, TaskListResponse } from '@shared/types'

interface TaskListPageProps {
  businessId?: string
}

const PHASE_ICONS: Record<string, string> = {
  ideation: '💡',
  legal: '⚖️',
  financial: '💰',
  launch_prep: '🚀',
}

export function TaskListPage({ businessId }: TaskListPageProps) {
  const [phases, setPhases] = useState<TaskPhaseGroup[]>([])
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [businessId])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = businessId ? `?businessId=${businessId}` : ''
      const response = await apiClient.get<TaskListResponse>(`/api/tasks${params}`)

      if (response.success && response.data) {
        setPhases(response.data.phases)
        // Auto-expand first phase with incomplete tasks
        const firstIncomplete = response.data.phases.find((phase) =>
          phase.tasks.some((t) => t.status !== 'completed' && t.status !== 'skipped')
        )
        if (firstIncomplete) {
          setExpandedPhases(new Set([firstIncomplete.id]))
        }
      } else {
        setError('Failed to load tasks')
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  const getPhaseStats = (phase: TaskPhaseGroup) => {
    const completed = phase.tasks.filter((t) => t.status === 'completed').length
    const total = phase.tasks.length
    return { completed, total }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-500 dark:text-zinc-400">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        <button
          onClick={loadTasks}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (phases.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">📋</div>
        <h3 className="mb-2 text-lg font-medium text-zinc-950 dark:text-white">No tasks yet</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Tasks will appear here once available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Your Tasks</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Complete tasks to build your business foundation
        </p>
      </div>

      {phases.map((phase) => {
        const isExpanded = expandedPhases.has(phase.id)
        const { completed, total } = getPhaseStats(phase)
        const isComplete = completed === total

        return (
          <div
            key={phase.id}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
          >
            {/* Phase Header (Accordion Toggle) */}
            <button
              onClick={() => togglePhase(phase.id)}
              className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3">
                {/* Expand/Collapse Icon */}
                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-zinc-400" />
                )}

                {/* Phase Icon */}
                <span className="text-xl">{PHASE_ICONS[phase.id] || '📋'}</span>

                {/* Phase Name */}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{phase.name}</span>
              </div>

              {/* Completion Count Badge */}
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-sm font-medium',
                  isComplete
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                )}
              >
                {completed}/{total}
              </span>
            </button>

            {/* Phase Tasks (Collapsible Content) */}
            <div
              className={cn(
                'border-t border-zinc-200 transition-all duration-200 dark:border-zinc-700',
                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
              )}
            >
              <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {phase.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
