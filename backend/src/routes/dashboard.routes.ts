/**
 * Dashboard Routes
 * Aggregated dashboard data endpoints
 */
import { Elysia, t } from 'elysia'
import { dashboardService } from '@/services/dashboard.service.js'
import { authMiddleware } from '@/middleware/auth.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { normalRateLimit } from '@/middleware/rate-limit.js'

export const dashboardRoutes = new Elysia({ prefix: '/api/dashboard' })
  // Apply rate limiting
  .onBeforeHandle(normalRateLimit)

  /**
   * GET /api/dashboard
   * Get complete dashboard data (single aggregated request)
   */
  .get('/', async ({ request, query }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const businessId = query.businessId as string | undefined
      const dashboardData = await dashboardService.getDashboardData(auth.user.id, businessId)

      return successResponse(dashboardData)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  /**
   * GET /api/dashboard/confidence
   * Get real-time confidence score
   */
  .get('/confidence', async ({ request, query }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const businessId = query.businessId as string | undefined
      const confidenceScore = await dashboardService.getConfidenceScore(auth.user.id, businessId)

      return successResponse(confidenceScore)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  /**
   * GET /api/dashboard/hero-task
   * Get current hero task
   */
  .get('/hero-task', async ({ request, query }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const businessId = query.businessId as string | undefined
      const heroTask = await dashboardService.getHeroTask(auth.user.id, businessId)

      if (!heroTask) {
        return successResponse(
          { heroTask: null },
          'No pending tasks. Great job staying on top of your business formation!'
        )
      }

      return successResponse({ heroTask })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  /**
   * POST /api/dashboard/hero-task/:id/complete
   * Mark hero task as complete (optimistic update support)
   */
  .post(
    '/hero-task/:id/complete',
    async ({ params, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await dashboardService.completeHeroTask(auth.user.id, params.id)

        return successResponse(
          result,
          'Task completed! Keep up the great progress on your business formation.'
        )
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
    }
  )

  /**
   * POST /api/dashboard/hero-task/:id/skip
   * Skip hero task (won't be recommended again for 24 hours)
   */
  .post(
    '/hero-task/:id/skip',
    async ({ params, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await dashboardService.skipHeroTask(auth.user.id, params.id)

        return successResponse(
          result,
          "No problem! We'll focus on other priorities for now and circle back to this later."
        )
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
    }
  )
