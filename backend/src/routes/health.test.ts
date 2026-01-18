/**
 * Integration tests for API health endpoints
 * These tests verify the API is responding correctly
 */
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { successResponse } from '@/middleware/error.js'

// Response type for API endpoints
interface ApiResponse {
  success: boolean
  data?: {
    message?: string
    status?: string
    timestamp?: string
  }
}

// Create a minimal test app with just the health endpoints
const createTestApp = () => {
  return new Elysia()
    .get('/', () => successResponse({ message: 'Business Navigator API is running' }))
    .get('/health', () =>
      successResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'mock',
        environment: 'test',
      })
    )
}

describe('Health Endpoints', () => {
  const app = createTestApp()

  it('GET / should return API running message', async () => {
    const response = await app.handle(new Request('http://localhost/'))
    expect(response.status).toBe(200)

    const body = (await response.json()) as ApiResponse
    expect(body.success).toBe(true)
    expect(body.data?.message).toBe('Business Navigator API is running')
  })

  it('GET /health should return health status', async () => {
    const response = await app.handle(new Request('http://localhost/health'))
    expect(response.status).toBe(200)

    const body = (await response.json()) as ApiResponse
    expect(body.success).toBe(true)
    expect(body.data?.status).toBe('ok')
    expect(body.data?.timestamp).toBeDefined()
  })
})
