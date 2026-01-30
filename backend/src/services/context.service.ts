/**
 * Context Service
 * Generates rich context payloads for AI chat based on user's current state
 * Issue #95: Build context payload generator
 */
import { supabase } from '@/config/database.js'
import type {
  ChatContext,
  ChatContextBusiness,
  ChatContextHeroTask,
  ChatContextPendingDecision,
  ChatContextProgress,
  ChatContextRecentActivity,
  ChatContextRecentTask,
  ChatContextSummary,
  ChatContextUser,
  TaskPhase,
} from '@shared/types'
import { formatContextSummary } from './context-formatters.js'

// Phase order for determining current phase
const PHASE_ORDER: TaskPhase[] = ['ideation', 'legal', 'financial', 'launch_prep']

export class ContextService {
  /**
   * Generate a comprehensive chat context for the AI
   */
  async generateChatContext(userId: string, businessId?: string): Promise<ChatContextSummary> {
    const [user, business, progress, recentActivity, pendingDecisions] = await Promise.all([
      this.getUserContext(userId),
      this.getBusinessContext(userId, businessId),
      this.getProgressContext(userId, businessId),
      this.getRecentActivityContext(userId, businessId),
      this.getPendingDecisions(userId),
    ])

    const context: ChatContext = {
      user,
      business,
      progress,
      recentActivity,
      pendingDecisions,
      generatedAt: new Date(),
    }

    const formattedSummary = formatContextSummary(context)

    return { context, formattedSummary }
  }

