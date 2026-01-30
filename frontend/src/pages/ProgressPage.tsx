import { useCallback, useEffect } from 'react'
import { Icon } from '@/components/ui/Icon'
import { StageCard } from '@/features/progress/components/StageCard'
import {
  FoundationContent,
  GenericStageContent,
  IdeationContent,
} from '@/features/progress/components/StageContent'
import { getStageStatus } from '@/features/progress/utils/progress-helpers'
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'

export function ProgressPage() {
  const {
    dashboardData,
    heroTask,
    confidenceScore,
    isLoading,
    setDashboardData,
    setLoading,
    setError,
  } = useDashboardStore()

  const fetchDashboardData = useCallback(async () => {
    if (dashboardData) return
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
  }, [dashboardData, setDashboardData, setError, setLoading])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const phases = dashboardData?.businessProgress?.phases

  if (isLoading && !dashboardData) {
    return <LoadingState />
  }

  return (
    <>
      <ProgressHeader />
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {phases ? (
            <>
              <StageCard stageNumber={1} title="Ideation" status={getStageStatus(phases.ideation)}>
                <IdeationContent
                  phase={phases.ideation}
                  ideationScore={confidenceScore?.ideation ?? 0}
                />
              </StageCard>
              <StageCard stageNumber={2} title="Foundation" status={getStageStatus(phases.legal)}>
                <FoundationContent
                  phase={phases.legal}
                  legalScore={confidenceScore?.legal ?? 0}
                  financialScore={confidenceScore?.financial ?? 0}
                  launchPrepScore={confidenceScore?.launchPrep ?? 0}
                  heroTask={heroTask}
                />
              </StageCard>
              <StageCard
                stageNumber={3}
                title="Financial Setup"
                status={getStageStatus(phases.financial)}
              >
                <GenericStageContent
                  phase={phases.financial}
                  completedText="Financial infrastructure is set up and operational."
                  inProgressText="Setting up banking, accounting, and financial projections."
                  lockedText="Complete Foundation to unlock Financial Setup tasks."
                />
              </StageCard>
              <StageCard
                stageNumber={4}
                title="Launch Prep"
                status={getStageStatus(phases.launchPrep)}
              >
                <GenericStageContent
                  phase={phases.launchPrep}
                  completedText="Launch preparation complete. Ready for market!"
                  inProgressText="Finalizing domain strategy, MVP beta testing, and marketing."
                  lockedText="Complete Financial Setup to unlock Launch Prep tasks."
                />
              </StageCard>
            </>
          ) : (
            <FallbackStages />
          )}
        </div>
      </div>
    </>
  )
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Icon
          name="hourglass_empty"
          size={48}
          className="mx-auto mb-4 animate-spin text-slate-400"
        />
        <p className="text-slate-500">Loading progress...</p>
      </div>
    </div>
  )
}

function ProgressHeader() {
  return (
    <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-zinc-800">
            <Icon name="show_chart" size={18} className="text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Progress View
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Growth Path</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track milestones and unlock next stages of your venture.
            </p>
          </div>
        </div>
        <HeaderActions />
      </div>
    </header>
  )
}

function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-lg border border-slate-200 dark:border-zinc-700">
        <button className="rounded-l-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 dark:bg-zinc-800 dark:text-white">
          Timeline
        </button>
        <button className="rounded-r-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-zinc-700">
          Gantt View
        </button>
      </div>
      <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800">
        <Icon name="download" size={18} />
        Export Report
      </button>
    </div>
  )
}

function FallbackStages() {
  return (
    <>
      <StageCard stageNumber={1} title="Ideation" status="in_progress">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Start your business journey by completing the onboarding questionnaire.
        </p>
      </StageCard>
      <StageCard stageNumber={2} title="Foundation" status="locked">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete Ideation to unlock Foundation tasks.
        </p>
      </StageCard>
      <StageCard stageNumber={3} title="Financial Setup" status="locked">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete Foundation to unlock Financial Setup tasks.
        </p>
      </StageCard>
      <StageCard stageNumber={4} title="Launch Prep" status="locked">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete Financial Setup to unlock Launch Prep tasks.
        </p>
      </StageCard>
    </>
  )
}
