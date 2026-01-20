/* eslint-disable max-lines */
/**
 * Tasks Service
 * Handles task listing with dependency/unlock logic
 */
import { supabase } from '@/config/database.js'
import type { Json } from '@/types/database.js'
import type {
  ConfidenceScore,
  TaskListItem,
  TaskListResponse,
  TaskListStatus,
  TaskPhase,
  TaskPhaseGroup,
  TaskType,
} from '@shared/types'

// Phase display names
const PHASE_NAMES: Record<TaskPhase, string> = {
  ideation: 'Ideation & Validation',
  legal: 'Legal Foundation',
  financial: 'Financial Infrastructure',
  launch_prep: 'Launch Preparation',
}

// Phase order for sorting
const PHASE_ORDER: TaskPhase[] = ['ideation', 'legal', 'financial', 'launch_prep']

export class TasksService {
  /**
   * Get all tasks grouped by phase with unlock status
   */
  async getTasksGroupedByPhase(userId: string, businessId?: string): Promise<TaskListResponse> {
    // Fetch all task templates
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('*')
      .order('week_number', { ascending: true })

    if (templatesError) {
      throw new Error(`Failed to fetch task templates: ${templatesError.message}`)
    }

    // Fetch user's task progress
    let userTasksQuery = supabase
      .from('user_tasks')
      .select('template_id, status, completed_at, skipped_at')
      .eq('user_id', userId)

    if (businessId) {
      userTasksQuery = userTasksQuery.eq('business_id', businessId)
    }

    const { data: userTasks, error: userTasksError } = await userTasksQuery

    if (userTasksError) {
      throw new Error(`Failed to fetch user tasks: ${userTasksError.message}`)
    }

    // Create a map of user task progress by template_id
    const userTaskMap = new Map<string, { status: string; completedAt?: Date; skippedAt?: Date }>()
    for (const ut of userTasks || []) {
      if (ut.template_id) {
        userTaskMap.set(ut.template_id, {
          status: ut.status,
          completedAt: ut.completed_at ? new Date(ut.completed_at) : undefined,
          skippedAt: ut.skipped_at ? new Date(ut.skipped_at) : undefined,
        })
      }
    }

    // Get set of completed task IDs for dependency checking
    const completedTaskIds = new Set<string>()
    for (const ut of userTasks || []) {
      if (ut.template_id && ut.status === 'completed') {
        completedTaskIds.add(ut.template_id)
      }
    }

    // Process templates into TaskListItems with unlock status
    const taskListItems: TaskListItem[] = templates.map((template) => {
      const userTask = userTaskMap.get(template.id)
      const status = this.calculateTaskStatus(template, userTask, completedTaskIds)

      return {
        id: template.id,
        title: template.title,
        description: template.description,
        phase: template.phase as TaskPhase,
        estimatedTime: this.formatEstimatedTime(template.estimated_hours),
        type: (template.task_type || 'education') as TaskType,
        status,
        dependencies: template.dependencies || [],
        completedAt: userTask?.completedAt,
        icon: template.icon ?? undefined,
      }
    })

    // Group tasks by phase
    const phaseGroups = this.groupTasksByPhase(taskListItems)

    return { phases: phaseGroups }
  }

  /**
   * Calculate task status based on user progress and dependencies
   */
  private calculateTaskStatus(
    template: { id: string; dependencies: string[] | null },
    userTask: { status: string; completedAt?: Date; skippedAt?: Date } | undefined,
    completedTaskIds: Set<string>
  ): TaskListStatus {
    // Check if user has progress on this task
    if (userTask) {
      if (userTask.status === 'completed') {
        return 'completed'
      }
      if (userTask.skippedAt) {
        return 'skipped'
      }
      if (userTask.status === 'in_progress') {
        return 'in_progress'
      }
    }

    // Check dependencies
    const dependencies = template.dependencies || []
    const allDependenciesMet = dependencies.every((depId) => completedTaskIds.has(depId))

    if (!allDependenciesMet) {
      return 'locked'
    }

    return 'available'
  }

