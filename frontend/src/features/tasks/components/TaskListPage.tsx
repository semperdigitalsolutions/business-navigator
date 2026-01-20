/**
 * TaskListPage Component
 * Issue #65: Phase accordion with lock icons for dependencies
 * Displays tasks grouped by phase with completion counts
 */
import { useCallback, useEffect, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import { apiClient } from '@/lib/api/client'
import { TaskCard } from './TaskCard'
import type { TaskListResponse, TaskPhaseGroup } from '@shared/types'

interface TaskListPageProps {
  businessId?: string
}

const PHASE_ICONS: Record<string, string> = {
  ideation: '💡',
  legal: '⚖️',
  financial: '💰',
  launch_prep: '🚀',
}

function getPhaseStats(phase: TaskPhaseGroup) {
  const completed = phase.tasks.filter((t) => t.status === 'completed').length
  return { completed, total: phase.tasks.length }
}

interface PhaseAccordionProps {
  phase: TaskPhaseGroup
  isExpanded: boolean
  onToggle: () => void
}

function PhaseAccordion({ phase, isExpanded, onToggle }: PhaseAccordionProps) {
  const { completed, total } = getPhaseStats(phase)
  const isComplete = completed === total
  const badgeClass = isComplete
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-zinc-400" />
          )}
          <span className="text-xl">{PHASE_ICONS[phase.id] || '📋'}</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{phase.name}</span>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-sm font-medium', badgeClass)}>
          {completed}/{total}
        </span>
      </button>
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
}

function LoadingState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-zinc-500 dark:text-zinc-400">Loading tasks...</div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="mb-4 text-6xl">📋</div>
      <h3 className="mb-2 text-lg font-medium text-zinc-950 dark:text-white">No tasks yet</h3>
      <p className="text-zinc-500 dark:text-zinc-400">Tasks will appear here once available.</p>
    </div>
  )
}

export function TaskListPage({ businessId }: TaskListPageProps) {
  const [phases, setPhases] = useState<TaskPhaseGroup[]>([])
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = businessId ? `?businessId=${businessId}` : ''
      const response = await apiClient.get<TaskListResponse>(`/api/tasks${params}`)
      if (response.success && response.data) {
        setPhases(response.data.phases)
        const firstIncomplete = response.data.phases.find((p) =>
          p.tasks.some((t) => t.status !== 'completed' && t.status !== 'skipped')
        )
        if (firstIncomplete) setExpandedPhases(new Set([firstIncomplete.id]))
      } else {
        setError('Failed to load tasks')
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={loadTasks} />
  if (phases.length === 0) return <EmptyState />

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Your Tasks</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Complete tasks to build your business foundation
        </p>
      </div>
      {phases.map((phase) => (
        <PhaseAccordion
          key={phase.id}
          phase={phase}
          isExpanded={expandedPhases.has(phase.id)}
          onToggle={() => togglePhase(phase.id)}
        />
      ))}
    </div>
  )
}
