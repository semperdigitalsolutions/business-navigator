/**
 * AI Agent routes using LangGraph
 */
import { Elysia, t } from 'elysia'
import { HumanMessage } from '@langchain/core/messages'
import { getMainGraph } from '@/agents/graph.js'
import { optionalAuthMiddleware } from '@/middleware/auth.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { supabase } from '@/config/database.js'
import { decrypt } from '@/utils/crypto.js'
import { v4 as uuidv4 } from 'uuid'
import type { AgentSessionInsert, ChatMessageInsert } from '@/types/supabase-helpers.js'

export const agentRoutes = new Elysia({ prefix: '/api/agent' })
  // Chat with AI agents (with LangGraph orchestration)
  .post(
    '/chat',
    async ({ body, request }) => {
      const auth = await optionalAuthMiddleware({ request } as any)

      try {
        const graph = await getMainGraph()

        // Get or create thread ID
        const threadId = body.threadId || uuidv4()

        // Get user's API key and model preferences if authenticated
        let llmApiKey: string | undefined
        let llmModel = body.model || 'openai/gpt-4-turbo'
        let llmProvider: 'openrouter' | 'openai' | 'anthropic' = 'openrouter'

        if (auth?.userId) {
          const { data: apiKeyData } = await supabase
            .from('user_api_keys')
            .select('*')
            .eq('user_id', auth.userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (apiKeyData) {
            // @ts-expect-error - Supabase returns data but TypeScript infers never
            const encryptedKey = apiKeyData.api_key_encrypted as string
            llmApiKey = decrypt(encryptedKey)
            // @ts-expect-error - Supabase returns data but TypeScript infers never
            llmModel = apiKeyData.preferred_model
            // @ts-expect-error - Supabase returns data but TypeScript infers never
            llmProvider = apiKeyData.provider as 'openrouter' | 'openai' | 'anthropic'
          }
        }

        // Override with user-provided values if present
        if (body.apiKey) {
          llmApiKey = body.apiKey
        }
        if (body.provider) {
          llmProvider = body.provider
        }

        // Build initial state
        const initialState = {
          messages: [new HumanMessage(body.message)],
          threadId,
          userId: auth?.userId || 'anonymous',
          businessId: body.businessId,
          sessionId: body.sessionId,
          llmProvider,
          llmModel,
          llmApiKey,
        }

        // Invoke the graph with checkpointing
        const result = await graph.invoke(initialState, {
          configurable: {
            thread_id: threadId,
          },
        })

        // Extract the response
        const lastMessage = result.messages[result.messages.length - 1]
        const content =
          typeof lastMessage.content === 'string'
            ? lastMessage.content
            : JSON.stringify(lastMessage.content)

        // Save to database if authenticated
        if (auth?.userId) {
          // Create or get session
          let sessionId = body.sessionId
          if (!sessionId) {
            const sessionInsert: AgentSessionInsert = {
              user_id: auth.userId,
              thread_id: threadId,
              agent_type: result.activeAgent || 'triage',
              status: 'active',
            }

            const { data: session } = await supabase
              .from('agent_sessions')
              // @ts-expect-error - Supabase type inference issue with Database generics
              .insert(sessionInsert)
              .select()
              .single()

            // @ts-expect-error - Session data exists but TypeScript infers never
            sessionId = session?.id
          }

          // Save messages
          if (sessionId) {
            const messages: ChatMessageInsert[] = [
              {
                session_id: sessionId,
                role: 'user',
                content: body.message,
              },
              {
                session_id: sessionId,
                role: 'assistant',
                content,
                tokens_used: result.tokensUsed || 0,
                metadata: {
                  agent: result.activeAgent,
                  confidence: result.confidence,
                },
              },
            ]

            // @ts-expect-error - Supabase type inference issue with Database generics
            await supabase.from('chat_messages').insert(messages)
          }
        }

        return successResponse({
          message: content,
          threadId,
          sessionId: body.sessionId,
          agent: result.activeAgent,
          confidence: result.confidence,
          tokensUsed: result.tokensUsed,
          metadata: {
            intent: result.intent,
            routingReason: result.routingReason,
          },
        })
      } catch (error: any) {
        console.error('Agent chat error:', error)
        return errorResponse(error.message || 'Failed to process chat message')
      }
    },
    {
      body: t.Object({
        message: t.String({ minLength: 1 }),
        threadId: t.Optional(t.String()),
        sessionId: t.Optional(t.String()),
        businessId: t.Optional(t.String()),
        // User can override LLM settings per-request
        provider: t.Optional(
          t.Union([t.Literal('openrouter'), t.Literal('openai'), t.Literal('anthropic')])
        ),
        model: t.Optional(t.String()),
        apiKey: t.Optional(t.String()),
      }),
    }
  )

  // Get conversation history
  .get(
    '/sessions/:sessionId/messages',
    async ({ params, request }) => {
      const auth = await optionalAuthMiddleware({ request } as any)
      if (!auth?.userId) {
        return errorResponse('Authentication required', 401)
      }

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', params.sessionId)
          .order('created_at', { ascending: true })

        if (error) throw error

        return successResponse({ messages: data })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({
        sessionId: t.String(),
      }),
    }
  )

  // Get user's chat sessions
  .get('/sessions', async ({ request, query }) => {
    const auth = await optionalAuthMiddleware({ request } as any)
    if (!auth?.userId) {
      return errorResponse('Authentication required', 401)
    }

    try {
      let dbQuery = supabase
        .from('agent_sessions')
        .select('*')
        .eq('user_id', auth.userId)
        .order('updated_at', { ascending: false })

      if (query.status) {
        dbQuery = dbQuery.eq('status', query.status)
      }

      const { data, error } = await dbQuery

      if (error) throw error

      return successResponse({ sessions: data })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  // Get agent capabilities
  .get('/info', async () =>
    successResponse({
      name: 'Business Navigator AI',
      description: 'Multi-agent AI system for business formation guidance',
      agents: [
        {
          name: 'Legal Navigator',
          type: 'legal',
          description: 'Business formation, structure selection, and legal compliance',
          capabilities: [
            'Business structure recommendations',
            'State-specific formation requirements',
            'Legal document guidance',
            'Compliance requirements',
          ],
        },
        {
          name: 'Financial Planner',
          type: 'financial',
          description: 'Financial projections, tax planning, and funding guidance',
          capabilities: [
            'Financial projections',
            'Tax strategy',
            'Funding options',
            'Accounting setup',
          ],
        },
        {
          name: 'Task Assistant',
          type: 'tasks',
          description: 'Task management and progress tracking',
          capabilities: [
            'Progress tracking',
            'Task management',
            'Next steps guidance',
            'Completion tracking',
          ],
        },
      ],
      features: [
        'Multi-agent routing',
        'Conversation persistence',
        'Tool calling',
        'Context awareness',
      ],
    })
  )
