/**
 * Authentication routes using Supabase
 */
import { Elysia, t } from 'elysia'
import { supabase, supabaseAdmin } from '@/config/database.js'
import { env } from '@/config/env.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { strictRateLimit } from '@/middleware/rate-limit.js'
import { getPasswordStrengthLabel, validatePassword } from '@/utils/password-validator.js'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  // Apply strict rate limiting to all auth endpoints
  .onBeforeHandle(strictRateLimit)

  // Validate password strength (for real-time feedback)
  .post(
    '/password/validate',
    async ({ body }) => {
      try {
        const validation = validatePassword(body.password)

        return successResponse({
          isValid: validation.isValid,
          score: validation.score,
          strength: getPasswordStrengthLabel(validation.score),
          errors: validation.errors,
          suggestions: validation.suggestions,
        })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        password: t.String(),
      }),
    }
  )

  // Register a new user
  .post(
    '/register',
    async ({ body }) => {
      try {
        // Validate password strength
        const passwordValidation = validatePassword(body.password)
        if (!passwordValidation.isValid) {
          return errorResponse(`Weak password: ${passwordValidation.errors.join('. ')}`, 400)
        }

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

  /**
   * Password Reset Routes
   */

  // Request password reset email
  .post(
    '/password/forgot',
    async ({ body }) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
          redirectTo: `${env.FRONTEND_URL || 'http://localhost:3000'}`,
        })

        if (error) {
          // Don't reveal if email exists or not for security
          console.error('Password reset error:', error.message)
        }

        // Always return success to prevent email enumeration
        return successResponse(
          { sent: true },
          'If an account exists, a password reset link has been sent.'
        )
      } catch (error: any) {
        console.error('Password reset error:', error.message)
        return successResponse(
          { sent: true },
          'If an account exists, a password reset link has been sent.'
        )
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    }
  )

  // Reset password with recovery token
  .post(
    '/password/reset',
    async ({ body, request }) => {
      try {
        const authorization = request.headers.get('Authorization')
        if (!authorization || !authorization.startsWith('Bearer ')) {
          return errorResponse('Recovery token required', 401)
        }

        const accessToken = authorization.replace('Bearer ', '')

        // Validate password strength
        const passwordValidation = validatePassword(body.password)
        if (!passwordValidation.isValid) {
          return errorResponse(`Weak password: ${passwordValidation.errors.join('. ')}`, 400)
        }

        // First validate the recovery token and get the user
        const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

        if (userError || !userData.user) {
          return errorResponse('Invalid or expired recovery token', 401)
        }

        // Use admin client to update the user's password
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
          password: body.password,
        })

        if (error) {
          return errorResponse(error.message, 400)
        }

        return successResponse({ updated: true }, 'Password has been reset successfully.')
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        password: t.String({ minLength: 8 }),
      }),
    }
  )
