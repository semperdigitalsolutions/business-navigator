/**
 * Business formation routes
 */
import { Elysia, t } from 'elysia'
import { businessService } from '@/services/business.service.js'
import { authMiddleware } from '@/middleware/auth.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { BusinessStatus, BusinessType } from '@shared/types'

export const businessRoutes = new Elysia({ prefix: '/api/businesses' })
  // Get all businesses for authenticated user
  .get('/', async ({ request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const businesses = await businessService.getBusinesses(auth.user.id)
      return successResponse(businesses)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  // Get a single business by ID
  .get('/:id', async ({ params, request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const business = await businessService.getBusiness(params.id, auth.user.id)
      return successResponse(business)
    } catch (error: any) {
      return errorResponse(error.message, 404)
    }
  })

  // Create a new business
  .post(
    '/',
    async ({ body, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const business = await businessService.createBusiness(body, auth.user)
        return successResponse(business, 'Business created successfully')
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        type: t.Enum(BusinessType),
        state: t.String({ minLength: 2, maxLength: 2 }),
      }),
    }
  )

  // Update a business
  .patch(
    '/:id',
    async ({ params, body, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.user) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const business = await businessService.updateBusiness(params.id, body, auth.user.id)
        return successResponse(business, 'Business updated successfully')
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Partial(
        t.Object({
          name: t.String({ minLength: 1 }),
          type: t.Enum(BusinessType),
          state: t.String({ minLength: 2, maxLength: 2 }),
          status: t.Enum(BusinessStatus),
        })
      ),
    }
  )

  // Delete a business
  .delete('/:id', async ({ params, request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.user) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      await businessService.deleteBusiness(params.id, auth.user.id)
      return successResponse({ success: true }, 'Business deleted successfully')
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })
