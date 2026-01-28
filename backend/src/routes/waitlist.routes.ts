/**
 * Waitlist Routes
 * Handles beta waitlist signup and count endpoints
 */
import { Elysia, t } from 'elysia'
import { waitlistService } from '@/services/waitlist.service.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { strictRateLimit } from '@/middleware/rate-limit.js'

export const waitlistRoutes = new Elysia({ prefix: '/api/waitlist' })
  .onBeforeHandle(strictRateLimit)

  // POST /api/waitlist - Join the beta waitlist
  .post(
    '/',
    async ({ body }) => {
      try {
        await waitlistService.addToWaitlist(body)
        return successResponse({ added: true }, 'You have been added to the waitlist!')
      } catch (error: unknown) {
        // Don't reveal whether the email already exists
        console.error('Waitlist signup failed:', error)
        return successResponse({ added: true }, 'You have been added to the waitlist!')
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        firstName: t.String({ minLength: 1, maxLength: 100 }),
        stage: t.Optional(
          t.Union([
            t.Literal('idea'),
            t.Literal('research'),
            t.Literal('ready'),
            t.Literal('started'),
          ])
        ),
        emailOptIn: t.Boolean(),
      }),
    }
  )

  // GET /api/waitlist/count - Get total waitlist signup count
  .get('/count', async () => {
    try {
      const count = await waitlistService.getWaitlistCount()
      return successResponse({ count })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return errorResponse(message)
    }
  })
