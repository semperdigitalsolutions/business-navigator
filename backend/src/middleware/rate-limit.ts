/**
 * Rate Limiting Middleware
 * Protects against API abuse, brute force attacks, and DoS
 *
 * SECURITY: CRITICAL - Prevents unauthorized access attempts
 * TODO: Move to Redis for production (distributed rate limiting)
 */

import type { Context } from 'elysia'

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitStore {
  [key: string]: RateLimitEntry
}

// In-memory store (use Redis in production for distributed systems)
const store: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  },
  5 * 60 * 1000
)

interface RateLimitOptions {
  max: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
  keyGenerator?: (context: Context) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    max,
    windowMs,
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options

  return ({ request, set, headers }: Context) => {
    // Generate unique key (IP + endpoint by default)
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
    const endpoint = new URL(request.url).pathname
    const key = keyGenerator
      ? keyGenerator({ request, set, headers } as Context)
      : `${ip}:${endpoint}`

    const now = Date.now()

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      }
    }

    const entry = store[key]

    // Check if limit exceeded
    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

      set.status = 429
      set.headers['Retry-After'] = retryAfter.toString()
      set.headers['X-RateLimit-Limit'] = max.toString()
      set.headers['X-RateLimit-Remaining'] = '0'
      set.headers['X-RateLimit-Reset'] = entry.resetTime.toString()

      return {
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }
    }

    // Increment counter (unless we're skipping successful/failed requests)
    if (!skipSuccessfulRequests && !skipFailedRequests) {
      entry.count++
    }

    // Add rate limit headers
    set.headers['X-RateLimit-Limit'] = max.toString()
    set.headers['X-RateLimit-Remaining'] = (max - entry.count).toString()
    set.headers['X-RateLimit-Reset'] = entry.resetTime.toString()

    // Allow request to proceed
    return
  }
}

/**
 * Preset rate limiters for different endpoint types
 */

// Strict rate limiting for authentication endpoints (10/min)
// Protects against brute force attacks
export const strictRateLimit = rateLimitMiddleware({
  max: 10,
  windowMs: 60 * 1000, // 1 minute
})

// Moderate rate limiting for AI endpoints (20/min)
// Balances UX with cost control
export const aiRateLimit = rateLimitMiddleware({
  max: 20,
  windowMs: 60 * 1000, // 1 minute
})

// Normal rate limiting for standard endpoints (100/15min)
export const normalRateLimit = rateLimitMiddleware({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
})

// Permissive rate limiting for read-only endpoints (200/15min)
export const permissiveRateLimit = rateLimitMiddleware({
  max: 200,
  windowMs: 15 * 60 * 1000, // 15 minutes
})

/**
 * Custom rate limiters for specific use cases
 */

// Per-user rate limiting (uses user ID instead of IP)
export function createUserRateLimit(max: number, windowMs: number) {
  return rateLimitMiddleware({
    max,
    windowMs,
    keyGenerator: (context: Context) => {
      const userId = context.headers['x-user-id'] || context.headers['authorization']?.split(' ')[1]
      return `user:${userId || 'anonymous'}`
    },
  })
}

// Global rate limiting (all requests from same IP share counter)
export function createGlobalRateLimit(max: number, windowMs: number) {
  return rateLimitMiddleware({
    max,
    windowMs,
    keyGenerator: (context: Context) => {
      const ip = context.headers['x-forwarded-for'] || context.headers['x-real-ip'] || 'unknown'
      return `global:${ip}`
    },
  })
}
