/* eslint-disable max-lines */
/**
 * Onboarding Planner Agent
 * LangGraph agent that generates personalized business plans from onboarding data
 */
import { StateGraph, Annotation } from '@langchain/langgraph'
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import { createLLM } from '@/agents/core/llm.js'
import {
  getTaskTemplatesTool,
  createBusinessFromOnboardingTool,
  bulkCreateTasksTool,
  storeBusinessPlanTool,
} from '@/agents/core/tools.js'
// Prompt simplified inline for better free tier model compatibility
// import { ONBOARDING_PLANNER_PROMPT } from '@/agents/core/prompts.js'
import type { OnboardingData } from '@shared/types'

/**
 * Onboarding Planner State
 */
export const OnboardingPlannerState = Annotation.Root({
  // Input data
  userId: Annotation<string>(),
  onboardingData: Annotation<OnboardingData>(),
  onboardingSessionId: Annotation<string | undefined>(),

  // LLM configuration
  llmProvider: Annotation<'openai' | 'anthropic' | 'openrouter'>(),
  llmModel: Annotation<string | undefined>(),
  llmApiKey: Annotation<string | undefined>(),

  // Processing state
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => prev.concat(next),
    default: () => [],
  }),

  // Fetched data
  taskTemplates: Annotation<any[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // AI-generated outputs
  businessPlan: Annotation<{
    executiveSummary: Record<string, any>
    recommendedEntityType: string
    recommendedState: string
    phaseRecommendations: Record<string, any>
    planSummary: string
  } | null>(),

  confidenceScores: Annotation<{
    total: number
    ideation: number
    legal: number
    financial: number
    launchPrep: number
  } | null>(),

  // Created resources
  businessId: Annotation<string | undefined>(),
  createdTaskIds: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  heroTaskId: Annotation<string | undefined>(),
  businessPlanId: Annotation<string | undefined>(),

  // Execution metadata
  error: Annotation<string | undefined>(),
  completedSteps: Annotation<string[]>({
    reducer: (prev, next) => [...new Set([...prev, ...next])],
    default: () => [],
  }),
})

export type OnboardingPlannerStateType = typeof OnboardingPlannerState.State

/**
 * Load task templates from database
 */
async function loadTemplates(
  _state: OnboardingPlannerStateType
): Promise<Partial<OnboardingPlannerStateType>> {
  try {
    const result = await getTaskTemplatesTool.invoke({ category: undefined })
    const parsed = JSON.parse(result)

    if (parsed.error) {
      return {
        error: `Failed to load templates: ${parsed.error}`,
        completedSteps: ['loadTemplates'],
      }
    }

    return {
      taskTemplates: parsed.templates || [],
      completedSteps: ['loadTemplates'],
    }
  } catch (error) {
    return {
      error: `Error loading templates: ${error instanceof Error ? error.message : String(error)}`,
      completedSteps: ['loadTemplates'],
    }
  }
}

/**
 * Generate personalized business plan using AI
 */
