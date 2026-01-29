/**
 * AppShellLayout - Three-column layout wrapper for authenticated routes
 * Uses AppShell with LeftSidebar (user data) and RightSidebar (business progress)
 */
import { useCallback, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppShell, LeftSidebar, RightSidebar, type Phase } from '@/components/layout'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'

/**
 * Map phase key to display configuration
 */
const PHASE_CONFIG: Record<string, { title: string; icon: string }> = {
  ideation: { title: 'Phase 1: Foundation', icon: 'foundation' },
  legal: { title: 'Phase 2: Legal & Compliance', icon: 'policy' },
  financial: { title: 'Phase 3: Financials', icon: 'attach_money' },
  launchPrep: { title: 'Phase 4: Launch Prep', icon: 'rocket_launch' },
}

/**
 * Convert dashboard phases data to RightSidebar format
 */
function mapPhasesToSidebarFormat(
  phases: Record<
    string,
    { name: string; status: string; tasksCompleted: number; tasksTotal: number }
  >
): Phase[] {
  return Object.entries(phases).map(([key, phase]) => {
    const config = PHASE_CONFIG[key] || { title: phase.name, icon: 'task' }

    // Generate placeholder tasks based on completion counts
    const tasks = []
    for (let i = 0; i < phase.tasksCompleted; i++) {
      tasks.push({
        id: `${key}-completed-${i}`,
        title: `${phase.name} Task ${i + 1}`,
        status: 'completed' as const,
      })
    }
    // Add in-progress task if phase is in progress
    if (phase.status === 'in_progress' && phase.tasksTotal > phase.tasksCompleted) {
      tasks.push({
        id: `${key}-in-progress`,
        title: `${phase.name} Current Task`,
        status: 'in_progress' as const,
      })
    }
    // Add pending tasks
    const pendingCount =
      phase.tasksTotal - phase.tasksCompleted - (phase.status === 'in_progress' ? 1 : 0)
    for (let i = 0; i < Math.max(0, pendingCount); i++) {
      tasks.push({
        id: `${key}-pending-${i}`,
        title: `${phase.name} Task ${phase.tasksCompleted + (phase.status === 'in_progress' ? 2 : 1) + i}`,
        status: 'pending' as const,
      })
    }

    return {
      id: key,
      title: config.title,
      icon: config.icon,
      tasks,
      isExpanded: phase.status === 'in_progress',
    }
  })
}

/**
 * Determine current stage label based on phases
 */
function getStageLabel(phases: Record<string, { status: string }>): string {
  const phaseOrder = ['ideation', 'legal', 'financial', 'launchPrep']
  for (const [index, key] of phaseOrder.entries()) {
    if (phases[key]?.status === 'in_progress') {
      return `Stage ${index + 1}: ${PHASE_CONFIG[key]?.title.split(': ')[1] || key}`
    }
  }
  // Check if all completed
  const allCompleted = phaseOrder.every((key) => phases[key]?.status === 'completed')
  if (allCompleted) {
    return 'Launch Ready!'
  }
  return 'Stage 1: Foundation'
}

export function AppShellLayout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { dashboardData, heroTask, shouldRefresh, setDashboardData, setLoading, setError } =
    useDashboardStore()

  // Fetch dashboard data on mount if not already loaded or stale
  const fetchDashboardData = useCallback(async () => {
    if (!shouldRefresh() && dashboardData) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.getDashboard()
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setError(response.error || 'Failed to load dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [dashboardData, setDashboardData, setError, setLoading, shouldRefresh])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Prepare user data for LeftSidebar
  const userName = user?.firstName || 'User'
  const userAvatar = user?.avatarUrl
  // Plan is not in User type yet, default to 'Free Plan'
  const userPlan = 'Free Plan'

  // Prepare business data for RightSidebar
  const businessProgress = dashboardData?.businessProgress
  const progressPercent = businessProgress?.completionPercentage ?? 0
  const phases = businessProgress?.phases ? mapPhasesToSidebarFormat(businessProgress.phases) : []
  const stageLabel = businessProgress?.phases
    ? getStageLabel(businessProgress.phases)
    : 'Stage 1: Foundation'

  // Map hero task to recommended task format
  const recommendedTask = heroTask
    ? {
        id: heroTask.id,
        title: heroTask.title,
        description: heroTask.description,
        icon:
          heroTask.category === 'legal'
            ? 'gavel'
            : heroTask.category === 'financial'
              ? 'attach_money'
              : 'task',
      }
    : undefined

  const handleStartTask = (taskId: string) => {
    // Navigate to task or open task modal
    navigate(`/tasks/${taskId}`)
  }

  const handleViewRoadmap = () => {
    navigate('/progress')
  }

  return (
    <AppShell
      leftSidebar={<LeftSidebar userName={userName} userAvatar={userAvatar} userPlan={userPlan} />}
      rightSidebar={
        <RightSidebar
          stageLabel={stageLabel}
          progressPercent={progressPercent}
          recommendedTask={recommendedTask}
          phases={phases}
          onStartTask={handleStartTask}
          onViewRoadmap={handleViewRoadmap}
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
