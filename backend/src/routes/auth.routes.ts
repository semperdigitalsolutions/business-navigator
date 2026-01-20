/**
 * Authentication routes using Supabase
 */
import { Elysia, t } from 'elysia'
import { supabase } from '@/config/database.js'
import { env } from '@/config/env.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { strictRateLimit } from '@/middleware/rate-limit.js'
import { validatePassword, getPasswordStrengthLabel } from '@/utils/password-validator.js'
import {
  createOAuthSession,
  validateOAuthState,
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
} from '@/utils/oauth.js'

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
   * OAuth Routes (Week 2)
   */

  // Initiate Google OAuth flow
  .get('/oauth/google', async ({ query }) => {
    try {
      // Check if OAuth is configured
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.OAUTH_REDIRECT_URI) {
        return errorResponse('Google OAuth is not configured', 500)
      }

      const redirectUrl = (query.redirect as string) || env.FRONTEND_URL

      // Create OAuth session with state and PKCE
      const { state, codeChallenge } = createOAuthSession('google', redirectUrl)

      // Build Google OAuth URL
      const authUrl = buildGoogleAuthUrl(
        {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          redirectUri: env.OAUTH_REDIRECT_URI,
          scope: ['openid', 'profile', 'email'],
        },
        state,
        codeChallenge
      )

      return successResponse({
        authUrl,
        state,
      })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  // Handle OAuth callback
  .get('/oauth/callback', async ({ query }) => {
    try {
      const code = query.code as string
      const state = query.state as string
      const error = query.error as string

      // Check for OAuth errors
      if (error) {
        return errorResponse(`OAuth error: ${error}`, 400)
      }

      if (!code || !state) {
        return errorResponse('Missing code or state parameter', 400)
      }

      // Validate state parameter (CSRF protection)
      const session = validateOAuthState(state)
      if (!session) {
        return errorResponse('Invalid or expired OAuth state', 400)
      }

      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(
        {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          redirectUri: env.OAUTH_REDIRECT_URI!,
          scope: [],
        },
        code,
        session.codeVerifier
      )

      // Get user info from Google
      const googleUser = await getGoogleUserInfo(tokens.access_token)

      // Check if user exists in Supabase
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', googleUser.email)
        .single()

      let userId: string

      if (findError && findError.code === 'PGRST116') {
        // User doesn't exist - create new user via Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: googleUser.email,
          password: crypto.randomUUID(), // Random password (user will use OAuth)
          options: {
            data: {
              first_name: googleUser.given_name,
              last_name: googleUser.family_name,
              avatar_url: googleUser.picture,
            },
          },
        })

        if (signUpError || !authData.user) {
          return errorResponse(`Failed to create user: ${signUpError?.message}`, 500)
        }

        userId = authData.user.id

        // Store OAuth provider info
        await supabase.from('user_oauth_providers').insert({
          user_id: userId,
          provider: 'google',
          provider_user_id: googleUser.id,
          provider_email: googleUser.email,
          provider_avatar_url: googleUser.picture,
          // Note: In production, encrypt tokens before storing
          access_token_encrypted: tokens.access_token,
          refresh_token_encrypted: tokens.refresh_token || null,
        })
      } else if (existingUser) {
        userId = existingUser.id

        // Update avatar if changed
        if (googleUser.picture !== existingUser.avatar_url) {
          await supabase.from('users').update({ avatar_url: googleUser.picture }).eq('id', userId)
        }
      } else {
        return errorResponse('Failed to find or create user', 500)
      }

      // Create Supabase session (not used yet - OAuth session handling TODO)
      const { data: _sessionData, error: _sessionError } = await supabase.auth.signInWithPassword({
        email: googleUser.email,
        password: crypto.randomUUID(), // This won't work for OAuth users
      })

      // For OAuth users, we need to use admin API or create session differently
      // For now, return user data and let frontend handle session
      return successResponse({
        user: {
          id: userId,
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          avatarUrl: googleUser.picture,
        },
        provider: 'google',
        redirectUrl: session.redirectUrl,
      })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })
