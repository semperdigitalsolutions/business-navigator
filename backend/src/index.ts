/**
 * Business Navigator API Server
 * Built with Bun + ElysiaJS
 */
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { env } from './config/env.js'
import { checkDatabaseConnection } from './config/database.js'
import { authRoutes } from './routes/auth.routes.js'
import { oauthRoutes } from './routes/oauth.routes.js'
import { businessRoutes } from './routes/business.routes.js'
import { agentRoutes } from './routes/agent.routes.js'
import { settingsRoutes } from './routes/settings.routes.js'
import { onboardingRoutes } from './routes/onboarding.routes.js'
import { dashboardRoutes } from './routes/dashboard.routes.js'
import { tasksRoutes } from './routes/tasks.routes.js'
import { waitlistRoutes } from './routes/waitlist.routes.js'
import { creditsRoutes } from './routes/credits.routes.js'
import { adminRoutes } from './routes/admin.routes.js'
import { successResponse } from './middleware/error.js'

// Create Elysia app
const _app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  )

  // Health check endpoint
  .get('/', () => successResponse({ message: 'Business Navigator API is running' }))

  .get('/health', async () => {
    const dbConnected = await checkDatabaseConnection()

    return successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: env.NODE_ENV,
    })
  })

  // Register routes
  .use(authRoutes)
  .use(oauthRoutes)
  .use(businessRoutes)
  .use(agentRoutes)
  .use(settingsRoutes)
  .use(onboardingRoutes)
  .use(dashboardRoutes)
  .use(tasksRoutes)
  .use(waitlistRoutes)
  .use(creditsRoutes)
  .use(adminRoutes)

  // Global error handler
  .onError(({ code, error, set }) => {
    console.error(`[Error ${code}]:`, error)

    if (code === 'VALIDATION') {
      set.status = 400
      return {
        success: false,
        error: 'Validation error',
        details: error.message,
      }
    }

    if (code === 'NOT_FOUND') {
      set.status = 404
      return {
        success: false,
        error: 'Route not found',
      }
    }

    set.status = 500
    return {
      success: false,
      error: 'Internal server error',
    }
  })

  // Start server
  .listen(env.PORT)

console.log(`
🚀 Business Navigator API Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${env.NODE_ENV}
Port: ${env.PORT}
URL: http://localhost:${env.PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available Routes:
  GET  /health              - Health check

  Auth:
  POST /api/auth/register   - Register new user
  POST /api/auth/login      - Login
  POST /api/auth/logout     - Logout
  GET  /api/auth/me         - Get current user

  Businesses:
  GET  /api/businesses      - List all businesses
  POST /api/businesses      - Create business
  GET  /api/businesses/:id  - Get business by ID
  PATCH /api/businesses/:id - Update business
  DELETE /api/businesses/:id - Delete business

  AI Agents (LangGraph):
  POST /api/agent/chat           - Chat with AI agents
  GET  /api/agent/sessions       - Get chat sessions
  GET  /api/agent/sessions/:id/messages - Get session messages
  GET  /api/agent/info           - Get agent information

  Settings:
  GET  /api/settings/api-keys    - Get user API keys
  POST /api/settings/api-keys    - Add/update API key
  DELETE /api/settings/api-keys/:id - Delete API key
  GET  /api/settings/models/:provider - Get available models

  Tasks:
  GET  /api/tasks              - List all tasks grouped by phase
  GET  /api/tasks/:id          - Get single task by ID

  Waitlist:
  POST /api/waitlist            - Join beta waitlist
  GET  /api/waitlist/count      - Get waitlist count

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

export type App = typeof _app
