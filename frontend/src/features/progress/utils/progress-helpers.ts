/**
 * Progress Page Helper Functions
 * Utility functions for transforming dashboard data to progress page format
 */
import type { Phase } from '@/components/layout/RightSidebar'
import type {
  ConfidenceScore,
  DashboardData,
  PhaseProgress,
  TaskPhase,
  UserTask,
} from '@shared/types'

// Phase configuration for display
export const PHASE_CONFIG: Record<TaskPhase, { title: string; icon: string; stageNumber: number }> =
  {
    ideation: { title: 'Ideation', icon: 'lightbulb', stageNumber: 1 },
    legal: { title: 'Foundation', icon: 'gavel', stageNumber: 2 },
    financial: { title: 'Financial Setup', icon: 'account_balance', stageNumber: 3 },
    launch_prep: { title: 'Launch Prep', icon: 'rocket_launch', stageNumber: 4 },
  }

// Phase order for iteration
export const PHASE_ORDER: TaskPhase[] = ['ideation', 'legal', 'financial', 'launch_prep']

// Map phase status to stage status
export function getStageStatus(phase: PhaseProgress): 'completed' | 'in_progress' | 'locked' {
  if (phase.status === 'completed') return 'completed'
  if (phase.status === 'in_progress') return 'in_progress'
  return 'locked'
}

// Map confidence score to metric status
export function getMetricStatus(score: number): 'success' | 'warning' | 'default' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'default'
}

// Build sidebar phases from business progress
export function buildSidebarPhases(dashboardData: DashboardData | null): Phase[] {
  if (!dashboardData?.businessProgress?.phases) return []

  return PHASE_ORDER.map((phaseKey) => {
    const phase = dashboardData.businessProgress.phases[phaseKey]
    const config = PHASE_CONFIG[phaseKey]

    // Determine task statuses based on phase status
    let tasks: Phase['tasks']
    if (phase.status === 'completed') {
      tasks = [
        { id: `${phaseKey}-complete`, title: `${config.title} Complete`, status: 'completed' },
      ]
    } else if (phase.status === 'in_progress') {
      tasks = [
        {
          id: `${phaseKey}-progress`,
          title: `${phase.tasksCompleted}/${phase.tasksTotal} tasks`,
          status: 'in_progress',
        },
      ]
    } else {
      tasks = [{ id: `${phaseKey}-pending`, title: 'Not started', status: 'pending' }]
    }

    return {
      id: phaseKey,
      title: `Phase ${config.stageNumber}: ${config.title}`,
      icon: config.icon,
      tasks,
      isExpanded: phase.status === 'in_progress',
    }
  })
}

// Get current stage info from business progress
export function getCurrentStageInfo(dashboardData: DashboardData | null): {
  label: string
  percent: number
} {
  if (!dashboardData?.businessProgress?.phases) {
    return { label: 'Stage 1: Ideation', percent: 0 }
  }

  const phases = dashboardData.businessProgress.phases

  // Find current in-progress phase
  for (const phaseKey of PHASE_ORDER) {
    const phase = phases[phaseKey]
    if (phase.status === 'in_progress') {
      const config = PHASE_CONFIG[phaseKey]
      return {
        label: `Stage ${config.stageNumber}: ${config.title}`,
        percent: dashboardData.businessProgress.completionPercentage,
      }
    }
  }

  // All completed or none started
  const completionPercent = dashboardData.businessProgress.completionPercentage
  if (completionPercent >= 100) {
    return { label: 'Complete!', percent: 100 }
  }
  return { label: 'Stage 1: Ideation', percent: completionPercent }
}

// Build recommended task from hero task
export function getRecommendedTask(heroTask: UserTask | null):
  | {
      id: string
      title: string
      description: string
      icon: string
    }
  | undefined {
  if (!heroTask) return undefined
  return {
    id: heroTask.id,
    title: heroTask.title,
    description: heroTask.description,
    icon: (heroTask.metadata?.icon as string) || 'task_alt',
  }
}

// Get confidence scores mapped by category
export function getConfidenceScores(confidenceScore: ConfidenceScore | null) {
  return {
    ideation: confidenceScore?.ideation ?? 0,
    legal: confidenceScore?.legal ?? 0,
    financial: confidenceScore?.financial ?? 0,
    launchPrep: confidenceScore?.launchPrep ?? 0,
  }
}
