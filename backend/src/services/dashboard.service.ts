/**
 * Dashboard Service
 * Aggregates data for dashboard display
 */
import { supabase } from '@/config/database.js'
import { keyDecisionsService } from '@/services/key-decisions.service.js'
import type {
  DashboardData,
  UserTask,
  ConfidenceScore,
  BusinessProgress,
  PhaseProgress,
  TaskPhase,
  TaskStatus,
  TaskPriority,
} from '@shared/types'

export class DashboardService {
  /**
   * Get aggregated dashboard data in single query
   * Optimized for dashboard initial load
   */
  async getDashboardData(userId: string, businessId?: string): Promise<DashboardData> {
    // Fetch data in parallel
    const [heroTaskResult, confidenceResult, tasksResult, userResult, keyDecisionsResult] =
      await Promise.all([
        this.getHeroTask(userId, businessId),
        this.getConfidenceScore(userId, businessId),
        this.getTasks(userId, businessId),
        this.getUserInfo(userId),
        keyDecisionsService.getKeyDecisions(userId),
      ])

    // Calculate business progress from tasks
    const businessProgress = this.calculateBusinessProgress(tasksResult)

    // Generate personalized greeting
    const greeting = this.generateGreeting(userResult)

    return {
      greeting,
      heroTask: heroTaskResult,
      confidenceScore: confidenceResult,
      keyDecisions: keyDecisionsResult,
      recentTasks: tasksResult.filter((t) => t.status === 'completed').slice(0, 5),
      upcomingTasks: tasksResult.filter((t) => t.status === 'pending').slice(0, 5),
      businessProgress,
    }
  }

  /**
   * Get hero task (next recommended action)
   */
  async getHeroTask(userId: string, businessId?: string): Promise<UserTask | undefined> {
    // Call the database function to get hero task
    const { data: heroTaskId, error: functionError } = await supabase.rpc('get_hero_task', {
      p_user_id: userId,
      p_business_id: businessId || null,
    })

    if (functionError) {
      console.error('Error getting hero task:', functionError)
      return undefined
    }

    if (!heroTaskId) {
      return undefined
    }

    // Fetch the full task details
    const { data: task, error } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('id', heroTaskId)
      .single()

    if (error || !task) {
      return undefined
    }

    return this.mapDbToTask(task)
  }

  /**
   * Get confidence score with phase breakdown
   */
  async getConfidenceScore(userId: string, businessId?: string): Promise<ConfidenceScore> {
    // Call the database function to calculate confidence
    const { data, error } = await supabase.rpc('calculate_confidence_score', {
      p_user_id: userId,
      p_business_id: businessId || null,
    })

    if (error) {
      console.error('Error calculating confidence score:', error)
      // Return default scores if calculation fails
      return {
        total: 0,
        ideation: 0,
        legal: 0,
        financial: 0,
        launchPrep: 0,
        calculatedAt: new Date(),
      }
    }

    // Cast data to expected shape from DB function
    const score = data as {
      total: number
      ideation: number
      legal: number
      financial: number
      launch_prep: number
      calculated_at: string
    } | null

    if (!score) {
      return {
        total: 0,
        ideation: 0,
        legal: 0,
        financial: 0,
        launchPrep: 0,
        calculatedAt: new Date(),
      }
    }

    return {
      total: score.total,
      ideation: score.ideation,
      legal: score.legal,
      financial: score.financial,
      launchPrep: score.launch_prep,
      calculatedAt: new Date(score.calculated_at),
    }
  }

  /**
   * Get all tasks for user
   */
  async getTasks(userId: string, businessId?: string): Promise<UserTask[]> {
    let query = supabase.from('user_tasks').select('*').eq('user_id', userId)

    if (businessId) {
      query = query.eq('business_id', businessId)
    }

    const { data, error } = await query.order('priority_order', { ascending: false })

    if (error) {
      throw new Error(`Failed to get tasks: ${error.message}`)
    }

    return data.map((task) => this.mapDbToTask(task))
  }

  /**
   * Get user info for greeting
   */
  private async getUserInfo(userId: string): Promise<{ firstName: string }> {
    const { data, error } = await supabase
      .from('users')
      .select('first_name')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return { firstName: 'there' }
    }

