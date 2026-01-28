/**
 * Key Decisions Service
 * Handles fetching and formatting key business decisions from onboarding data
 */
import { supabase } from '@/config/database.js'
import type { KeyDecision, KeyDecisions } from '@shared/types'

export class KeyDecisionsService {
  /**
   * Get key decisions from onboarding session and business plan
   */
  async getKeyDecisions(userId: string): Promise<KeyDecisions> {
    // Fetch onboarding session and business plan in parallel
    const [onboardingResult, businessPlanResult] = await Promise.all([
      supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('business_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ])

    const session = onboardingResult.data
    const businessPlan = businessPlanResult.data

    return this.buildKeyDecisions(session, businessPlan)
  }

  /**
   * Build key decisions array from onboarding and business plan data
   */
  private buildKeyDecisions(session: unknown, businessPlan: unknown): KeyDecisions {
    const decisions: KeyDecision[] = []
    const sessionData = session as Record<string, unknown> | null
    const planData = businessPlan as Record<string, unknown> | null

    // Business Name
    decisions.push(this.createBusinessNameDecision(sessionData))

    // Entity Type
    decisions.push(this.createEntityTypeDecision(planData))

    // State of Formation
    decisions.push(this.createFormationStateDecision(sessionData, planData))

    // Business Category
    decisions.push(this.createBusinessCategoryDecision(sessionData))

    // Funding Approach
    decisions.push(this.createFundingDecision(sessionData))

    // Timeline
    decisions.push(this.createTimelineDecision(sessionData))

    const completedCount = decisions.filter((d) => d.status === 'decided').length

    return {
      decisions,
      completedCount,
      totalCount: decisions.length,
    }
  }

  private createBusinessNameDecision(session: Record<string, unknown> | null): KeyDecision {
    return {
      id: 'business-name',
      label: 'Business Name',
      value: (session?.business_name as string) || 'Not yet decided',
      icon: 'building',
      status: session?.business_name ? 'decided' : 'pending',
      category: 'business',
      updatedAt: session?.updated_at ? new Date(session.updated_at as string) : undefined,
    }
  }

  private createEntityTypeDecision(businessPlan: Record<string, unknown> | null): KeyDecision {
    const entityType = businessPlan?.recommended_entity_type as string | undefined
    return {
      id: 'entity-type',
      label: 'Entity Type',
      value: entityType ? this.formatEntityType(entityType) : 'Not yet decided',
      icon: 'document',
      status: entityType ? 'decided' : 'pending',
      category: 'legal',
      updatedAt: businessPlan?.updated_at ? new Date(businessPlan.updated_at as string) : undefined,
    }
  }

  private createFormationStateDecision(
    session: Record<string, unknown> | null,
    businessPlan: Record<string, unknown> | null
  ): KeyDecision {
    const stateCode = (session?.state_code as string) || (businessPlan?.recommended_state as string)
    return {
      id: 'formation-state',
      label: 'State of Formation',
      value: stateCode ? this.formatStateName(stateCode) : 'Not yet decided',
      icon: 'map',
      status: stateCode ? 'decided' : 'pending',
      category: 'location',
      updatedAt: session?.updated_at ? new Date(session.updated_at as string) : undefined,
    }
  }

  private createBusinessCategoryDecision(session: Record<string, unknown> | null): KeyDecision {
    const category = session?.business_category as string | undefined
    return {
      id: 'business-category',
      label: 'Business Category',
      value: category ? this.formatCategory(category) : 'Not yet decided',
      icon: 'tag',
      status: category ? 'decided' : 'pending',
      category: 'business',
      updatedAt: session?.updated_at ? new Date(session.updated_at as string) : undefined,
    }
  }

  private createFundingDecision(session: Record<string, unknown> | null): KeyDecision {
    const funding = session?.funding_approach as string | undefined
    return {
      id: 'funding-approach',
      label: 'Funding Approach',
      value: funding ? this.formatFundingApproach(funding) : 'Not yet decided',
      icon: 'currency',
      status: funding ? 'decided' : 'pending',
      category: 'financial',
      updatedAt: session?.updated_at ? new Date(session.updated_at as string) : undefined,
    }
  }

  private createTimelineDecision(session: Record<string, unknown> | null): KeyDecision {
    const timeline = session?.timeline as string | undefined
    return {
      id: 'timeline',
      label: 'Launch Timeline',
      value: timeline ? this.formatTimeline(timeline) : 'Not yet decided',
      icon: 'calendar',
      status: timeline ? 'decided' : 'pending',
      category: 'business',
      updatedAt: session?.updated_at ? new Date(session.updated_at as string) : undefined,
    }
  }

  private formatEntityType(type: string): string {
    const types: Record<string, string> = {
      LLC: 'LLC',
      CORPORATION: 'Corporation',
      SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
      PARTNERSHIP: 'Partnership',
    }
    return types[type] || type
  }

  private formatStateName(code: string): string {
    return code.toUpperCase()
  }

  private formatCategory(category: string): string {
    const categories: Record<string, string> = {
      tech_saas: 'Tech / SaaS',
      service: 'Service Business',
      ecommerce: 'E-Commerce',
      local: 'Local Business',
    }
    return categories[category] || category
  }

  private formatFundingApproach(approach: string): string {
    const approaches: Record<string, string> = {
      personal_savings: 'Personal Savings',
      investment: 'Seeking Investment',
      loan: 'Business Loan',
      multiple: 'Multiple Sources',
      none: 'Not Yet Determined',
    }
    return approaches[approach] || approach
  }

  private formatTimeline(timeline: string): string {
    const timelines: Record<string, string> = {
      asap: 'As Soon As Possible',
      soon: 'Within 3 Months',
      later: 'Within 6 Months',
      exploring: 'Still Exploring',
    }
    return timelines[timeline] || timeline
  }
}

export const keyDecisionsService = new KeyDecisionsService()
