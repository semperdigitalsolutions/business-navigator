/**
 * Onboarding Validation Schemas (TypeBox)
 * Comprehensive validation for 7-step onboarding wizard
 *
 * SECURITY: HIGH - Prevents invalid data injection and ensures data integrity
 */

import { Type as t, type Static } from '@sinclair/typebox'

/**
 * Step 1: Business Name (optional at this stage)
 */
export const BusinessNameSchema = t.Optional(
  t.String({
    minLength: 1,
    maxLength: 100,
    description: 'Business name',
  })
)

/**
 * Step 2: Business Category/Type
 */
export const BusinessCategorySchema = t.Union(
  [t.Literal('tech_saas'), t.Literal('service'), t.Literal('ecommerce'), t.Literal('local')],
  {
    description: 'Business category',
  }
)

/**
 * Current Stage
 */
export const CurrentStageSchema = t.Union(
  [t.Literal('idea'), t.Literal('planning'), t.Literal('started')],
  {
    description: 'Current business stage',
  }
)

/**
 * Step 3: US State Selection
 * All 50 states + DC + territories
 */
const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
] as const

export const StateCodeSchema = t.Union(US_STATES.map((state) => t.Literal(state)) as any, {
  description: 'US state code',
})

/**
 * Step 4: Primary Goals (multi-select, max 5)
 */
const PRIMARY_GOALS = [
  'legal_compliance',
  'financial_planning',
  'marketing_strategy',
  'product_development',
  'team_building',
  'funding',
  'operations',
  'sales',
  'customer_acquisition',
  'scaling',
] as const

export const PrimaryGoalsSchema = t.Array(
  t.Union(PRIMARY_GOALS.map((goal) => t.Literal(goal)) as any),
  {
    minItems: 1,
    maxItems: 5,
    description: 'Primary business goals (1-5 selections)',
  }
)

/**
 * Step 5: Timeline
 */
export const TimelineSchema = t.Union(
  [t.Literal('asap'), t.Literal('soon'), t.Literal('later'), t.Literal('exploring')],
  {
    description: 'Business launch timeline',
  }
)

/**
 * Step 6: Team Size
 */
export const TeamSizeSchema = t.Integer({
  minimum: 1,
  maximum: 1000,
  description: 'Team size (1-1000)',
})

/**
 * Step 7: Funding Approach
 */
export const FundingApproachSchema = t.Union(
  [
    t.Literal('personal_savings'),
    t.Literal('investment'),
    t.Literal('loan'),
    t.Literal('multiple'),
    t.Literal('none'),
  ],
  {
    description: 'Funding approach',
  }
)

/**
 * Previous Experience
 */
export const PreviousExperienceSchema = t.Union(
  [t.Literal('first_business'), t.Literal('experienced')],
  {
    description: 'Previous business experience',
  }
)

/**
 * Primary Concern
 */
export const PrimaryConcernSchema = t.Union(
  [
    t.Literal('legal'),
    t.Literal('financial'),
    t.Literal('marketing'),
    t.Literal('product'),
    t.Literal('time'),
  ],
  {
    description: 'Primary concern or challenge',
  }
)

/**
 * Complete onboarding data (all steps)
 */
export const OnboardingDataSchema = t.Object({
  // Step 1
  businessName: BusinessNameSchema,

  // Step 2
  businessCategory: BusinessCategorySchema,
  currentStage: CurrentStageSchema,

  // Step 3
  stateCode: StateCodeSchema,

  // Step 4
  primaryGoals: PrimaryGoalsSchema,

  // Step 5
  timeline: TimelineSchema,

  // Step 6
  teamSize: TeamSizeSchema,

  // Step 7
  fundingApproach: FundingApproachSchema,
  previousExperience: PreviousExperienceSchema,
  primaryConcern: PrimaryConcernSchema,

  // Progress tracking
  currentStep: t.Optional(
    t.Integer({
      minimum: 1,
      maximum: 7,
    })
  ),
  stepsCompleted: t.Optional(
    t.Array(t.Integer({ minimum: 1, maximum: 7 }), {
      maxItems: 7,
    })
  ),
})

/**
 * Partial onboarding data (for auto-save during wizard)
 */
export const PartialOnboardingDataSchema = t.Partial(OnboardingDataSchema)

/**
 * Onboarding save request (includes step tracking)
 */
export const OnboardingSaveRequestSchema = t.Object({
  data: PartialOnboardingDataSchema,
  currentStep: t.Integer({
    minimum: 1,
    maximum: 7,
  }),
  completedSteps: t.Array(t.Integer({ minimum: 1, maximum: 7 }), {
    maxItems: 7,
    uniqueItems: true,
  }),
})

/**
 * Onboarding completion request (requires all fields)
 */
export const OnboardingCompleteRequestSchema = t.Object({
  data: OnboardingDataSchema,
})

/**
 * Type exports
 */
export type BusinessCategory = Static<typeof BusinessCategorySchema>
export type CurrentStage = Static<typeof CurrentStageSchema>
export type StateCode = Static<typeof StateCodeSchema>
export type PrimaryGoals = Static<typeof PrimaryGoalsSchema>
export type Timeline = Static<typeof TimelineSchema>
export type TeamSize = Static<typeof TeamSizeSchema>
export type FundingApproach = Static<typeof FundingApproachSchema>
export type PreviousExperience = Static<typeof PreviousExperienceSchema>
export type PrimaryConcern = Static<typeof PrimaryConcernSchema>
export type OnboardingData = Static<typeof OnboardingDataSchema>
export type PartialOnboardingData = Static<typeof PartialOnboardingDataSchema>
export type OnboardingSaveRequest = Static<typeof OnboardingSaveRequestSchema>
export type OnboardingCompleteRequest = Static<typeof OnboardingCompleteRequestSchema>

/**
 * Helper: Validate state code
 */
export function isValidStateCode(code: string): boolean {
  return US_STATES.includes(code as any)
}

/**
 * Helper: Get step validation schema
 */
export function getStepSchema(step: number) {
  switch (step) {
    case 1:
      return t.Object({ businessName: BusinessNameSchema })
    case 2:
      return t.Object({
        businessCategory: BusinessCategorySchema,
        currentStage: CurrentStageSchema,
      })
    case 3:
      return t.Object({ stateCode: StateCodeSchema })
    case 4:
      return t.Object({ primaryGoals: PrimaryGoalsSchema })
    case 5:
      return t.Object({ timeline: TimelineSchema })
    case 6:
      return t.Object({ teamSize: TeamSizeSchema })
    case 7:
      return t.Object({
        fundingApproach: FundingApproachSchema,
        previousExperience: PreviousExperienceSchema,
        primaryConcern: PrimaryConcernSchema,
      })
    default:
      throw new Error(`Invalid step number: ${step}`)
  }
}
