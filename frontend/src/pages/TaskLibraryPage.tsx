/**
 * TaskLibraryPage Component
 * Displays all tasks organized by phase with filtering capabilities
 * Uses real data from dashboard API
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, LeftSidebar } from '@/components/layout'
import { Icon } from '@/components/ui/Icon'
import { TaskCard, type TaskStatus } from '@/features/tasks/components/TaskCard'
import { PhaseSection } from '@/features/tasks/components/PhaseSection'
import { ActiveCategoryPanel } from '@/features/tasks/components/ActiveCategoryPanel'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import type { PhaseProgress, TaskPhase, UserTask } from '@shared/types'

// Map backend task status to TaskCard status
function mapTaskStatus(status: string): TaskStatus {
  if (status === 'in_progress') return 'in_progress'
  if (status === 'completed') return 'ready'
  return 'pending'
}

// Get action label based on task status
function getActionLabel(status: string): string {
  const labels: Record<string, string> = {
    in_progress: 'Continue',
    pending: 'Start',
    blocked: 'View',
    completed: 'Review',
  }
  return labels[status] || 'View'
}

// Phase display configuration
const PHASE_CONFIG: Record<TaskPhase, { number: number; title: string }> = {
  ideation: { number: 1, title: 'Foundation' },
  legal: { number: 2, title: 'Legal & IP' },
  financial: { number: 3, title: 'Financial' },
  launch_prep: { number: 4, title: 'Launch Preparation' },
}

// Group tasks by phase
function groupTasksByPhase(tasks: UserTask[]): Record<TaskPhase, UserTask[]> {
  const grouped: Record<TaskPhase, UserTask[]> = {
    ideation: [],
    legal: [],
    financial: [],
    launch_prep: [],
  }
  for (const task of tasks) {
    const phase = (task.metadata?.phase as TaskPhase) || 'ideation'
    grouped[phase]?.push(task)
  }
  return grouped
}

// Get active phase from progress data
function getActivePhase(
  phases?: Record<string, PhaseProgress>
): { phase: TaskPhase; progress: PhaseProgress } | null {
  if (!phases) return null
  const phaseOrder: TaskPhase[] = ['ideation', 'legal', 'financial', 'launch_prep']
  for (const phase of phaseOrder) {
    const progress = phases[phase]
    if (progress?.status !== 'completed') return { phase, progress }
  }
  return null
}

// Deduplicate tasks by id
function deduplicateTasks(tasks: UserTask[]): UserTask[] {
  const seen = new Set<string>()
  return tasks.filter((task) => {
    if (seen.has(task.id)) return false
    seen.add(task.id)
    return true
  })
}

// Custom hook for task library data and actions
function useTaskLibraryData() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    dashboardData,
    heroTask,
    isLoading,
    error,
    setDashboardData,
    setLoading,
    setError,
    shouldRefresh,
  } = useDashboardStore()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getDashboard()
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setError(response.error || 'Failed to load tasks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [setDashboardData, setError, setLoading])

  useEffect(() => {
    if (!dashboardData || shouldRefresh()) fetchData()
  }, [dashboardData, fetchData, shouldRefresh])

  const allTasks = useMemo(() => {
    if (!dashboardData) return []
    const tasks: UserTask[] = []
    if (heroTask) tasks.push(heroTask)
    if (dashboardData.recentTasks) tasks.push(...dashboardData.recentTasks)
    if (dashboardData.upcomingTasks) tasks.push(...dashboardData.upcomingTasks)
    return deduplicateTasks(tasks)
  }, [dashboardData, heroTask])

  const tasksByPhase = useMemo(() => groupTasksByPhase(allTasks), [allTasks])
  const activePhaseInfo = useMemo(
    () => getActivePhase(dashboardData?.businessProgress?.phases),
    [dashboardData?.businessProgress?.phases]
  )

  const handleTaskAction = useCallback((taskId: string) => navigate(`/tasks/${taskId}`), [navigate])
  const handleViewDetails = useCallback(() => {
    if (heroTask) navigate(`/tasks/${heroTask.id}`)
  }, [heroTask, navigate])
  const handleViewRoadmap = useCallback(() => navigate('/roadmap'), [navigate])

  return {
    user,
    dashboardData,
    heroTask,
    isLoading,
    error,
    allTasks,
    tasksByPhase,
    activePhaseInfo,
    fetchData,
    handleTaskAction,
    handleViewDetails,
    handleViewRoadmap,
  }
}

export function TaskLibraryPage() {
  const {
    user,
    dashboardData,
    heroTask,
    isLoading,
    error,
    allTasks,
    tasksByPhase,
    activePhaseInfo,
    fetchData,
    handleTaskAction,
    handleViewDetails,
    handleViewRoadmap,
  } = useTaskLibraryData()

  const [_filterOpen, setFilterOpen] = useState(false)
  const userName = user?.firstName || 'User'

  const activePhaseProgress = useMemo(() => {
    if (!activePhaseInfo) return { progress: 0, completed: 0, total: 0 }
    const { progress } = activePhaseInfo
    const pct =
      progress.tasksTotal > 0
        ? Math.round((progress.tasksCompleted / progress.tasksTotal) * 100)
        : 0
    return { progress: pct, completed: progress.tasksCompleted, total: progress.tasksTotal }
  }, [activePhaseInfo])

  const activePhaseMilestones = useMemo(() => {
    if (!activePhaseInfo) return []
    const phaseTasks = tasksByPhase[activePhaseInfo.phase] || []
    return phaseTasks
      .slice(0, 4)
      .map((task) => ({ label: task.title, completed: task.status === 'completed' }))
  }, [activePhaseInfo, tasksByPhase])

  const activePhaseName = activePhaseInfo
    ? `Phase ${PHASE_CONFIG[activePhaseInfo.phase].number}: ${PHASE_CONFIG[activePhaseInfo.phase].title}`
    : 'Phase 1: Foundation'

  const sidebar = <LeftSidebar userName={userName} userPlan="Pro Plan" />

  if (isLoading && !dashboardData) {
    return (
      <AppShell leftSidebar={sidebar}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <p className="text-slate-500 dark:text-slate-400">Loading tasks...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error && !dashboardData) {
    return (
      <AppShell leftSidebar={sidebar}>
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mb-4 rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      leftSidebar={sidebar}
      rightSidebar={
        <ActiveCategoryPanel
          phaseName={activePhaseName}
          progress={activePhaseProgress.progress}
          completedCount={activePhaseProgress.completed}
          totalCount={activePhaseProgress.total}
          currentTask={
            heroTask ? { title: heroTask.title, description: heroTask.description } : undefined
          }
          milestones={activePhaseMilestones}
          onViewDetails={handleViewDetails}
          onViewRoadmap={handleViewRoadmap}
        />
      }
    >
      <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Library</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Execute your roadmap with AI-guided workflows. Organized by business phase.
            </p>
          </div>
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
          >
            <Icon name="filter_list" size={18} />
            Filter
          </button>
        </div>
      </header>

      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        {(Object.keys(PHASE_CONFIG) as TaskPhase[]).map((phase) => {
          const config = PHASE_CONFIG[phase]
          const phaseTasks = tasksByPhase[phase]
          if (phaseTasks.length === 0) return null
          return (
            <PhaseSection
              key={phase}
              phaseNumber={config.number}
              title={config.title}
              taskCount={phaseTasks.length}
              isActive={activePhaseInfo?.phase === phase}
            >
              {phaseTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={mapTaskStatus(task.status)}
                  actionLabel={getActionLabel(task.status)}
                  onAction={() => handleTaskAction(task.id)}
                />
              ))}
            </PhaseSection>
          )
        })}

        {allTasks.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📋</div>
            <h3 className="mb-2 text-lg font-medium text-slate-950 dark:text-white">
              No tasks yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Complete your onboarding to generate personalized tasks.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
