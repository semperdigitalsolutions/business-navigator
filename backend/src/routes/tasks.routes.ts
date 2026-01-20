/**
 * Tasks Routes
 * Handles task-related API endpoints
 */
import { Elysia, t } from 'elysia'
import { authMiddleware } from '@/middleware/auth.js'
import { normalRateLimit } from '@/middleware/rate-limit.js'
import { dashboardService } from '@/services/dashboard.service.js'
import { errorResponse, successResponse } from '@/middleware/error.js'

export const tasksRoutes = new Elysia({ prefix: '/api/tasks' })
  .onBeforeHandle(normalRateLimit)

  // GET /api/tasks - List all tasks for user
  .get(
    '/',
    async ({ request, query }) => {
      const auth = await authMiddleware({ request } as { request: Request })
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const businessId = query.businessId
        const tasks = await dashboardService.getTasks(auth.user.id, businessId)
        return successResponse({ tasks })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      query: t.Object({
        businessId: t.Optional(t.String()),
      }),
    }
  )
