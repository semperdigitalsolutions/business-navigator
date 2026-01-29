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

  // POST /api/tasks/:id/complete - Mark task as completed
  // Issue #59
  .post(
    '/:id/complete',
    async ({ request, params, body }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await tasksService.completeTask(
          params.id,
          auth.user.id,
          body.completionData,
          body.businessId
        )
        return successResponse(result, 'Task completed successfully')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        completionData: t.Optional(t.Record(t.String(), t.Unknown())),
        businessId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/tasks/:id/save - Auto-save task draft data
  // Issue #60
  .post(
    '/:id/save',
    async ({ request, params, body }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await tasksService.saveTaskDraft(
          params.id,
          auth.user.id,
          body.draftData,
          body.businessId
        )
        return successResponse(result, 'Draft saved')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        draftData: t.Record(t.String(), t.Unknown()),
        businessId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/tasks/:id/skip - Mark task as skipped
  // Issue #61
  .post(
    '/:id/skip',
    async ({ request, params, body }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        // Verify task exists
        const task = await tasksService.getTaskById(params.id, auth.user.id, body.businessId)
        if (!task) {
          return errorResponse('Task not found', 404)
        }

        const result = await tasksService.skipTask(
          params.id,
          auth.user.id,
          body.reason,
          body.businessId
        )

        if (!result.success) {
          return errorResponse(result.error || 'Failed to skip task', 400)
        }

        return successResponse({ skipped: true }, 'Task skipped successfully')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        reason: t.Optional(t.String({ maxLength: 500 })),
        businessId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/tasks/:id/unskip - Restore skipped task
  // Issue #61
  .post(
    '/:id/unskip',
    async ({ request, params, body }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        // Verify task exists
        const task = await tasksService.getTaskById(params.id, auth.user.id, body.businessId)
        if (!task) {
          return errorResponse('Task not found', 404)
        }

        const result = await tasksService.unskipTask(params.id, auth.user.id, body.businessId)

        if (!result.success) {
          return errorResponse(result.error || 'Failed to unskip task', 400)
        }

        return successResponse({ unskipped: true }, 'Task restored successfully')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        businessId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/tasks/:id/start - Start a task with dependency checking
  // Issue #64
  .post(
    '/:id/start',
    async ({ request, params, body }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await tasksService.startTask(params.id, auth.user.id, body.businessId)

        if (!result.started) {
          // Task could not be started due to dependencies or already completed
          return successResponse(
            {
              task: result.task,
              started: false,
              dependencyCheck: result.dependencyCheck,
            },
            result.dependencyCheck.reason || 'Task cannot be started'
          )
        }

        return successResponse(
          {
            task: result.task,
            started: true,
            dependencyCheck: result.dependencyCheck,
          },
          'Task started successfully'
        )
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return errorResponse(message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        businessId: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/tasks/:id/dependencies - Get dependency info for a task
  // Issue #64
  .get(
    '/:id/dependencies',
    async ({ request, params, query }) => {
      const auth = await authMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const result = await tasksService.getTaskDependencies(
          params.id,
          auth.user.id,
          query.businessId
        )
        return successResponse(result)
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