async function generatePlan(
  state: OnboardingPlannerStateType
): Promise<Partial<OnboardingPlannerStateType>> {
  try {
    // Create LLM instance - use env default model if not specified
    const model = state.llmModel || process.env.DEFAULT_LLM_MODEL || 'openai/gpt-4o'
    console.log('🤖 Using model:', model)

    const llm = createLLM({
      provider: state.llmProvider,
      model,
      apiKey: state.llmApiKey,
    })

    // Don't bind tools for plan generation - we want JSON response, not tool calls
    // Tools are executed in subsequent graph nodes (createBusiness, initializeTasks, etc.)

    // Format onboarding data for AI
    const onboardingDataText = `
**Business Information:**
- Business Name: ${state.onboardingData.businessName || 'Not provided'}
- Category: ${state.onboardingData.businessCategory || 'Not provided'}
- Current Stage: ${state.onboardingData.currentStage || 'Not provided'}
- State: ${state.onboardingData.stateCode || 'Not provided'}

**Goals & Timeline:**
- Primary Goals: ${state.onboardingData.primaryGoals?.join(', ') || 'Not provided'}
- Timeline: ${state.onboardingData.timeline || 'Not provided'}

**Team & Funding:**
- Team Size: ${state.onboardingData.teamSize || 'Solo founder'}
- Funding Approach: ${state.onboardingData.fundingApproach || 'Not provided'}

**Experience & Concerns:**
- Previous Experience: ${state.onboardingData.previousExperience || 'Not provided'}
- Primary Concern: ${state.onboardingData.primaryConcern || 'Not provided'}

**Available Task Templates:**
${JSON.stringify(state.taskTemplates.slice(0, 50), null, 2)}
`

    // Create simplified prompt for better compatibility with free/small models
    // Limit task templates to reduce input size
    const limitedTemplates = state.taskTemplates.slice(0, 10).map((t: any) => ({
      id: t.id,
      title: t.title,
      phase: t.phase,
    }))

    const messages = [
      new HumanMessage({
        content: `You are a business formation advisor. Based on this user's profile, recommend the best business structure.

USER PROFILE:
- Business: ${state.onboardingData.businessName || 'New Business'} (${state.onboardingData.businessCategory || 'general'})
- State: ${state.onboardingData.stateCode || 'CA'}
- Stage: ${state.onboardingData.currentStage || 'idea'}
- Funding: ${state.onboardingData.fundingApproach || 'bootstrapped'}
- Team Size: ${state.onboardingData.teamSize || 1}
- Experience: ${state.onboardingData.previousExperience || 'none'}

AVAILABLE TASKS:
${JSON.stringify(limitedTemplates, null, 1)}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "recommendedEntityType": "LLC",
  "recommendedState": "CA",
  "planSummary": "Brief 1-2 sentence recommendation",
  "executiveSummary": {"overview": "Brief overview"},
  "confidenceScores": {"total": 80, "ideation": 75, "legal": 80, "financial": 75, "launchPrep": 70},
  "selectedTaskTemplateIds": ["id1", "id2"],
  "heroTaskTemplateId": "id1"
}`,
      }),
    ]

    // Get AI response (no tools bound - we expect JSON response)
    console.log('🤖 Calling LLM with provider:', state.llmProvider, 'model:', model)
    const response = await llm.invoke(messages)

    // Debug: log full response structure
    console.log('🤖 Response type:', typeof response)
    console.log('🤖 Response keys:', Object.keys(response))
    console.log('🤖 Response content type:', typeof response.content)
    console.log('🤖 Response tool_calls:', response.tool_calls?.length || 0, 'calls')
    if (response.tool_calls?.length) {
      console.log('🤖 Tool calls:', JSON.stringify(response.tool_calls, null, 2))
    }

    // Parse AI response
    let aiContent = ''
    if (typeof response.content === 'string') {
      aiContent = response.content
    } else if (Array.isArray(response.content)) {
      aiContent = response.content
        .map((c) => (typeof c === 'string' ? c : c.type === 'text' ? c.text : ''))
        .join('\n')
    }

    // Log response for debugging
    console.log('🤖 AI Response length:', aiContent.length)
    if (aiContent.length < 100) {
      console.log('🤖 AI Response (short):', aiContent)
    }

    // Extract JSON from response (may be wrapped in markdown code blocks)
    // Try multiple patterns for flexibility
    const jsonPatterns = [
      /```json\n?([\s\S]*?)\n?```/, // ```json ... ```
      /```\n?([\s\S]*?)\n?```/, // ``` ... ``` (no language tag)
      /\{[\s\S]*"executiveSummary"[\s\S]*\}/, // Raw JSON with expected field
      /\{[\s\S]*\}/, // Any JSON object
    ]

    let jsonMatch: RegExpMatchArray | null = null
    for (const pattern of jsonPatterns) {
      jsonMatch = aiContent.match(pattern)
      if (jsonMatch) break
    }

    if (!jsonMatch) {
      console.error('🔴 Failed to extract JSON. Response preview:', aiContent.substring(0, 500))
      throw new Error('Failed to extract JSON from AI response')
    }

    const jsonString = jsonMatch[1] || jsonMatch[0]
    let planData: any
    try {
      planData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('🔴 JSON parse error:', parseError)
      console.error('🔴 JSON string preview:', jsonString.substring(0, 500))
      throw new Error('Failed to parse AI response as JSON')
    }

    // Validate required fields
    if (
      !planData.executiveSummary ||
      !planData.recommendedEntityType ||
      !planData.confidenceScores ||
      !planData.selectedTaskTemplateIds ||
      !planData.planSummary
    ) {
      throw new Error('AI response missing required fields')
    }

    return {
      businessPlan: {
        executiveSummary: planData.executiveSummary,
        recommendedEntityType: planData.recommendedEntityType,
        recommendedState: planData.recommendedState || state.onboardingData.stateCode || 'CA',
        phaseRecommendations: planData.phaseRecommendations,
        planSummary: planData.planSummary,
      },
      confidenceScores: {
        total: Math.round(planData.confidenceScores.total),
        ideation: Math.round(planData.confidenceScores.ideation),
        legal: Math.round(planData.confidenceScores.legal),
        financial: Math.round(planData.confidenceScores.financial),
        launchPrep: Math.round(planData.confidenceScores.launchPrep),
      },
      messages: [
        new HumanMessage({ content: onboardingDataText }),
        new AIMessage({ content: aiContent }),
      ],
      completedSteps: ['generatePlan'],
    }
  } catch (error) {
    return {
      error: `Error generating plan: ${error instanceof Error ? error.message : String(error)}`,
      completedSteps: ['generatePlan'],
    }
  }
}

