/**
 * OAuth Routes - Google OAuth authentication flow
 */
import { Elysia } from 'elysia'
import { supabase } from '@/config/database.js'
import { env } from '@/config/env.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { strictRateLimit } from '@/middleware/rate-limit.js'
import {
  buildGoogleAuthUrl,
  createOAuthSession,
  exchangeGoogleCode,
  getGoogleUserInfo,
  validateOAuthState,
} from '@/utils/oauth.js'

export const oauthRoutes = new Elysia({ prefix: '/api/auth' })
  .onBeforeHandle(strictRateLimit)

  // Initiate Google OAuth flow
  .get('/oauth/google', async ({ query }) => {
    try {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.OAUTH_REDIRECT_URI) {
        return errorResponse('Google OAuth is not configured', 500)
      }

      const redirectUrl = (query.redirect as string) || env.FRONTEND_URL

      const { state, codeChallenge } = createOAuthSession('google', redirectUrl)

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

      return successResponse({ authUrl, state })
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

      if (error) {
        return errorResponse(`OAuth error: ${error}`, 400)
      }

      if (!code || !state) {
        return errorResponse('Missing code or state parameter', 400)
      }

      const session = validateOAuthState(state)
      if (!session) {
        return errorResponse('Invalid or expired OAuth state', 400)
      }

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

      const googleUser = await getGoogleUserInfo(tokens.access_token)

      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', googleUser.email)
        .single()

      let userId: string

      if (findError && findError.code === 'PGRST116') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: googleUser.email,
          password: crypto.randomUUID(),
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

        await supabase.from('user_oauth_providers').insert({
          user_id: userId,
          provider: 'google',
          provider_user_id: googleUser.id,
          provider_email: googleUser.email,
          provider_avatar_url: googleUser.picture,
          access_token_encrypted: tokens.access_token,
          refresh_token_encrypted: tokens.refresh_token || null,
        })
      } else if (existingUser) {
        userId = existingUser.id

        if (googleUser.picture !== existingUser.avatar_url) {
          await supabase.from('users').update({ avatar_url: googleUser.picture }).eq('id', userId)
        }
      } else {
        return errorResponse('Failed to find or create user', 500)
      }

      // Create Supabase session (not used yet - OAuth session handling TODO)
      const { data: _sessionData, error: _sessionError } = await supabase.auth.signInWithPassword({
        email: googleUser.email,
        password: crypto.randomUUID(),
      })

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
