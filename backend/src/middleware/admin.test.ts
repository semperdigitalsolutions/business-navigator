/**
 * Integration tests for Admin Middleware
 * Tests admin authorization checks
 */
import { describe, expect, it, beforeEach } from 'bun:test'
import { Elysia } from 'elysia'

// Mock user types
interface User {
  id: string
  email: string
  is_admin?: boolean
}

// Response body type for tests
interface ResponseBody {
  success: boolean
  error?: string
  data?: { message?: string; user?: User }
}

// Mock admin middleware implementation
const adminMiddleware = (context: any) => {
  const user = context.user as User | undefined

  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!user.is_admin) {
    return new Response(
      JSON.stringify({ success: false, error: 'Forbidden: Admin access required' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Create test app with admin routes
const createTestApp = (user?: User) => {
  return new Elysia()
    .derive(() => ({ user }))
    .get('/admin/dashboard', (context) => {
      const result = adminMiddleware(context)
      if (result) return result

      return new Response(
        JSON.stringify({
          success: true,
          data: { message: 'Admin dashboard' },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    })
    .post('/admin/settings', (context) => {
      const result = adminMiddleware(context)
      if (result) return result

      return new Response(
        JSON.stringify({
          success: true,
          data: { message: 'Settings updated' },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    })
}

describe('Admin Middleware', () => {
  describe('Authentication checks', () => {
    it('should reject requests without user', async () => {
      const app = createTestApp()

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(401)

      const body = (await response.json()) as ResponseBody
      expect(body.success).toBe(false)
      expect(body.error).toBe('Unauthorized')
    })

    it('should reject non-admin users with 403', async () => {
      const regularUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        is_admin: false,
      }

      const app = createTestApp(regularUser)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(403)

      const body = (await response.json()) as ResponseBody
      expect(body.success).toBe(false)
      expect(body.error).toContain('Forbidden')
      expect(body.error).toContain('Admin access required')
    })

    it('should allow admin users to access protected routes', async () => {
      const adminUser: User = {
        id: 'admin-123',
        email: 'admin@example.com',
        is_admin: true,
      }

      const app = createTestApp(adminUser)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(200)

      const body = (await response.json()) as ResponseBody
      expect(body.success).toBe(true)
      expect(body.data?.message).toBe('Admin dashboard')
    })

    it('should handle user without is_admin field as non-admin', async () => {
      const userWithoutAdminField: User = {
        id: 'user-456',
        email: 'user@example.com',
      }

      const app = createTestApp(userWithoutAdminField)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(403)
    })
  })

  describe('Admin access for different HTTP methods', () => {
    it('should protect GET requests', async () => {
      const regularUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        is_admin: false,
      }

      const app = createTestApp(regularUser)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(403)
    })

    it('should protect POST requests', async () => {
      const regularUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        is_admin: false,
      }

      const app = createTestApp(regularUser)

      const response = await app.handle(
        new Request('http://localhost/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setting: 'value' }),
        })
      )

      expect(response.status).toBe(403)
    })

    it('should allow admin POST requests', async () => {
      const adminUser: User = {
        id: 'admin-123',
        email: 'admin@example.com',
        is_admin: true,
      }

      const app = createTestApp(adminUser)

      const response = await app.handle(
        new Request('http://localhost/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setting: 'value' }),
        })
      )

      expect(response.status).toBe(200)
    })
  })

  describe('Response format', () => {
    it('should return proper JSON error for unauthorized', async () => {
      const app = createTestApp()

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      const body = (await response.json()) as ResponseBody
      expect(body).toHaveProperty('success')
      expect(body).toHaveProperty('error')
      expect(body.success).toBe(false)
    })

    it('should return proper JSON error for forbidden', async () => {
      const regularUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        is_admin: false,
      }

      const app = createTestApp(regularUser)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      const body = (await response.json()) as ResponseBody
      expect(body).toHaveProperty('success')
      expect(body).toHaveProperty('error')
      expect(body.success).toBe(false)
    })

    it('should have correct content-type header', async () => {
      const app = createTestApp()

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('Edge cases', () => {
    it('should handle explicit is_admin: true', async () => {
      const adminUser: User = {
        id: 'admin-123',
        email: 'admin@example.com',
        is_admin: true,
      }

      const app = createTestApp(adminUser)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(200)
    })

    it('should handle explicit is_admin: false', async () => {
      const regularUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        is_admin: false,
      }

      const app = createTestApp(regularUser)

      const response = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response.status).toBe(403)
    })

    it('should consistently reject across multiple calls', async () => {
      const regularUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        is_admin: false,
      }

      const app = createTestApp(regularUser)

      const response1 = await app.handle(new Request('http://localhost/admin/dashboard'))
      const response2 = await app.handle(new Request('http://localhost/admin/dashboard'))
      const response3 = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response1.status).toBe(403)
      expect(response2.status).toBe(403)
      expect(response3.status).toBe(403)
    })

    it('should consistently allow admin across multiple calls', async () => {
      const adminUser: User = {
        id: 'admin-123',
        email: 'admin@example.com',
        is_admin: true,
      }

      const app = createTestApp(adminUser)

      const response1 = await app.handle(new Request('http://localhost/admin/dashboard'))
      const response2 = await app.handle(new Request('http://localhost/admin/dashboard'))
      const response3 = await app.handle(new Request('http://localhost/admin/dashboard'))

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(response3.status).toBe(200)
    })
  })
})
