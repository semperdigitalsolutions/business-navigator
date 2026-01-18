/**
 * OAuth 2.0 Security Utilities
 * Implements state parameter (CSRF protection) and PKCE (code challenge)
 *
 * SECURITY: HIGH - Prevents CSRF attacks and authorization code interception
 */

import { randomBytes, createHash } from 'crypto'

/**
 * OAuth session stored temporarily during auth flow
 */
export interface OAuthSession {
  state: string
  codeVerifier: string
  provider: 'google' | 'github' | 'apple'
  redirectUrl: string
  createdAt: number
  expiresAt: number
}

// In-memory store for OAuth sessions (use Redis in production)
const oauthSessions = new Map<string, OAuthSession>()

// Cleanup expired sessions every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, session] of oauthSessions.entries()) {
      if (session.expiresAt < now) {
        oauthSessions.delete(key)
      }
    }
  },
  5 * 60 * 1000
)

/**
 * Generate a cryptographically secure random string
 */
export function generateRandomString(length: number = 32): string {
  return randomBytes(length).toString('base64url')
}

/**
 * Generate OAuth state parameter (CSRF token)
 * The state parameter is used to prevent CSRF attacks
 */
export function generateState(): string {
  return generateRandomString(32)
}

/**
 * Generate PKCE code verifier
 * A high-entropy cryptographic random string
 */
export function generateCodeVerifier(): string {
  return generateRandomString(43) // 43 chars = 256 bits of entropy
}

/**
 * Generate PKCE code challenge from code verifier
 * Uses SHA-256 hash and base64url encoding
 */
export function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url')
}

/**
 * Create and store OAuth session
 * Returns the state parameter to send to OAuth provider
 */
export function createOAuthSession(
  provider: 'google' | 'github' | 'apple',
  redirectUrl: string,
  ttlMinutes: number = 10
): { state: string; codeVerifier: string; codeChallenge: string } {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  const session: OAuthSession = {
    state,
    codeVerifier,
    provider,
    redirectUrl,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  }

  oauthSessions.set(state, session)

  return { state, codeVerifier, codeChallenge }
}

/**
 * Validate and retrieve OAuth session
 * Returns null if state is invalid or expired
 */
export function validateOAuthState(state: string): OAuthSession | null {
  const session = oauthSessions.get(state)

  if (!session) {
    return null
  }

  // Check if expired
  if (session.expiresAt < Date.now()) {
    oauthSessions.delete(state)
    return null
  }

  // Delete session after validation (one-time use)
  oauthSessions.delete(state)

  return session
}

/**
 * Verify PKCE code verifier against the authorization code
 * (OAuth provider will do this verification, but we store it for reference)
 */
export function verifyCodeVerifier(codeVerifier: string, codeChallenge: string): boolean {
  const computedChallenge = generateCodeChallenge(codeVerifier)
  return computedChallenge === codeChallenge
}

/**
 * Google OAuth configuration
 */
export interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
}

/**
 * Build Google OAuth authorization URL
 */
export function buildGoogleAuthUrl(
  config: GoogleOAuthConfig,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Force consent to get refresh token
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens (Google)
 */
export async function exchangeGoogleCode(
  config: GoogleOAuthConfig,
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string
  refresh_token?: string
  id_token?: string
  expires_in: number
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json() as Promise<{
    access_token: string
    refresh_token?: string
    id_token?: string
    expires_in: number
  }>
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json() as Promise<{
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
  }>
}

/**
 * Refresh Google access token using refresh token
 */
export async function refreshGoogleToken(
  config: GoogleOAuthConfig,
  refreshToken: string
): Promise<{
  access_token: string
  expires_in: number
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json() as Promise<{
    access_token: string
    expires_in: number
  }>
}
