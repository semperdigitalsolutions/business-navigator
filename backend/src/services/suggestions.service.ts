/**
 * Suggestions Service
 * Generates context-aware suggested questions for the chat
 * Issue #96: Context-aware suggested questions
 */
import { supabase } from '@/config/database.js'
import type {
  BusinessCategory,
  CurrentStage,
  FundingApproach,
  PrimaryConcern,
  TaskPhase,
} from '@shared/types'
import { QUESTION_TEMPLATES, type SuggestedQuestion } from './suggestions-templates.js'

// Re-export for consumers
export type { SuggestedQuestion } from './suggestions-templates.js'

export interface SuggestionContext {
  userId: string
  businessId?: string
  businessName?: string
  businessType?: string
  stateCode?: string
  currentPhase?: TaskPhase
  primaryConcern?: PrimaryConcern
  fundingApproach?: FundingApproach
  businessCategory?: BusinessCategory
  currentStage?: CurrentStage
  pendingTaskTitles?: string[]
  recentlyCompletedTaskTitles?: string[]
  hasOnboarded?: boolean
}

export class SuggestionsService {
  /**
   * Get context-aware suggested questions
   * Returns 3-5 questions based on user's current context
   */
  async getSuggestions(
    userId: string,
    businessId?: string
  ): Promise<{ suggestions: SuggestedQuestion[] }> {
    const context = await this.buildContext(userId, businessId)
    const suggestions = this.selectQuestions(context)
    return { suggestions }
  }

  private async buildContext(userId: string, businessId?: string): Promise<SuggestionContext> {
    const context: SuggestionContext = { userId, businessId, hasOnboarded: false }

    const [onboardingData, businessData, tasksData] = await Promise.all([
      this.getOnboardingData(userId),
      businessId ? this.getBusinessData(businessId, userId) : null,
      this.getTasksData(userId, businessId),
    ])

    if (onboardingData) {
      context.hasOnboarded = onboardingData.completed
      context.businessName = onboardingData.business_name || undefined
      context.stateCode = onboardingData.state_code || undefined
      context.primaryConcern = onboardingData.primary_concern || undefined
      context.fundingApproach = onboardingData.funding_approach || undefined
      context.businessCategory = onboardingData.business_category || undefined
      context.currentStage = onboardingData.current_stage || undefined
    }

    if (businessData) {
      context.businessName = businessData.name
      context.businessType = businessData.type
      context.stateCode = businessData.state
    }

    if (tasksData) {
      context.currentPhase = tasksData.currentPhase
      context.pendingTaskTitles = tasksData.pendingTasks
      context.recentlyCompletedTaskTitles = tasksData.recentlyCompleted
    }

    return context
  }

  private async getOnboardingData(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) return null
    return data
  }

  private async getBusinessData(businessId: string, userId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('owner_id', userId)
      .single()
    if (error) return null
    return data
  }

  private async getTasksData(userId: string, businessId?: string) {
    let query = supabase
      .from('user_tasks')
      .select(
        `id, status, title, updated_at, template_id,
        task_templates!user_tasks_template_id_fkey (phase, title)`
      )
      .eq('user_id', userId)

    if (businessId) query = query.eq('business_id', businessId)
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(20)

    if (error || !data) {
      return { currentPhase: undefined, pendingTasks: [], recentlyCompleted: [] }
    }

    const inProgress = data.filter((t) => t.status === 'in_progress')
    const pending = data.filter((t) => t.status === 'pending')
    const completed = data.filter((t) => t.status === 'completed')

    let currentPhase: TaskPhase | undefined
    const firstActive = inProgress[0] || pending[0]
    if (firstActive?.task_templates) {
      currentPhase = (firstActive.task_templates as unknown as { phase: TaskPhase }).phase
    }

    const getTitle = (t: (typeof data)[0]) =>
      (t.task_templates as unknown as { title: string } | null)?.title || t.title

    return {
      currentPhase,
      pendingTasks: pending.slice(0, 3).map(getTitle),
      recentlyCompleted: completed.slice(0, 3).map(getTitle),
    }
  }

  private selectQuestions(context: SuggestionContext): SuggestedQuestion[] {
    if (!context.hasOnboarded) {
      return this.personalizeQuestions(QUESTION_TEMPLATES.pre_onboarding.slice(0, 4), context)
    }

    const selected: SuggestedQuestion[] = []
    const phase = context.currentPhase || 'ideation'

    // Phase questions
    const phaseQs = QUESTION_TEMPLATES[phase] || []
    selected.push(...phaseQs.slice(0, 2))

    // Concern-specific
    if (context.primaryConcern === 'legal' && phase !== 'legal') {
      selected.push(QUESTION_TEMPLATES.legal[0])
    } else if (context.primaryConcern === 'financial' && phase !== 'financial') {
      selected.push(QUESTION_TEMPLATES.financial[0])
    }

    // Funding-specific
    if (context.fundingApproach === 'investment') {
      selected.push(...(QUESTION_TEMPLATES.funding_investment || []).slice(0, 1))
    } else if (context.fundingApproach === 'loan') {
      selected.push(...(QUESTION_TEMPLATES.funding_loan || []).slice(0, 1))
    }

    // Category-specific
    if (context.businessCategory && QUESTION_TEMPLATES[context.businessCategory]) {
      selected.push(...QUESTION_TEMPLATES[context.businessCategory].slice(0, 1))
    }

    // Dynamic task question
    if (context.pendingTaskTitles?.length) {
      selected.push({
        id: 'tasks-dynamic',
        text: `How do I complete "${context.pendingTaskTitles[0]}"?`,
        category: 'tasks',
        priority: 5,
      })
    }

    const unique = this.deduplicateQuestions(selected)
    const sorted = unique.sort((a, b) => a.priority - b.priority).slice(0, 4)
    return this.personalizeQuestions(sorted, context)
  }

  private deduplicateQuestions(questions: SuggestedQuestion[]): SuggestedQuestion[] {
    const seen = new Set<string>()
    return questions.filter((q) => {
      if (seen.has(q.id)) return false
      seen.add(q.id)
      return true
    })
  }

  private personalizeQuestions(
    questions: SuggestedQuestion[],
    context: SuggestionContext
  ): SuggestedQuestion[] {
    const businessName = context.businessName || 'my business'
    const state = context.stateCode || 'my state'
    return questions.map((q) => ({
      ...q,
      text: q.text.replace('{businessName}', businessName).replace('{state}', state),
    }))
  }
}

export const suggestionsService = new SuggestionsService()
