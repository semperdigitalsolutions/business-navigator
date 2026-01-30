/**
 * Credits API Routes
 * Issue #204: API routes for Epic 9 credit-based AI usage system
 *
 * Provides endpoints for credit balance, transactions, and usage stats.
 */
import { Elysia, t } from 'elysia'
import { authMiddleware } from '@/middleware/auth.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import {
  creditsService,
  InsufficientCreditsError,
  UserNotFoundError,
} from '@/services/credits.service.js'

export const creditsRoutes = new Elysia({ prefix: '/api/credits' })
  // Get current user's credit balance
  .get('/balance', async ({ request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.userId) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const balance = await creditsService.getBalance(auth.userId)
      return successResponse({ balance })
    } catch (error: any) {
      if (error instanceof UserNotFoundError) {
        return errorResponse('User not found', 404)
      }
      return errorResponse(error.message)
    }
  })

  // Get credit usage statistics
  .get('/usage', async ({ request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.userId) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const stats = await creditsService.getUsageStats(auth.userId)
      return successResponse({ stats })
    } catch (error: any) {
      if (error instanceof UserNotFoundError) {
        return errorResponse('User not found', 404)
      }
      return errorResponse(error.message)
    }
  })

  // Get transaction history
  .get(
    '/transactions',
    async ({ request, query }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.userId) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const limit = query.limit ? parseInt(query.limit, 10) : 50
        const transactions = await creditsService.getTransactionHistory(auth.userId, limit)
        return successResponse({ transactions })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
      }),
    }
  )

  // Check if user has enough credits
  .post(
    '/check',
    async ({ request, body }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.userId) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const hasCredits = await creditsService.checkCredits(auth.userId, body.amount)
        return successResponse({ hasCredits, amount: body.amount })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        amount: t.Number({ minimum: 1 }),
      }),
    }
  )

  // Deduct credits for AI model usage
  .post(
    '/deduct',
    async ({ request, body }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.userId) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const newBalance = await creditsService.deductCredits(
          auth.userId,
          body.modelId,
          body.messageId
        )
        return successResponse({ newBalance })
      } catch (error: any) {
        if (error instanceof InsufficientCreditsError) {
          return {
            success: false,
            error: error.message,
            data: {
              required: error.required,
              available: error.available,
            },
          }
        }
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        modelId: t.String({ minLength: 1 }),
        messageId: t.Optional(t.String()),
      }),
    }
  )