    return { firstName: data.first_name }
  }

  /**
   * Generate personalized greeting based on time of day
   */
  private generateGreeting(user: { firstName: string }): string {
    const hour = new Date().getHours()
    let timeGreeting = 'Hello'

    if (hour < 12) {
      timeGreeting = 'Good morning'
    } else if (hour < 18) {
      timeGreeting = 'Good afternoon'
    } else {
      timeGreeting = 'Good evening'
    }

    return `${timeGreeting}, ${user.firstName}!`
  }

  /**
   * Calculate business progress from tasks
   */
  private calculateBusinessProgress(tasks: UserTask[]): BusinessProgress {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate phase-specific progress
    const phases = {
      ideation: this.calculatePhaseProgress(tasks, 'ideation'),
      legal: this.calculatePhaseProgress(tasks, 'legal'),
      financial: this.calculatePhaseProgress(tasks, 'financial'),
      launchPrep: this.calculatePhaseProgress(tasks, 'launch_prep'),
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionPercentage,
      phases,
    }
  }

  /**
   * Calculate progress for a specific phase
   */
  private calculatePhaseProgress(tasks: UserTask[], phase: TaskPhase): PhaseProgress {
    // Note: This assumes tasks have a phase property
    // In current implementation, we'd need to join with task_templates
    // For now, we'll use a simplified version based on category

    const phaseTasks = tasks.filter((t) => {
      // Simple category-to-phase mapping
      if (phase === 'ideation') return t.category === 'ideation'
      if (phase === 'legal') return t.category === 'legal'
      if (phase === 'financial') return t.category === 'financial'
      if (phase === 'launch_prep') return t.category === 'launch_prep'
      return false
    })

    const tasksTotal = phaseTasks.length
    const tasksCompleted = phaseTasks.filter((t) => t.status === 'completed').length
    const score = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started'
    if (tasksCompleted === tasksTotal && tasksTotal > 0) {
      status = 'completed'
    } else if (tasksCompleted > 0) {
      status = 'in_progress'
    }

    const phaseNames = {
      ideation: 'Ideation',
      legal: 'Legal Formation',
      financial: 'Financial Setup',
      launch_prep: 'Launch Preparation',
    }

    return {
      name: phaseNames[phase],
      score,
      tasksCompleted,
      tasksTotal,
      status,
    }
  }

  /**
   * Mark hero task complete and get next hero task
   */
  async completeHeroTask(
    userId: string,
    taskId: string
  ): Promise<{
    completedTask: UserTask
    nextHeroTask?: UserTask
  }> {
    // Mark task as completed
    const { data: completedTask, error: updateError } = await supabase
      .from('user_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        is_hero_task: false,
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to complete task: ${updateError.message}`)
    }

    // Trigger hero task update
    const { error: updateHeroError } = await supabase.rpc('update_hero_task', {
      p_user_id: userId,
      p_business_id: completedTask.business_id ?? undefined,
    })

    if (updateHeroError) {
      console.error('Error updating hero task:', updateHeroError)
    }

    // Get next hero task
    const nextHeroTask = await this.getHeroTask(userId, completedTask.business_id ?? undefined)

    return {
      completedTask: this.mapDbToTask(completedTask),
      nextHeroTask,
    }
  }

  /**
   * Skip hero task (prevent re-recommendation for 24 hours)
   */
  async skipHeroTask(
    userId: string,
    taskId: string
  ): Promise<{
    skippedTask: UserTask
    nextHeroTask?: UserTask
  }> {
    // Mark task as skipped
    const { data: skippedTask, error: updateError } = await supabase
      .from('user_tasks')
      .update({
        skipped_at: new Date().toISOString(),
        is_hero_task: false,
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to skip task: ${updateError.message}`)
    }

    // Trigger hero task update
    const { error: updateHeroError } = await supabase.rpc('update_hero_task', {
      p_user_id: userId,
      p_business_id: skippedTask.business_id ?? undefined,
    })

    if (updateHeroError) {
      console.error('Error updating hero task:', updateHeroError)
    }

    // Get next hero task
    const nextHeroTask = await this.getHeroTask(userId, skippedTask.business_id ?? undefined)

    return {
      skippedTask: this.mapDbToTask(skippedTask),
      nextHeroTask,
    }
  }

  /**
   * Map database row to UserTask type
   */
  private mapDbToTask(data: any): UserTask {
    return {
      id: data.id,
      userId: data.user_id,
      businessId: data.business_id,
      templateId: data.template_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      priorityOrder: data.priority_order,
      isHeroTask: data.is_hero_task,
      skippedAt: data.skipped_at ? new Date(data.skipped_at) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}

export const dashboardService = new DashboardService()
