/**
 * Onboarding Routes
 * Handles 7-step onboarding wizard API endpoints
 */
import { Elysia, t } from 'elysia'
import { onboardingService } from '@/services/onboarding.service.js'
import { authMiddleware } from '@/middleware/auth.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { normalRateLimit } from '@/middleware/rate-limit.js'
import {
  PartialOnboardingDataSchema,
  OnboardingDataSchema,
  BusinessCategorySchema,
  CurrentStageSchema,
  StateCodeSchema,
  PrimaryGoalsSchema,
  TimelineSchema,
  TeamSizeSchema,
  FundingApproachSchema,
  PreviousExperienceSchema,
  PrimaryConcernSchema,
} from '@/validation/onboarding.schemas.js'

export const onboardingRoutes = new Elysia({ prefix: '/api/onboarding' })
  // Apply rate limiting
  .onBeforeHandle(normalRateLimit)

  /**
   * GET /api/onboarding/status
   * Check onboarding completion status
   */
  .get('/status', async ({ request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const status = await onboardingService.getOnboardingStatus(auth.user.id)
      return successResponse(status)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  /**
   * GET /api/onboarding/resume
   * Get incomplete onboarding session to resume
   */
  .get('/resume', async ({ request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const session = await onboardingService.getIncompleteSession(auth.user.id)

      if (!session) {
        return errorResponse('No incomplete onboarding session found', 404)
      }

      return successResponse(session)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  /**
   * POST /api/onboarding/save
   * Auto-save onboarding progress (called on step change)
   */
  .post(
    '/save',
    async ({ body, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const session = await onboardingService.saveProgress({
          userId: auth.user.id,
          data: body.data,
          currentStep: body.currentStep,
          completedSteps: body.completedSteps,
        })

        return successResponse(session, 'Progress saved successfully')
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        data: t.Partial(
          t.Object({
            businessName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            businessCategory: t.Optional(BusinessCategorySchema),
            currentStage: t.Optional(CurrentStageSchema),
            stateCode: t.Optional(StateCodeSchema),
            primaryGoals: t.Optional(PrimaryGoalsSchema),
            timeline: t.Optional(TimelineSchema),
            teamSize: t.Optional(TeamSizeSchema),
            fundingApproach: t.Optional(FundingApproachSchema),
            previousExperience: t.Optional(PreviousExperienceSchema),
            primaryConcern: t.Optional(PrimaryConcernSchema),
          })
        ),
        currentStep: t.Integer({ minimum: 1, maximum: 7 }),
        completedSteps: t.Array(t.Integer({ minimum: 1, maximum: 7 }), {
          maxItems: 7,
          uniqueItems: true,
        }),
      }),
    }
  )

  /**
   * POST /api/onboarding/complete
   * Complete onboarding wizard and generate business plan
   */
  .post(
    '/complete',
    async ({ body, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await onboardingService.completeOnboarding({
          userId: auth.user.id,
          data: body.data,
        })

        return successResponse(
          {
            session: result.session,
            businessPlan: result.businessPlan,
          },
          'Onboarding completed successfully! Your business plan is ready.'
        )
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        data: t.Object({
          businessName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
          businessCategory: BusinessCategorySchema,
          currentStage: CurrentStageSchema,
          stateCode: StateCodeSchema,
          primaryGoals: PrimaryGoalsSchema,
          timeline: TimelineSchema,
          teamSize: TeamSizeSchema,
          fundingApproach: FundingApproachSchema,
          previousExperience: PreviousExperienceSchema,
          primaryConcern: PrimaryConcernSchema,
        }),
      }),
    }
  )
