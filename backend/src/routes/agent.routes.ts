/**
 * AI Agent routes for business formation guidance
 */
import { Elysia, t } from 'elysia'
import { businessFormationAgent } from '@/agents/business-formation.agent.js'
import { authMiddleware, optionalAuthMiddleware } from '@/middleware/auth.js'
import { successResponse, errorResponse } from '@/middleware/error.js'

export const agentRoutes = new Elysia({ prefix: '/api/agent' })
  // Chat with business formation agent (authenticated)
  .post(
    '/chat',
    async ({ body, request }) => {
      const auth = await optionalAuthMiddleware({ request } as any)

      try {
        const response = await businessFormationAgent.process(body.message, body.context)

        return successResponse({
          message: response.content,
          confidence: response.confidence,
          metadata: response.metadata,
        })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        message: t.String({ minLength: 1 }),
        context: t.Optional(
          t.Object({
            businessType: t.Optional(t.String()),
            state: t.Optional(t.String()),
            hasPartners: t.Optional(t.Boolean()),
            hasEmployees: t.Optional(t.Boolean()),
          })
        ),
      }),
    }
  )

  // Get agent capabilities and information
  .get('/info', async () => {
    return successResponse({
      name: 'Business Formation Agent',
      description:
        'AI-powered assistant for business formation guidance, structure selection, and compliance information',
      capabilities: [
        'Business structure recommendations',
        'State-specific formation requirements',
        'Step-by-step formation guidance',
        'Compliance and tax information',
        'Legal requirement explanations',
      ],
      supportedTopics: [
        'LLC formation',
        'Corporation setup',
        'Sole Proprietorship',
        'Partnership agreements',
        'State registration',
        'EIN application',
        'Business licenses',
        'Tax elections',
      ],
    })
  })
