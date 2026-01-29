import { useCallback, useEffect } from 'react'
import { AppShell, LeftSidebar, RightSidebar } from '@/components/layout'
import type { Phase, Task } from '@/components/layout/RightSidebar'
import {
  ChatHeader,
  ChatInput,
  ChatMessage,
  ChatOptionCard,
  ChatWelcome,
  type SuggestedAction,
} from '@/features/chat/components'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { Skeleton } from '@/components/skeletons'
import type { BusinessProgress, PhaseProgress, TaskPhase } from '@shared/types'

const SUGGESTED_ACTIONS: SuggestedAction[] = [
  { label: 'Draft Operating Agreement', icon: 'add', variant: 'primary' },
  { label: 'Research Competitors', icon: 'search' },
  { label: 'Brainstorm Names', icon: 'lightbulb' },
]

/** Maps business progress phases to the Phase[] format expected by RightSidebar */
function mapPhasesToSidebarFormat(businessProgress: BusinessProgress | undefined): Phase[] {
  if (!businessProgress?.phases) return []

  const phaseConfig: Record<TaskPhase, { title: string; icon: string }> = {
    ideation: { title: 'Phase 1: Foundation', icon: 'foundation' },
    legal: { title: 'Phase 2: Legal & Compliance', icon: 'policy' },
    financial: { title: 'Phase 3: Financials', icon: 'attach_money' },
    launch_prep: { title: 'Phase 4: Launch Prep', icon: 'rocket_launch' },
  }

  const phaseOrder: TaskPhase[] = ['ideation', 'legal', 'financial', 'launch_prep']

  return phaseOrder.map((phaseKey) => {
    const phase = businessProgress.phases[phaseKey] as PhaseProgress
    const config = phaseConfig[phaseKey]

    // Generate task items based on phase progress
    const tasks: Task[] = []
    const completedCount = phase.tasksCompleted
    const totalCount = phase.tasksTotal

    for (let i = 0; i < totalCount; i++) {
      let status: Task['status'] = 'pending'
      if (i < completedCount) {
        status = 'completed'
      } else if (i === completedCount && phase.status === 'in_progress') {
        status = 'in_progress'
      }

      tasks.push({
        id: `${phaseKey}-task-${i + 1}`,
        title: `Task ${i + 1}`,
        status,
      })
    }

    return {
      id: phaseKey,
      title: config.title,
      icon: config.icon,
      tasks,
      isExpanded: phase.status === 'in_progress',
    }
  })
}

/** Calculate current stage label from business progress */
function getStageLabel(businessProgress: BusinessProgress | undefined): string {
  if (!businessProgress?.phases) return 'Getting Started'

  const phaseOrder: TaskPhase[] = ['ideation', 'legal', 'financial', 'launch_prep']
  const phaseNames: Record<TaskPhase, string> = {
    ideation: 'Foundation',
    legal: 'Legal & Compliance',
    financial: 'Financials',
    launch_prep: 'Launch Prep',
  }

  for (let i = 0; i < phaseOrder.length; i++) {
    const phaseKey = phaseOrder[i]
    const phase = businessProgress.phases[phaseKey]
    if (phase.status === 'in_progress' || phase.status === 'not_started') {
      return `Stage ${i + 1}: ${phaseNames[phaseKey]}`
    }
  }

  return 'Complete'
}

function HomePageSkeleton() {
  return (
    <AppShell
      leftSidebar={
        <div className="flex h-full flex-col p-6">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="mb-2 h-4 w-24" />
          <div className="mt-auto">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      }
      rightSidebar={
        <div className="flex h-full flex-col p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="mb-6 h-2 w-full rounded-full" />
          <Skeleton className="mb-6 h-32 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 p-4 dark:border-zinc-700">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <Skeleton className="mb-6 h-24 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export function HomePage() {
  const { user } = useAuthStore()
  const { dashboardData, heroTask, isLoading, setDashboardData, setLoading, setError } =
    useDashboardStore()

  // Fetch dashboard data on mount
  const fetchDashboardData = useCallback(async () => {
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
  }, [setDashboardData, setError, setLoading])

  useEffect(() => {
    // Only fetch if we don't have data yet
    if (!dashboardData) {
      fetchDashboardData()
    }
  }, [dashboardData, fetchDashboardData])

  // Show loading skeleton while data is loading
  if (isLoading && !dashboardData) {
    return <HomePageSkeleton />
  }

  const userName = user?.firstName || 'there'
  const phases = mapPhasesToSidebarFormat(dashboardData?.businessProgress)
  const progressPercent = dashboardData?.businessProgress?.completionPercentage ?? 0
  const stageLabel = getStageLabel(dashboardData?.businessProgress)

  // Map hero task to recommended task format for sidebar
  const recommendedTask = heroTask
    ? {
        id: heroTask.id,
        title: heroTask.title,
        description: heroTask.description,
        icon: heroTask.metadata?.icon || 'task_alt',
      }
    : undefined

  return (
    <AppShell
      leftSidebar={<LeftSidebar userName={userName} userPlan="Pro Plan" />}
      rightSidebar={
        <RightSidebar
          stageLabel={stageLabel}
          progressPercent={progressPercent}
          recommendedTask={recommendedTask}
          phases={phases}
          onStartTask={(id) => console.warn('Start task:', id)}
          onViewRoadmap={() => console.warn('View roadmap')}
        />
      }
    >
      <ChatHeader title="Home" onShare={() => console.warn('Share clicked')} />

      <div className="hide-scrollbar flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <ChatWelcome />

          <div className="space-y-4">
            <ChatMessage
              role="user"
              content="I need help deciding between an LLC and a C-Corp for my tech startup. We plan to raise venture capital later this year."
            />

            <ChatMessage
              role="assistant"
              content={
                <>
                  <p>
                    If you plan to raise venture capital, a{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Delaware C-Corporation
                    </strong>{' '}
                    is almost universally required by institutional investors. While an LLC offers
                    tax flexibility, C-Corps are built for scale and equity distribution.
                  </p>
                  <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                    <ChatOptionCard
                      icon="account_balance"
                      title="Delaware C-Corp"
                      description="The standard for startups seeking VC. Optimized for complex equity and preferred stock."
                      variant="primary"
                    />
                    <ChatOptionCard
                      icon="payments"
                      title="LLC (Pass-through)"
                      description="Best for bootstrapped businesses. Avoids double taxation but complicates equity for VCs."
                      variant="secondary"
                    />
                  </div>
                </>
              }
            />
          </div>
        </div>
      </div>

      <ChatInput
        suggestedActions={SUGGESTED_ACTIONS}
        onSend={(msg) => console.warn('Send:', msg)}
        onActionClick={(action) => console.warn('Action:', action)}
      />
    </AppShell>
  )
}
