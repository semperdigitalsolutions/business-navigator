/**
 * Shared tools for LangGraph agents
 * Tools allow agents to interact with external systems (database, APIs, etc.)
 */
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { supabase } from '@/config/database.js'
import type { UserTaskUpdate } from '@/types/supabase-helpers.js'

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

    const business = data as any
    return JSON.stringify({
      found: true,
      business: {
        id: business.id,
        name: business.name,
        type: business.type,
        state: business.state,
        status: business.status,
        createdAt: business.created_at,
      },
    })
  },
  {
    name: 'get_user_business',
    description:
      "Get information about the user's business including name, type, state, and formation status",
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
      "Get the user's tasks, optionally filtered by status (pending, in_progress, completed, blocked)",
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
    let query = supabase
      .from('task_templates')
      .select('*')
      .order('week_number', { ascending: true })

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
    const updateData: UserTaskUpdate = {
      status: 'completed',
      completed_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_tasks')
      // @ts-expect-error - Supabase type inference issue with Database generics
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return JSON.stringify({ success: false, error: error.message })
    }

    if (!data) {
      return JSON.stringify({ success: false, error: 'Task not found' })
    }

    return JSON.stringify({
      success: true,
      task: data,
      // @ts-expect-error - Data exists but TypeScript infers never
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
      } as any)
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
 * Create or update business from onboarding data
 */
export const createBusinessFromOnboardingTool = tool(
  async ({
    userId,
    businessName,
    businessCategory,
    stateCode,
    currentStage,
  }: {
    userId: string
    businessName: string
    businessCategory: string
    stateCode: string
    currentStage: string
  }) => {
    // Check if user already has a business
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .single()

    if (existingBusiness) {
      // Update existing business
      const { data, error } = await supabase
        .from('businesses')
        // @ts-expect-error - Supabase type inference issue
        .update({
          name: businessName,
          type: businessCategory,
          state: stateCode,
          status: currentStage === 'started' ? 'active' : 'planning',
        })
        .eq('id', existingBusiness.id)
        .select()
        .single()

      if (error) {
        return JSON.stringify({ success: false, error: error.message })
      }

      return JSON.stringify({
        success: true,
        // @ts-expect-error - Data exists but TypeScript infers never
        business: data,
        message: 'Business updated successfully',
        isNew: false,
      })
    } else {
      // Create new business
      const { data, error } = await supabase
        .from('businesses')
        // @ts-expect-error - Supabase type inference issue
        .insert({
          owner_id: userId,
          name: businessName,
          type: businessCategory,
          state: stateCode,
          status: currentStage === 'started' ? 'active' : 'planning',
        })
        .select()
        .single()

      if (error) {
        return JSON.stringify({ success: false, error: error.message })
      }

      return JSON.stringify({
        success: true,
        // @ts-expect-error - Data exists but TypeScript infers never
        business: data,
        message: 'Business created successfully',
        isNew: true,
      })
    }
  },
  {
    name: 'create_business_from_onboarding',
    description:
      'Create or update a business based on onboarding data. Updates existing business if found, creates new one otherwise.',
    schema: z.object({
      userId: z.string().describe('The user ID'),
      businessName: z.string().describe('Business name'),
      businessCategory: z.string().describe('Business category/type'),
      stateCode: z.string().length(2).describe('Two-letter US state code'),
      currentStage: z.string().describe('Current business stage (idea, planning, started)'),
    }),
  }
)

/**
 * Bulk create tasks from templates
 */
export const bulkCreateTasksTool = tool(
  async ({
    userId,
    businessId,
    templateIds,
  }: {
    userId: string
    businessId: string
    templateIds: string[]
  }) => {
    // Fetch templates
    const { data: templates, error: fetchError } = await supabase
      .from('task_templates')
      .select('*')
      .in('id', templateIds)

    if (fetchError || !templates) {
      return JSON.stringify({ success: false, error: fetchError?.message || 'Templates not found' })
    }

    // Create tasks from templates
    const tasksToInsert = templates.map((template: any) => ({
      user_id: userId,
      business_id: businessId,
      template_id: template.id,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority || 'medium',
      status: 'pending',
      week_number: template.week_number,
      estimated_hours: template.estimated_hours,
      priority_order: template.weight || 1,
    }))

    const { data, error } = await supabase
      .from('user_tasks')
      // @ts-expect-error - Supabase type inference issue
      .insert(tasksToInsert)
      .select()

    if (error) {
      return JSON.stringify({ success: false, error: error.message })
    }

    return JSON.stringify({
      success: true,
      tasks: data || [],
      count: data?.length || 0,
      message: `Successfully created ${data?.length || 0} tasks`,
    })
  },
  {
    name: 'bulk_create_tasks',
    description: 'Create multiple user tasks from template IDs in a single operation',
    schema: z.object({
      userId: z.string().describe('The user ID'),
      businessId: z.string().describe('The business ID'),
      templateIds: z.array(z.string()).describe('Array of task template IDs to instantiate'),
    }),
  }
)

/**
 * Store AI-generated business plan
 */
export const storeBusinessPlanTool = tool(
  async ({
    userId,
    businessId,
    onboardingSessionId,
    planSummary,
    recommendedEntityType,
    recommendedState,
    executiveSummary,
    phaseRecommendations,
    confidenceScore,
    ideationScore,
    legalScore,
    financialScore,
    launchPrepScore,
  }: {
    userId: string
    businessId?: string
    onboardingSessionId?: string
    planSummary: string
    recommendedEntityType: string
    recommendedState: string
    executiveSummary: Record<string, any>
    phaseRecommendations: Record<string, any>
    confidenceScore: number
    ideationScore: number
    legalScore: number
    financialScore: number
    launchPrepScore: number
  }) => {
    // Check if plan already exists
    const { data: existingPlan } = await supabase
      .from('business_plans')
      .select('id')
      .eq('user_id', userId)
      .single()

    const planData = {
      user_id: userId,
      business_id: businessId,
      onboarding_session_id: onboardingSessionId,
      plan_summary: planSummary,
      recommended_entity_type: recommendedEntityType,
      recommended_state: recommendedState,
      executive_summary: executiveSummary,
      phase_recommendations: phaseRecommendations,
      confidence_score: confidenceScore,
      ideation_score: ideationScore,
      legal_score: legalScore,
      financial_score: financialScore,
      launch_prep_score: launchPrepScore,
    } as any

    if (existingPlan) {
      // Update existing plan
      const { data, error } = await supabase
        .from('business_plans')
        // @ts-expect-error - Supabase type inference issue
        .update(planData)
        .eq('id', existingPlan.id)
        .select()
        .single()

      if (error) {
        return JSON.stringify({ success: false, error: error.message })
      }

      return JSON.stringify({
        success: true,
        // @ts-expect-error - Data exists but TypeScript infers never
        businessPlan: data,
        message: 'Business plan updated successfully',
        isNew: false,
      })
    } else {
      // Create new plan
      const { data, error } = await supabase
        .from('business_plans')
        // @ts-expect-error - Supabase type inference issue
        .insert(planData)
        .select()
        .single()

      if (error) {
        return JSON.stringify({ success: false, error: error.message })
      }

      return JSON.stringify({
        success: true,
        // @ts-expect-error - Data exists but TypeScript infers never
        businessPlan: data,
        message: 'Business plan created successfully',
        isNew: true,
      })
    }
  },
  {
    name: 'store_business_plan',
    description:
      'Store AI-generated business plan with recommendations and confidence scores. Updates existing plan if found.',
    schema: z.object({
      userId: z.string().describe('The user ID'),
      businessId: z.string().optional().describe('Optional business ID'),
      onboardingSessionId: z.string().optional().describe('Optional onboarding session ID'),
      planSummary: z.string().describe('High-level summary of the business plan'),
      recommendedEntityType: z
        .string()
        .describe('Recommended business entity type (LLC, Corp, etc)'),
      recommendedState: z.string().describe('Recommended state for formation'),
      executiveSummary: z.record(z.any()).describe('Executive summary as JSON object'),
      phaseRecommendations: z
        .record(z.any())
        .describe('Phase-specific recommendations as JSON object'),
      confidenceScore: z.number().min(0).max(100).describe('Overall confidence score (0-100)'),
      ideationScore: z.number().min(0).max(100).describe('Ideation phase score (0-100)'),
      legalScore: z.number().min(0).max(100).describe('Legal phase score (0-100)'),
      financialScore: z.number().min(0).max(100).describe('Financial phase score (0-100)'),
      launchPrepScore: z.number().min(0).max(100).describe('Launch prep phase score (0-100)'),
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
  createBusinessFromOnboardingTool,
  bulkCreateTasksTool,
  storeBusinessPlanTool,
]