/**
 * Create business record from onboarding data
 */
async function createBusiness(
  state: OnboardingPlannerStateType
): Promise<Partial<OnboardingPlannerStateType>> {
  try {
    if (!state.onboardingData.businessName) {
      throw new Error('Business name is required')
    }

    const result = await createBusinessFromOnboardingTool.invoke({
      userId: state.userId,
      businessName: state.onboardingData.businessName,
      businessCategory: state.onboardingData.businessCategory || 'service',
      stateCode: state.onboardingData.stateCode || 'CA',
      currentStage: state.onboardingData.currentStage || 'idea',
    })

    const parsed = JSON.parse(result)

    if (!parsed.success) {
      throw new Error(parsed.error || 'Failed to create business')
    }

    return {
      businessId: parsed.business.id,
      completedSteps: ['createBusiness'],
    }
  } catch (error) {
    return {
      error: `Error creating business: ${error instanceof Error ? error.message : String(error)}`,
      completedSteps: ['createBusiness'],
    }
  }
}

/**
 * Create tasks from AI-selected templates
 */
async function initializeTasks(
  state: OnboardingPlannerStateType
): Promise<Partial<OnboardingPlannerStateType>> {
  try {
    if (!state.businessId) {
      throw new Error('Business ID is required to create tasks')
    }

    // Get AI-selected task template IDs from business plan
    const aiResponse = state.messages[state.messages.length - 1]
    let aiContent = ''
    if (typeof aiResponse?.content === 'string') {
      aiContent = aiResponse.content
    } else if (Array.isArray(aiResponse?.content)) {
      aiContent = aiResponse.content
        .map((c) => (typeof c === 'string' ? c : c.type === 'text' ? c.text : ''))
        .join('\n')
    }

    const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/{[\s\S]*}/)
    if (!jsonMatch) {
      throw new Error('Failed to extract task selection from AI response')
    }

    const planData = JSON.parse(jsonMatch[1] || jsonMatch[0])
    const selectedTemplateIds = planData.selectedTaskTemplateIds || []
    const heroTaskTemplateId: string | undefined = planData.heroTaskTemplateId

    if (selectedTemplateIds.length === 0) {
      throw new Error('No task templates selected by AI')
    }

    // Create tasks
    const result = await bulkCreateTasksTool.invoke({
      userId: state.userId,
      businessId: state.businessId || '',
      templateIds: selectedTemplateIds,
    })

    const parsed = JSON.parse(result)

    if (!parsed.success) {
      throw new Error(parsed.error || 'Failed to create tasks')
    }

    // Find hero task
    let heroTaskId: string | undefined
    if (heroTaskTemplateId) {
      const heroTask = parsed.tasks?.find((task: any) => task.template_id === heroTaskTemplateId)
      heroTaskId = heroTask?.id
    }

    // If no hero task found, use first high-priority task
    if (!heroTaskId && parsed.tasks?.length > 0) {
      const firstHighPriority = parsed.tasks.find((task: any) => task.priority === 'high')
      heroTaskId = firstHighPriority?.id || parsed.tasks[0].id
    }

    // Mark hero task
    if (heroTaskId) {
      // Update hero task flag (this would be done via Supabase)
      // For now, we'll just store the ID
    }

    return {
      createdTaskIds: parsed.tasks?.map((task: any) => task.id) || [],
      heroTaskId,
      completedSteps: ['initializeTasks'],
    }
  } catch (error) {
    return {
      error: `Error initializing tasks: ${error instanceof Error ? error.message : String(error)}`,
      completedSteps: ['initializeTasks'],
    }
  }
}

/**
 * Store business plan in database
 */
