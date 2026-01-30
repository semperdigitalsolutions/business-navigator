/**
 * Chat Context Hook - Gathers context data for the AI
 * Extracts business and progress context from stores
 */
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { useOnboardingStore } from '@/features/onboarding/hooks/useOnboardingStore'
import type {
  BusinessCategory,
  BusinessProgress,
  CurrentStage,
  DashboardData,
  OnboardingData,
  TaskPhase,
  UserTask,
} from '@shared/types'

// Category display labels
export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  tech_saas: 'Tech/SaaS',
  service: 'Service Business',
  ecommerce: 'E-commerce',
  local: 'Local Business',
}

// Stage display labels
export const STAGE_LABELS: Record<CurrentStage, string> = {
  idea: 'Idea Stage',
  planning: 'Planning Stage',
  started: 'Already Started',
}

// Phase display labels
export const PHASE_LABELS: Record<TaskPhase, string> = {
  ideation: 'Ideation',
  legal: 'Foundation',
  financial: 'Financial Setup',
  launch_prep: 'Launch Prep',
}

export interface ChatContextData {
  // Business context
  businessName?: string
  businessCategory?: BusinessCategory
  stateCode?: string
  currentStage?: CurrentStage

  // Progress context
  currentPhase?: TaskPhase
  completedTasks: number
  totalTasks: number
  recentCompletedTask?: UserTask
  heroTask: UserTask | null

  // Computed values
  summaryParts: string[]
  hasContext: boolean
}

function findCurrentPhase(phases?: BusinessProgress['phases']): TaskPhase | undefined {
  if (!phases) return undefined
  const entry = Object.entries(phases).find(([_, phase]) => phase.status === 'in_progress')
  return entry?.[0] as TaskPhase | undefined
}

function findRecentCompletedTask(recentTasks?: UserTask[]): UserTask | undefined {
  return recentTasks?.find((t) => t.status === 'completed')
}

function buildSummaryParts(
  businessName?: string,
  currentPhase?: TaskPhase,
  completedTasks?: number
): string[] {
  const parts: string[] = []
  if (businessName) parts.push(businessName)
  if (currentPhase) parts.push(PHASE_LABELS[currentPhase])
  if (completedTasks && completedTasks > 0) parts.push(`${completedTasks} tasks done`)
  return parts
}

function extractBusinessContext(onboardingData: OnboardingData) {
  return {
    businessName: onboardingData?.businessName,
    businessCategory: onboardingData?.businessCategory,
    stateCode: onboardingData?.stateCode,
    currentStage: onboardingData?.currentStage,
  }
}

function extractProgressContext(dashboardData: DashboardData | null) {
  const progress = dashboardData?.businessProgress
  return {
    completedTasks: progress?.completedTasks ?? 0,
    totalTasks: progress?.totalTasks ?? 0,
    currentPhase: findCurrentPhase(progress?.phases),
    recentCompletedTask: findRecentCompletedTask(dashboardData?.recentTasks),
  }
}

export function useChatContext(): ChatContextData {
  const { dashboardData, heroTask } = useDashboardStore()
  const { data: onboardingData } = useOnboardingStore()

  const business = extractBusinessContext(onboardingData)
  const progressData = extractProgressContext(dashboardData)
  const summaryParts = buildSummaryParts(
    business.businessName,
    progressData.currentPhase,
    progressData.completedTasks
  )
  const hasContext = summaryParts.length > 0

  return {
    ...business,
    ...progressData,
    heroTask,
    summaryParts,
    hasContext,
  }
}
