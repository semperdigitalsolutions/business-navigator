/**
 * Tasks Routes
 * Handles task-related API endpoints
 * Issue #57: GET /api/tasks - List all tasks grouped by phase
 */
import { Elysia, t } from 'elysia'
import { authMiddleware } from '@/middleware/auth.js'
import { normalRateLimit } from '@/middleware/rate-limit.js'
import { tasksService } from '@/services/tasks.service.js'
import { errorResponse, successResponse } from '@/middleware/error.js'

export const tasksRoutes = new Elysia({ prefix: '/api/tasks' })
  .onBeforeHandle(normalRateLimit)

  // GET /api/tasks - List all tasks grouped by phase with unlock status
  .get(
    '/',
    async ({ request, query }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const businessId = query.businessId
        const result = await tasksService.getTasksGroupedByPhase(auth.user.id, businessId)
        return successResponse(result)
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

  // GET /api/tasks/:id - Get single task by ID
  .get(
    '/:id',
    async ({ request, params, query }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const task = await tasksService.getTaskById(params.id, auth.user.id, query.businessId)
        if (!task) {
          return errorResponse('Task not found', 404)
        }
        return successResponse({ task })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        businessId: t.Optional(t.String()),
      }),
    }
  )
