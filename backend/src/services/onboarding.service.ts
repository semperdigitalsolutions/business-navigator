/* eslint-disable max-lines */
/**
 * Onboarding Service
 * Handles 7-step onboarding wizard business logic
 */
import { supabase } from '@/config/database.js'
import { runOnboardingPlanner } from '@/agents/onboarding/planner.js'
import type {
  OnboardingData,
  OnboardingSession,
  BusinessPlan,
  BusinessCategory,
  CurrentStage,
  Timeline,
  FundingApproach,
  PreviousExperience,
  PrimaryConcern,
} from '@shared/types'

interface SaveProgressParams {
  userId: string
  data: Partial<OnboardingData>
  currentStep: number
  completedSteps: number[]
}

interface CompleteOnboardingParams {
  userId: string
  data: OnboardingData
}

export class OnboardingService {
  /**
   * Get incomplete onboarding session for user
   * Used for "resume onboarding" flow
   */
  async getIncompleteSession(userId: string): Promise<OnboardingSession | null> {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user has no incomplete session
        return null
      }
      throw new Error(`Failed to get onboarding session: ${error.message}`)
    }

    return this.mapDbToSession(data)
  }

  /**
   * Get completed onboarding session for user
   */
  async getCompletedSession(userId: string): Promise<OnboardingSession | null> {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get onboarding session: ${error.message}`)
    }

    return this.mapDbToSession(data)
  }

  /**
   * Check onboarding status for user
   */
  async getOnboardingStatus(userId: string): Promise<{
    hasStarted: boolean
    isCompleted: boolean
    currentStep: number
    progress: number
  }> {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('completed, current_step, steps_completed')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No session exists
        return {
          hasStarted: false,
          isCompleted: false,
          currentStep: 1,
          progress: 0,
        }
      }
      throw new Error(`Failed to get onboarding status: ${error.message}`)
    }

    const progress = Math.round(((data.steps_completed?.length || 0) / 7) * 100)

    return {
      hasStarted: true,
      isCompleted: data.completed,
      currentStep: data.current_step,
      progress,
    }
  }

  /**
   * Save onboarding progress (auto-save during wizard)
   * Uses UPSERT to create or update session
   */
  async saveProgress(params: SaveProgressParams): Promise<OnboardingSession> {
    const { userId, data, currentStep, completedSteps } = params

    // Build update object dynamically based on provided data
    const updateData: any = {
      user_id: userId,
      current_step: currentStep,
      steps_completed: completedSteps,
      completed: false,
    }

    // Map data fields to database columns
    if (data.businessName !== undefined) {
      updateData.business_name = data.businessName
    }
    if (data.businessCategory !== undefined) {
      updateData.business_category = data.businessCategory
    }
    if (data.currentStage !== undefined) {
      updateData.current_stage = data.currentStage
    }
    if (data.stateCode !== undefined) {
      updateData.state_code = data.stateCode
    }
    if (data.primaryGoals !== undefined) {
      updateData.primary_goals = data.primaryGoals
    }
    if (data.timeline !== undefined) {
      updateData.timeline = data.timeline
    }
    if (data.teamSize !== undefined) {
      updateData.team_size = data.teamSize
    }
    if (data.fundingApproach !== undefined) {
      updateData.funding_approach = data.fundingApproach
    }
    if (data.previousExperience !== undefined) {
      updateData.previous_experience = data.previousExperience
    }
    if (data.primaryConcern !== undefined) {
      updateData.primary_concern = data.primaryConcern
    }

    // UPSERT: Insert if not exists, update if exists
    const { data: session, error } = await supabase
      .from('onboarding_sessions')
      .upsert(updateData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save onboarding progress: ${error.message}`)
    }

    return this.mapDbToSession(session)
  }

  /**
   * Complete onboarding wizard
   * Marks session as completed and triggers AI business plan generation
   */
  async completeOnboarding(params: CompleteOnboardingParams): Promise<{
    session: OnboardingSession
    businessPlan: BusinessPlan
  }> {
    const { userId, data } = params

    // Save final data with completed flag
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .upsert(
        {
          user_id: userId,
          business_name: data.businessName,
          business_category: data.businessCategory,
          current_stage: data.currentStage,
          state_code: data.stateCode,
          primary_goals: data.primaryGoals,
          timeline: data.timeline,
          team_size: data.teamSize,
          funding_approach: data.fundingApproach,
          previous_experience: data.previousExperience,
          primary_concern: data.primaryConcern,
          current_step: 7,
          steps_completed: [1, 2, 3, 4, 5, 6, 7],
          completed: true,
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (sessionError) {
      throw new Error(`Failed to complete onboarding: ${sessionError.message}`)
    }

    // Generate initial business plan
    // Note: This will be enhanced with LangGraph AI generation in Phase 3D
    const businessPlan = await this.generateInitialPlan(userId, data, session.id)

    return {
      session: this.mapDbToSession(session),
      businessPlan,
    }
  }

  /**
   * Generate initial business plan using LangGraph AI agent
   * Phase 3D: Enhanced with LangGraph AI generation
   */
  private async generateInitialPlan(
    userId: string,
    onboardingData: OnboardingData,
    sessionId: string
  ): Promise<BusinessPlan> {
    // Run LangGraph onboarding planner agent
    // This will:
    // 1. Analyze onboarding data with AI (GPT-4/Opus)
    // 2. Generate personalized business plan
    // 3. Create business record
    // 4. Select and create 15-20 relevant tasks
    // 5. Identify hero task
    // 6. Calculate initial confidence scores
    // 7. Store everything in database

    const result = await runOnboardingPlanner({
      userId,
      onboardingData,
      onboardingSessionId: sessionId,
      // Use quality models as per user's choice (GPT-4 or Opus)
      llmProvider: 'openrouter',
      llmModel: 'openai/gpt-4o', // Quality model for best plan generation
      // User's API key will be fetched from settings if available
    })

    if (!result.success) {
      // Fall back to template-based plan if AI generation fails
      console.error('LangGraph plan generation failed:', result.error)
      return this.generateFallbackPlan(userId, onboardingData, sessionId)
    }

    // Fetch the created business plan from database (business_plans not in database.ts yet)
    const { data: plan, error } = await (supabase as any)
      .from('business_plans')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !plan) {
      throw new Error(`Failed to fetch business plan: ${error?.message || 'Plan not found'}`)
    }

    return {
      id: plan.id,
      userId: plan.user_id,
      businessId: plan.business_id,
      onboardingSessionId: plan.onboarding_session_id,
      planSummary: plan.plan_summary,
      recommendedEntityType: plan.recommended_entity_type,
      recommendedState: plan.recommended_state,
      executiveSummary: plan.executive_summary,
      phaseRecommendations: plan.phase_recommendations,
      confidenceScore: plan.confidence_score,
      ideationScore: plan.ideation_score,
      legalScore: plan.legal_score,
      financialScore: plan.financial_score,
      launchPrepScore: plan.launch_prep_score,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
    }
  }

  /**
   * Fallback plan generation if AI fails
   * Uses template-based approach as backup
   */
  private async generateFallbackPlan(
    userId: string,
    onboardingData: OnboardingData,
    sessionId: string
  ): Promise<BusinessPlan> {
    // Basic template-based recommendations
    const recommendedEntityType = this.recommendEntityType(onboardingData)
    const recommendedState = onboardingData.stateCode || 'DE' // Delaware default

    const planSummary = this.generatePlanSummary(onboardingData)
    const executiveSummary = this.generateExecutiveSummary(onboardingData)
    const phaseRecommendations = this.generatePhaseRecommendations(onboardingData)

    // Create business plan record (business_plans not in database.ts yet)
    const { data: plan, error } = await (supabase as any)
      .from('business_plans')
      .upsert(
        {
          user_id: userId,
          onboarding_session_id: sessionId,
          plan_summary: planSummary,
          recommended_entity_type: recommendedEntityType,
          recommended_state: recommendedState,
          executive_summary: executiveSummary,
          phase_recommendations: phaseRecommendations,
          confidence_score: 5, // Initial score after onboarding
          ideation_score: 10,
          legal_score: 0,
          financial_score: 0,
          launch_prep_score: 0,
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create business plan: ${error.message}`)
    }

    return {
      id: plan.id,
      userId: plan.user_id,
      businessId: plan.business_id,
      onboardingSessionId: plan.onboarding_session_id,
      planSummary: plan.plan_summary,
      recommendedEntityType: plan.recommended_entity_type,
      recommendedState: plan.recommended_state,
      executiveSummary: plan.executive_summary,
      phaseRecommendations: plan.phase_recommendations,
      confidenceScore: plan.confidence_score,
      ideationScore: plan.ideation_score,
      legalScore: plan.legal_score,
      financialScore: plan.financial_score,
      launchPrepScore: plan.launch_prep_score,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
    }
  }

  /**
   * Recommend business entity type based on onboarding data
   */
  private recommendEntityType(data: OnboardingData): string {
    // Tech/SaaS with investors -> Corporation
    if (data.businessCategory === 'tech_saas' && data.fundingApproach === 'investment') {
      return 'CORPORATION'
    }

    // Multiple people -> LLC or Partnership
    if (data.teamSize && data.teamSize > 1) {
      return 'LLC'
    }

    // Solo founder, not seeking investment -> LLC (default safe choice)
    return 'LLC'
  }

  /**
   * Generate plan summary based on onboarding data
   */
  private generatePlanSummary(data: OnboardingData): string {
    const category = data.businessCategory || 'business'
    const stage = data.currentStage || 'planning'
    const timeline = data.timeline || 'soon'

    return `You're starting a ${category} business in the ${stage} stage, planning to launch ${timeline}. We've created a customized roadmap to guide you through the legal, financial, and operational steps needed to launch successfully.`
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(data: OnboardingData): Record<string, any> {
    return {
      businessType: data.businessCategory,
      stage: data.currentStage,
      state: data.stateCode,
      timeline: data.timeline,
      teamSize: data.teamSize,
      fundingApproach: data.fundingApproach,
      experience: data.previousExperience,
      primaryConcern: data.primaryConcern,
      primaryGoals: data.primaryGoals,
    }
  }

  /**
   * Generate phase-specific recommendations
   */
  private generatePhaseRecommendations(data: OnboardingData): Record<string, any> {
    return {
      ideation: {
        focus: 'Finalize your business concept and validate market fit',
        priority: data.currentStage === 'idea' ? 'high' : 'medium',
      },
      legal: {
        focus: `Form your business entity in ${data.stateCode} and handle compliance`,
        priority: 'high',
      },
      financial: {
        focus: 'Set up accounting, taxes, and financial projections',
        priority: data.primaryConcern === 'financial' ? 'high' : 'medium',
      },
      launch_prep: {
        focus: 'Prepare for launch with final operational setup',
        priority: data.timeline === 'asap' ? 'high' : 'medium',
      },
    }
  }

  /**
   * Map database row to OnboardingSession type
   */
  private mapDbToSession(data: any): OnboardingSession {
    return {
      id: data.id,
      userId: data.user_id,
      businessName: data.business_name,
      businessCategory: data.business_category as BusinessCategory,
      currentStage: data.current_stage as CurrentStage,
      stateCode: data.state_code,
      primaryGoals: data.primary_goals || [],
      timeline: data.timeline as Timeline,
      teamSize: data.team_size,
      fundingApproach: data.funding_approach as FundingApproach,
      previousExperience: data.previous_experience as PreviousExperience,
      primaryConcern: data.primary_concern as PrimaryConcern,
      currentStep: data.current_step,
      stepsCompleted: data.steps_completed || [],
      completed: data.completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}

export const onboardingService = new OnboardingService()