  private async getUserContext(userId: string): Promise<ChatContextUser> {
    const { data: user } = await supabase
      .from('users')
      .select('first_name, last_name, subscription_tier, created_at')
      .eq('id', userId)
      .single()

    const { data: onboarding } = await supabase
      .from('onboarding_sessions')
      .select('previous_experience')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const accountAgeDays = user
      ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      name: user ? `${user.first_name} ${user.last_name}`.trim() : 'User',
      subscriptionTier: user?.subscription_tier || 'free',
      accountAgeDays,
      isFirstTimeBusiness: onboarding?.previous_experience === 'first_business',
    }
  }

  private async getBusinessContext(
    userId: string,
    businessId?: string
  ): Promise<ChatContextBusiness | null> {
    const { data: onboarding } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!onboarding) return null

    let entityType: string | null = null
    if (businessId) {
      const { data: business } = await supabase
        .from('businesses')
        .select('type')
        .eq('id', businessId)
        .single()
      entityType = business?.type || null
    }

    return {
      name: onboarding.business_name || 'Unnamed Business',
      category: onboarding.business_category,
      state: onboarding.state_code,
      currentStage: onboarding.current_stage,
      entityType,
      timeline: onboarding.timeline,
      fundingApproach: onboarding.funding_approach,
    }
  }

  private async getProgressContext(
    userId: string,
    businessId?: string
  ): Promise<ChatContextProgress> {
    let taskQuery = supabase
      .from('user_tasks')
      .select('id, status, template_id')
      .eq('user_id', userId)

    if (businessId) taskQuery = taskQuery.eq('business_id', businessId)
    const { data: userTasks } = await taskQuery

    const templateIds = (userTasks || []).map((t) => t.template_id).filter(Boolean) as string[]
    const phaseMap = new Map<string, TaskPhase>()

    if (templateIds.length > 0) {
      const { data: templates } = await supabase
        .from('task_templates')
        .select('id, phase')
        .in('id', templateIds)
      templates?.forEach((t) => phaseMap.set(t.id, t.phase as TaskPhase))
    }

    const phaseCounts = {
      ideation: { completed: 0, total: 0 },
      legal: { completed: 0, total: 0 },
      financial: { completed: 0, total: 0 },
      launch_prep: { completed: 0, total: 0 },
    }

    userTasks?.forEach((task) => {
      const phase = task.template_id ? phaseMap.get(task.template_id) : null
      if (phase && phaseCounts[phase]) {
        phaseCounts[phase].total++
        if (task.status === 'completed') phaseCounts[phase].completed++
      }
    })

    const phaseProgress = {
      ideation: this.calcProgress(phaseCounts.ideation),
      legal: this.calcProgress(phaseCounts.legal),
      financial: this.calcProgress(phaseCounts.financial),
      launchPrep: this.calcProgress(phaseCounts.launch_prep),
    }

    const totalTasks = userTasks?.length || 0
    const tasksCompleted = userTasks?.filter((t) => t.status === 'completed').length || 0
    const completionPercentage =
      totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0

    return {
      currentPhase: this.determineCurrentPhase(phaseProgress),
      completionPercentage,
      tasksCompleted,
      totalTasks,
      phaseProgress,
    }
  }

  private calcProgress(counts: { completed: number; total: number }): number {
    return counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0
  }

  private determineCurrentPhase(phaseProgress: ChatContextProgress['phaseProgress']): TaskPhase {
    const progressMap: Record<TaskPhase, number> = {
      ideation: phaseProgress.ideation,
      legal: phaseProgress.legal,
      financial: phaseProgress.financial,
      launch_prep: phaseProgress.launchPrep,
    }
    for (const phase of PHASE_ORDER) {
      if (progressMap[phase] < 100) return phase
    }
    return 'launch_prep'
  }

  private async getRecentActivityContext(
    userId: string,
    businessId?: string
  ): Promise<ChatContextRecentActivity> {
    let completedQuery = supabase
      .from('user_tasks')
      .select('id, title, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(3)

    if (businessId) completedQuery = completedQuery.eq('business_id', businessId)
    const { data: completedTasks } = await completedQuery

    const lastCompletedTasks: ChatContextRecentTask[] = (completedTasks || [])
      .filter((t) => t.completed_at !== null)
      .map((t) => ({ id: t.id, title: t.title, completedAt: new Date(t.completed_at as string) }))

    const heroTask = await this.getHeroTask(userId, businessId)

    return { lastCompletedTasks, heroTask }
  }

  private async getHeroTask(
    userId: string,
    businessId?: string
  ): Promise<ChatContextHeroTask | null> {
    const { data: heroTaskId } = await supabase.rpc('get_hero_task', {
      p_user_id: userId,
      p_business_id: businessId || null,
    })

    if (!heroTaskId) return null

    const { data: heroTaskData } = await supabase
      .from('user_tasks')
      .select('id, title, description, template_id')
      .eq('id', heroTaskId)
      .single()

    if (!heroTaskData) return null

    let phase: TaskPhase = 'ideation'
    if (heroTaskData.template_id) {
      const { data: template } = await supabase
        .from('task_templates')
        .select('phase')
        .eq('id', heroTaskData.template_id)
        .single()
      phase = (template?.phase as TaskPhase) || 'ideation'
    }

    return {
      id: heroTaskData.id,
      title: heroTaskData.title,
      description: heroTaskData.description || '',
      phase,
    }
  }

  private async getPendingDecisions(userId: string): Promise<ChatContextPendingDecision[]> {
    const { data: onboarding } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!onboarding) {
      return [
        { id: 'business-name', label: 'Business Name', category: 'business' },
        { id: 'entity-type', label: 'Entity Type', category: 'legal' },
        { id: 'formation-state', label: 'State of Formation', category: 'location' },
        { id: 'business-category', label: 'Business Category', category: 'business' },
        { id: 'funding-approach', label: 'Funding Approach', category: 'financial' },
      ]
    }

    const pending: ChatContextPendingDecision[] = []
    if (!onboarding.business_name) {
      pending.push({ id: 'business-name', label: 'Business Name', category: 'business' })
    }
    if (!onboarding.state_code) {
      pending.push({ id: 'formation-state', label: 'State of Formation', category: 'location' })
    }
    if (!onboarding.business_category) {
      pending.push({ id: 'business-category', label: 'Business Category', category: 'business' })
    }
    if (!onboarding.funding_approach) {
      pending.push({ id: 'funding-approach', label: 'Funding Approach', category: 'financial' })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('type')
      .eq('owner_id', userId)
      .limit(1)
      .single()

    if (!business?.type) {
      pending.push({ id: 'entity-type', label: 'Entity Type', category: 'legal' })
    }

    return pending
  }
}

export const contextService = new ContextService()