async function storePlan(
  state: OnboardingPlannerStateType
): Promise<Partial<OnboardingPlannerStateType>> {
  try {
    if (!state.businessPlan || !state.confidenceScores) {
      throw new Error('Business plan and confidence scores are required')
    }

    const result = await storeBusinessPlanTool.invoke({
      userId: state.userId,
      businessId: state.businessId,
      onboardingSessionId: state.onboardingSessionId,
      planSummary: state.businessPlan.planSummary,
      recommendedEntityType: state.businessPlan.recommendedEntityType,
      recommendedState: state.businessPlan.recommendedState,
      executiveSummary: state.businessPlan.executiveSummary,
      phaseRecommendations: state.businessPlan.phaseRecommendations,
      confidenceScore: state.confidenceScores.total,
      ideationScore: state.confidenceScores.ideation,
      legalScore: state.confidenceScores.legal,
      financialScore: state.confidenceScores.financial,
      launchPrepScore: state.confidenceScores.launchPrep,
    })

    const parsed = JSON.parse(result)

    if (!parsed.success) {
      throw new Error(parsed.error || 'Failed to store business plan')
    }

    return {
      businessPlanId: parsed.businessPlan.id,
      completedSteps: ['storePlan'],
    }
  } catch (error) {
    return {
      error: `Error storing plan: ${error instanceof Error ? error.message : String(error)}`,
      completedSteps: ['storePlan'],
    }
  }
}

/**
 * Determine next step based on completed steps
 */
function routeNext(state: OnboardingPlannerStateType): string {
  const completed = new Set(state.completedSteps)

  if (state.error) {
    return 'error'
  }

  if (!completed.has('loadTemplates')) {
    return 'loadTemplates'
  }

  if (!completed.has('generatePlan')) {
    return 'generatePlan'
  }

  if (!completed.has('createBusiness')) {
    return 'createBusiness'
  }

  if (!completed.has('initializeTasks')) {
    return 'initializeTasks'
  }

  if (!completed.has('storePlan')) {
    return 'storePlan'
  }

  return 'done'
}

/**
 * Create onboarding planner graph
 */
export function createOnboardingPlannerGraph() {
  const graph = new StateGraph(OnboardingPlannerState)
    .addNode('loadTemplates', loadTemplates)
    .addNode('generatePlan', generatePlan)
    .addNode('createBusiness', createBusiness)
    .addNode('initializeTasks', initializeTasks)
    .addNode('storePlan', storePlan)
    .addConditionalEdges('loadTemplates', routeNext, {
      generatePlan: 'generatePlan',
      error: '__end__',
    })
    .addConditionalEdges('generatePlan', routeNext, {
      createBusiness: 'createBusiness',
      error: '__end__',
    })
    .addConditionalEdges('createBusiness', routeNext, {
      initializeTasks: 'initializeTasks',
      error: '__end__',
    })
    .addConditionalEdges('initializeTasks', routeNext, {
      storePlan: 'storePlan',
      error: '__end__',
    })
    .addConditionalEdges('storePlan', routeNext, {
      done: '__end__',
      error: '__end__',
    })
    .setEntryPoint('loadTemplates')

  return graph.compile()
}

/**
 * Run onboarding planner for a user
 */
export async function runOnboardingPlanner(params: {
  userId: string
  onboardingData: OnboardingData
  onboardingSessionId?: string
  llmProvider?: 'openai' | 'anthropic' | 'openrouter'
  llmModel?: string
  llmApiKey?: string
}): Promise<{
  success: boolean
  businessId?: string
  businessPlanId?: string
  heroTaskId?: string
  taskCount?: number
  confidenceScores?: {
    total: number
    ideation: number
    legal: number
    financial: number
    launchPrep: number
  }
  error?: string
}> {
  try {
    const graph = createOnboardingPlannerGraph()

    const initialState: Partial<OnboardingPlannerStateType> = {
      userId: params.userId,
      onboardingData: params.onboardingData,
      onboardingSessionId: params.onboardingSessionId,
      llmProvider: params.llmProvider || 'openrouter',
      llmModel: params.llmModel,
      llmApiKey: params.llmApiKey,
    }

    const result = await graph.invoke(initialState)

    if (result.error) {
      return {
        success: false,
        error: result.error,
      }
    }

    return {
      success: true,
      businessId: result.businessId,
      businessPlanId: result.businessPlanId,
      heroTaskId: result.heroTaskId,
      taskCount: result.createdTaskIds?.length || 0,
      confidenceScores: result.confidenceScores || undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
