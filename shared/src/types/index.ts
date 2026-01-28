/**
 * Shared TypeScript types for Business Navigator
 */

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  onboardingCompleted?: boolean
  onboardingCompletedAt?: Date
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Business formation types
export interface Business {
  id: string
  name: string
  type: BusinessType
  state: string
  status: BusinessStatus
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export enum BusinessType {
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  PARTNERSHIP = 'PARTNERSHIP',
}

export enum BusinessStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Onboarding types (Week 2)
export interface OnboardingData {
  businessName?: string
  businessCategory?: BusinessCategory
  currentStage?: CurrentStage
  stateCode?: string
  primaryGoals?: string[]
  timeline?: Timeline
  teamSize?: number
  fundingApproach?: FundingApproach
  previousExperience?: PreviousExperience
  primaryConcern?: PrimaryConcern
}

export type BusinessCategory = 'tech_saas' | 'service' | 'ecommerce' | 'local'
export type CurrentStage = 'idea' | 'planning' | 'started'
export type Timeline = 'asap' | 'soon' | 'later' | 'exploring'
export type FundingApproach = 'personal_savings' | 'investment' | 'loan' | 'multiple' | 'none'
export type PreviousExperience = 'first_business' | 'experienced'
export type PrimaryConcern = 'legal' | 'financial' | 'marketing' | 'product' | 'time'

export interface OnboardingSession {
  id: string
  userId: string
  businessName?: string
  businessCategory?: BusinessCategory
  currentStage?: CurrentStage
  stateCode?: string
  primaryGoals?: string[]
  timeline?: Timeline
  teamSize?: number
  fundingApproach?: FundingApproach
  previousExperience?: PreviousExperience
  primaryConcern?: PrimaryConcern
  currentStep: number
  stepsCompleted: number[]
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Business Plan types (Week 2)
export interface BusinessPlan {
  id: string
  userId: string
  businessId?: string
  onboardingSessionId?: string
  planSummary?: string
  recommendedEntityType?: BusinessType
  recommendedState?: string
  executiveSummary?: Record<string, any>
  phaseRecommendations?: Record<string, any>
  confidenceScore: number
  ideationScore: number
  legalScore: number
  financialScore: number
  launchPrepScore: number
  createdAt: Date
  updatedAt: Date
}

export interface ConfidenceScore {
  total: number
  ideation: number
  legal: number
  financial: number
  launchPrep: number
  calculatedAt: Date
}

// Task types (extended for Week 2 & 3)
export type TaskPhase = 'ideation' | 'legal' | 'financial' | 'launch_prep'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type TaskType = 'wizard' | 'checklist' | 'tool' | 'education' | 'external'

// Task list status (includes unlock state)
export type TaskListStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'skipped'

export interface TaskTemplate {
  id: string
  title: string
  description: string
  category: string
  priority: TaskPriority
  weekNumber: number
  estimatedHours: number
  dependencies: string[]
  weight: number
  phase: TaskPhase
  taskType: TaskType
  icon?: string
  metadata?: Record<string, any>
  createdAt: Date
}

// Task list item (for GET /api/tasks response)
export interface TaskListItem {
  id: string
  title: string
  description: string
  phase: TaskPhase
  estimatedTime: string
  type: TaskType
  status: TaskListStatus
  dependencies: string[]
  completedAt?: Date
  icon?: string
}

// Phase with tasks (for grouped response)
export interface TaskPhaseGroup {
  id: TaskPhase
  name: string
  tasks: TaskListItem[]
}

// GET /api/tasks response
export interface TaskListResponse {
  phases: TaskPhaseGroup[]
}

export interface UserTask {
  id: string
  userId: string
  businessId?: string
  templateId?: string
  title: string
  description: string
  category: string
  priority: TaskPriority
  status: TaskStatus
  completedAt?: Date
  dueDate?: Date
  priorityOrder: number
  isHeroTask: boolean
  skippedAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Key Decisions types (for dashboard summary)
export interface KeyDecision {
  id: string
  label: string
  value: string
  icon?: string
  status: 'decided' | 'pending' | 'needs_attention'
  category: 'business' | 'legal' | 'financial' | 'location'
  updatedAt?: Date
}

export interface KeyDecisions {
  decisions: KeyDecision[]
  completedCount: number
  totalCount: number
}

// Dashboard types (Week 2)
export interface DashboardData {
  greeting: string
  heroTask?: UserTask
  confidenceScore: ConfidenceScore
  keyDecisions?: KeyDecisions
  recentTasks: UserTask[]
  upcomingTasks: UserTask[]
  businessProgress: BusinessProgress
}

export interface BusinessProgress {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  completionPercentage: number
  phases: {
    ideation: PhaseProgress
    legal: PhaseProgress
    financial: PhaseProgress
    launchPrep: PhaseProgress
  }
}

export interface PhaseProgress {
  name: string
  score: number
  tasksCompleted: number
  tasksTotal: number
  status: 'not_started' | 'in_progress' | 'completed'
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
