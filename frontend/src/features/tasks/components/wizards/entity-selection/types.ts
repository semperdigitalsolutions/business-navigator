/**
 * Entity Selection Wizard Types
 * Issue #76: Types for the entity selection wizard
 */

export type EntityType = 'llc' | 'c_corp' | 's_corp' | 'sole_prop'

export type InvestorAnswer = 'yes' | 'no' | 'not_sure'
export type CofounderAnswer = 'just_me' | '2_to_3' | '4_plus'
export type RevenueRange = 'under_50k' | '50k_to_200k' | 'over_200k' | null

export interface EntitySelectionQuestions {
  /** Will you have outside investors? */
  hasInvestors: InvestorAnswer | null
  /** How many co-founders? */
  cofounderCount: CofounderAnswer | null
  /** Expected first-year revenue (optional) */
  expectedRevenue: RevenueRange
}

export interface EntityRecommendation {
  /** Recommended entity type */
  recommended: EntityType
  /** Confidence level (0-100) */
  confidence: number
  /** Reasoning for the recommendation */
  reasoning: string
  /** Alternative options with brief explanations */
  alternatives: Array<{
    type: EntityType
    reason: string
  }>
}

export interface EntitySelectionData {
  /** Answers to the wizard questions */
  questions: EntitySelectionQuestions
  /** AI-generated recommendation */
  recommendation: EntityRecommendation | null
  /** User's final selection */
  selectedEntity: EntityType | null
  /** Whether the user has viewed the comparison */
  hasViewedComparison: boolean
}

export const INITIAL_ENTITY_SELECTION_DATA: EntitySelectionData = {
  questions: {
    hasInvestors: null,
    cofounderCount: null,
    expectedRevenue: null,
  },
  recommendation: null,
  selectedEntity: null,
  hasViewedComparison: false,
}

export type EntitySelectionStep =
  | 'intro'
  | 'questions'
  | 'recommendation'
  | 'comparison'
  | 'confirmation'

export const ENTITY_SELECTION_STEPS: EntitySelectionStep[] = [
  'intro',
  'questions',
  'recommendation',
  'comparison',
  'confirmation',
]

export const STEP_TITLES: Record<EntitySelectionStep, string> = {
  intro: 'Choose Your Business Structure',
  questions: 'A Few Quick Questions',
  recommendation: 'Our Recommendation',
  comparison: 'Compare Your Options',
  confirmation: 'Confirm Your Choice',
}

export const STEP_DESCRIPTIONS: Record<EntitySelectionStep, string> = {
  intro: 'Your entity type affects taxes, liability, and fundraising',
  questions: 'Help us find the best fit for your business',
  recommendation: 'Based on your answers, here is what we suggest',
  comparison: 'See how each option compares side-by-side',
  confirmation: 'Review and finalize your decision',
}

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  llc: 'LLC',
  c_corp: 'C-Corp',
  s_corp: 'S-Corp',
  sole_prop: 'Sole Proprietorship',
}

export const ENTITY_TYPE_FULL_NAMES: Record<EntityType, string> = {
  llc: 'Limited Liability Company',
  c_corp: 'C Corporation',
  s_corp: 'S Corporation',
  sole_prop: 'Sole Proprietorship',
}