  /**
   * Format estimated hours to human-readable string
   */
  private formatEstimatedTime(hours: number): string {
    if (hours === 0) {
      return 'Quick task'
    }
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes} min`
    }
    if (hours === 1) {
      return '1 hour'
    }
    return `${hours} hours`
  }

  /**
   * Group tasks by phase in correct order
   */
  private groupTasksByPhase(tasks: TaskListItem[]): TaskPhaseGroup[] {
    // Create a map of phase -> tasks
    const phaseMap = new Map<TaskPhase, TaskListItem[]>()

    for (const task of tasks) {
      const phase = task.phase
      if (!phaseMap.has(phase)) {
        phaseMap.set(phase, [])
      }
      phaseMap.get(phase)!.push(task)
    }

    // Build ordered phase groups
    const phaseGroups: TaskPhaseGroup[] = []

    for (const phase of PHASE_ORDER) {
      const phaseTasks = phaseMap.get(phase)
      if (phaseTasks && phaseTasks.length > 0) {
        phaseGroups.push({
          id: phase,
          name: PHASE_NAMES[phase],
          tasks: phaseTasks,
        })
      }
    }

    return phaseGroups
  }

  /**
   * Get a single task by ID with unlock status
   */
  async getTaskById(
    taskId: string,
    userId: string,
    businessId?: string
  ): Promise<TaskListItem | null> {
    // Fetch the task template
    const { data: template, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', taskId)
      .single()

    if (templateError || !template) {
      return null
    }

    // Fetch user's task progress for this task
    let userTaskQuery = supabase
      .from('user_tasks')
      .select('template_id, status, completed_at, skipped_at')
      .eq('user_id', userId)
      .eq('template_id', taskId)

    if (businessId) {
      userTaskQuery = userTaskQuery.eq('business_id', businessId)
    }

    const { data: userTasks } = await userTaskQuery

    const userTask = userTasks?.[0]
      ? {
          status: userTasks[0].status,
          completedAt: userTasks[0].completed_at ? new Date(userTasks[0].completed_at) : undefined,
          skippedAt: userTasks[0].skipped_at ? new Date(userTasks[0].skipped_at) : undefined,
        }
      : undefined

    // Fetch completed tasks to check dependencies
    let completedQuery = supabase
      .from('user_tasks')
      .select('template_id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (businessId) {
      completedQuery = completedQuery.eq('business_id', businessId)
    }

    const { data: completedTasks } = await completedQuery

    const completedTaskIds = new Set<string>(
      (completedTasks || []).map((t) => t.template_id).filter(Boolean) as string[]
    )

    const status = this.calculateTaskStatus(template, userTask, completedTaskIds)

    return {
      id: template.id,
      title: template.title,
      description: template.description,
      phase: template.phase as TaskPhase,
      estimatedTime: this.formatEstimatedTime(template.estimated_hours),
      type: (template.task_type || 'education') as TaskType,
      status,
      dependencies: template.dependencies || [],
      completedAt: userTask?.completedAt,
      icon: template.icon ?? undefined,
    }
  }

  /**
   * Complete a task
   * Issue #59: POST /api/tasks/:id/complete
   */
  async completeTask(
    taskId: string,
    userId: string,
    completionData?: Record<string, unknown>,
    businessId?: string
  ): Promise<{ task: TaskListItem; confidenceScore: ConfidenceScore }> {
    // First check if user_task exists, if not create it
    let userTaskQuery = supabase
      .from('user_tasks')
      .select('id')
      .eq('template_id', taskId)
      .eq('user_id', userId)

    if (businessId) {
      userTaskQuery = userTaskQuery.eq('business_id', businessId)
    }

    const { data: existingTask } = await userTaskQuery.single()

    if (existingTask) {
      // Update existing task
      const { error: updateError } = await supabase
        .from('user_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_data: (completionData || {}) as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingTask.id)

      if (updateError) {
        throw new Error(`Failed to complete task: ${updateError.message}`)
      }
    } else {
      // Create new user_task record marked as completed
      const { error: insertError } = await supabase.from('user_tasks').insert({
        template_id: taskId,
        user_id: userId,
        business_id: businessId || null,
        title: 'Completed Task', // Will be overwritten by template data
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_data: (completionData || {}) as Json,
      })

      if (insertError) {
        throw new Error(`Failed to create completed task: ${insertError.message}`)
      }
    }

    // Get updated task
    const task = await this.getTaskById(taskId, userId, businessId)
    if (!task) {
      throw new Error('Task not found after completion')
    }

    // Get updated confidence score (triggered by DB)
    const { data: scoreData, error: scoreError } = await supabase.rpc(
      'calculate_confidence_score',
      {
        p_user_id: userId,
        p_business_id: businessId || null,
      }
    )

    // Cast scoreData to expected shape from DB function
    const score = scoreData as {
      total: number
      ideation: number
      legal: number
      financial: number
      launch_prep: number
      calculated_at: string
    } | null

    const confidenceScore: ConfidenceScore =
      scoreError || !score
        ? { total: 0, ideation: 0, legal: 0, financial: 0, launchPrep: 0, calculatedAt: new Date() }
        : {
            total: score.total,
            ideation: score.ideation,
            legal: score.legal,
            financial: score.financial,
            launchPrep: score.launch_prep,
            calculatedAt: new Date(score.calculated_at),
          }

    return { task, confidenceScore }
  }

  /**
   * Save task draft data
   * Issue #60: POST /api/tasks/:id/save
   */
  async saveTaskDraft(
    taskId: string,
    userId: string,
    draftData: Record<string, unknown>,
    businessId?: string
  ): Promise<{ savedAt: Date }> {
    // Check if user_task exists
    let userTaskQuery = supabase
      .from('user_tasks')
      .select('id, status')
      .eq('template_id', taskId)
      .eq('user_id', userId)

    if (businessId) {
      userTaskQuery = userTaskQuery.eq('business_id', businessId)
    }

    const { data: existingTask } = await userTaskQuery.single()

    const savedAt = new Date()

    if (existingTask) {
      // Update existing task with draft data
      const { error: updateError } = await supabase
        .from('user_tasks')
        .update({
          draft_data: draftData as Json,
          status: existingTask.status === 'pending' ? 'in_progress' : existingTask.status,
          updated_at: savedAt.toISOString(),
        })
        .eq('id', existingTask.id)

      if (updateError) {
        throw new Error(`Failed to save draft: ${updateError.message}`)
      }
    } else {
      // Create new user_task record with draft data
      const { error: insertError } = await supabase.from('user_tasks').insert({
        template_id: taskId,
        user_id: userId,
        business_id: businessId || null,
        title: 'Draft Task', // Will be overwritten by template data
        status: 'in_progress',
        draft_data: draftData as Json,
      })

      if (insertError) {
        throw new Error(`Failed to create task draft: ${insertError.message}`)
      }
    }

    return { savedAt }
  }
}

export const tasksService = new TasksService()
