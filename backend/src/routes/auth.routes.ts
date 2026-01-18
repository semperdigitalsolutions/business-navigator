/**
 * Authentication routes using Supabase
 */
import { Elysia, t } from 'elysia'
import { supabase } from '@/config/database.js'
import { errorResponse, successResponse } from '@/middleware/error.js'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  // Register a new user
  .post(
    '/register',
    async ({ body }) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: body.email,
          password: body.password,
          options: {
            data: {
              first_name: body.firstName,
              last_name: body.lastName,
            },
          },
        })

        if (error) {
          return errorResponse(error.message, 400)
        }

        return successResponse(
          {
            user: data.user,
            session: data.session,
          },
          'Registration successful. Please check your email to confirm your account.'
        )
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        firstName: t.String({ minLength: 1 }),
        lastName: t.String({ minLength: 1 }),
      }),
    }
  )

  // Login
  .post(
    '/login',
    async ({ body }) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: body.email,
          password: body.password,
        })

        if (error) {
          return errorResponse(error.message, 401)
        }

        return successResponse({
          user: data.user,
          session: data.session,
        })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // Logout
  .post('/logout', async ({ request }) => {
    try {
      const authorization = request.headers.get('Authorization')
      if (!authorization) {
        return errorResponse('No authorization header', 401)
      }

      const _token = authorization.replace('Bearer ', '')
      const { error } = await supabase.auth.signOut()

      if (error) {
        return errorResponse(error.message)
      }

      return successResponse({ success: true }, 'Logged out successfully')
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  // Refresh token
  .post(
    '/refresh',
    async ({ body }) => {
      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: body.refreshToken,
        })

        if (error) {
          return errorResponse(error.message, 401)
        }

        return successResponse({
          session: data.session,
        })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    }
  )

  // Get current user
  .get('/me', async ({ request }) => {
    try {
      const authorization = request.headers.get('Authorization')
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return errorResponse('Unauthorized', 401)
      }

      const token = authorization.replace('Bearer ', '')
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)

      if (error || !user) {
        return errorResponse('Invalid token', 401)
      }

      return successResponse({
        user,
      })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })
