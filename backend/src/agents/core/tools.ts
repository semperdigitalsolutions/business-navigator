/**
 * Shared tools for LangGraph agents
 * Tools allow agents to interact with external systems (database, APIs, etc.)
 */
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { supabase } from '@/config/database.js'

/**
 * Get user's business information
 */
export const getUserBusinessTool = tool(
  async ({ userId }: { userId: string }) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return JSON.stringify({ found: false, message: 'No business found for user' })
    }

    return JSON.stringify({
      found: true,
      business: {
        id: data.id,
        name: data.name,
        type: data.type,
        state: data.state,
        status: data.status,
        createdAt: data.created_at,
      },
    })
  },
  {
    name: 'get_user_business',
    description:
      'Get information about the user\'s business including name, type, state, and formation status',
    schema: z.object({
      userId: z.string().describe('The user ID to look up business information for'),
    }),
  }
)

/**
 * Get user's tasks
 */
export const getUserTasksTool = tool(
  async ({ userId, status }: { userId: string; status?: string }) => {
    let query = supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return JSON.stringify({ error: error.message })
    }

    return JSON.stringify({
      tasks: data || [],
      count: data?.length || 0,
    })
  },
  {
    name: 'get_user_tasks',
    description:
      'Get the user\'s tasks, optionally filtered by status (pending, in_progress, completed, blocked)',
    schema: z.object({
      userId: z.string().describe('The user ID'),
      status: z
        .enum(['pending', 'in_progress', 'completed', 'blocked'])
        .optional()
        .describe('Optional status filter'),
    }),
  }
)

/**
 * Get task templates by category
 */
export const getTaskTemplatesTool = tool(
  async ({ category }: { category?: string }) => {
    let query = supabase.from('task_templates').select('*').order('week_number', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return JSON.stringify({ error: error.message })
    }

    return JSON.stringify({
      templates: data || [],
      count: data?.length || 0,
    })
  },
  {
    name: 'get_task_templates',
    description:
      'Get available task templates for business formation, optionally filtered by category (legal, financial, product, marketing, testing, analytics)',
    schema: z.object({
      category: z
        .enum(['legal', 'financial', 'product', 'marketing', 'testing', 'analytics'])
        .optional()
        .describe('Optional category filter'),
    }),
  }
)

/**
 * Complete a task
 */
export const completeTaskTool = tool(
  async ({ taskId, userId }: { taskId: string; userId: string }) => {
    const { data, error } = await supabase
      .from('user_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return JSON.stringify({ success: false, error: error.message })
    }

    return JSON.stringify({
      success: true,
      task: data,
      message: `Task "${data.title}" marked as completed!`,
    })
  },
  {
    name: 'complete_task',
    description: 'Mark a task as completed for the user',
    schema: z.object({
      taskId: z.string().describe('The task ID to complete'),
      userId: z.string().describe('The user ID'),
    }),
  }
)

/**
 * Create a new task for user
 */
export const createUserTaskTool = tool(
  async ({
    userId,
    businessId,
    title,
    description,
    category,
    priority,
  }: {
    userId: string
    businessId?: string
    title: string
    description: string
    category: string
    priority: string
  }) => {
    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        business_id: businessId,
        title,
        description,
        category,
        priority,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return JSON.stringify({ success: false, error: error.message })
    }

    return JSON.stringify({
      success: true,
      task: data,
      message: `Task "${title}" created successfully!`,
    })
  },
  {
    name: 'create_user_task',
    description: 'Create a new task for the user',
    schema: z.object({
      userId: z.string().describe('The user ID'),
      businessId: z.string().optional().describe('Optional business ID'),
      title: z.string().describe('Task title'),
      description: z.string().describe('Task description'),
      category: z
        .enum(['legal', 'financial', 'product', 'marketing', 'testing', 'analytics'])
        .describe('Task category'),
      priority: z.enum(['high', 'medium', 'low']).describe('Task priority'),
    }),
  }
)

/**
 * Get state-specific business formation requirements
 */
export const getStateRequirementsTool = tool(
  async ({ state, businessType }: { state: string; businessType: string }) => {
    // This would normally query a database or external API
    // For now, return mock data based on common requirements
    const requirements = {
      filingFee: state === 'DE' ? 90 : state === 'CA' ? 70 : 100,
      processingTime: '5-10 business days',
      annualReportRequired: true,
      annualReportFee: 50,
      publicationRequired: ['NY', 'AZ', 'NE'].includes(state),
    }

    return JSON.stringify({
      state,
      businessType,
      requirements,
      note: 'These are general requirements. Consult with a licensed attorney for specific guidance.',
    })
  },
  {
    name: 'get_state_requirements',
    description: 'Get state-specific business formation requirements including fees and timelines',
    schema: z.object({
      state: z.string().length(2).describe('Two-letter US state code (e.g., CA, NY, TX)'),
      businessType: z
        .enum(['LLC', 'CORPORATION', 'SOLE_PROPRIETORSHIP', 'PARTNERSHIP'])
        .describe('Type of business entity'),
    }),
  }
)

/**
 * All tools available to agents
 */
export const agentTools = [
  getUserBusinessTool,
  getUserTasksTool,
  getTaskTemplatesTool,
  completeTaskTool,
  createUserTaskTool,
  getStateRequirementsTool,
]
