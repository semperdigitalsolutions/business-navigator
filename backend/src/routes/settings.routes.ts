/**
 * User settings routes for API keys and preferences
 */
import { Elysia, t } from 'elysia'
import { authMiddleware } from '@/middleware/auth.js'
import { successResponse, errorResponse } from '@/middleware/error.js'
import { supabase } from '@/config/database.js'
import type { UserApiKeyInsert } from '@/types/supabase-helpers.js'

// Simple XOR encryption for API keys (in production, use proper encryption)
function encryptApiKey(apiKey: string): string {
  // TODO: Implement proper encryption (e.g., AES-256)
  // For now, just base64 encode (NOT SECURE - replace in production)
  return Buffer.from(apiKey).toString('base64')
}

function decryptApiKey(encrypted: string): string {
  // TODO: Implement proper decryption
  return Buffer.from(encrypted, 'base64').toString('utf-8')
}

export const settingsRoutes = new Elysia({ prefix: '/api/settings' })
  // Get user's API keys and preferences
  .get('/api-keys', async ({ request }) => {
    const auth = await authMiddleware({ request } as any)

    if (!auth.success || !auth.userId) {
      return errorResponse('Unauthorized', 401)
    }

    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('id, provider, preferred_model, is_active, created_at, updated_at')
        .eq('user_id', auth.userId)

      if (error) throw error

      return successResponse({ apiKeys: data || [] })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  // Add or update API key
  .post(
    '/api-keys',
    async ({ body, request }) => {
      const auth = await authMiddleware({ request } as any)

      try {
        const { provider, apiKey, preferredModel } = body
        const encrypted = encryptApiKey(apiKey)

        const insertData: UserApiKeyInsert = {
          user_id: auth.userId!,
          provider,
          api_key_encrypted: encrypted,
          preferred_model: preferredModel,
          is_active: true,
        }

        const { data, error } = await supabase
          .from('user_api_keys')
          // @ts-expect-error - Supabase type inference issue with Database generics
          .upsert(insertData, {
            onConflict: 'user_id,provider',
          })
          .select()
          .single()

        if (error) throw error

        if (!data) {
          throw new Error('Failed to save API key')
        }

        return successResponse({
          apiKey: {
            // @ts-expect-error - Data exists but TypeScript infers never
            id: data.id,
            // @ts-expect-error - Data exists but TypeScript infers never
            provider: data.provider,
            // @ts-expect-error - Data exists but TypeScript infers never
            preferred_model: data.preferred_model,
            // @ts-expect-error - Data exists but TypeScript infers never
            is_active: data.is_active,
          },
          message: 'API key saved successfully',
        })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        provider: t.Union([t.Literal('openrouter'), t.Literal('openai'), t.Literal('anthropic')]),
        apiKey: t.String({ minLength: 10 }),
        preferredModel: t.String({ minLength: 1 }),
      }),
    }
  )

  // Delete API key
  .delete(
    '/api-keys/:id',
    async ({ params, request }) => {
      const auth = await authMiddleware({ request } as any)

      if (!auth.success || !auth.userId) {
        return errorResponse('Unauthorized', 401)
      }

      try {
        const { error } = await supabase
          .from('user_api_keys')
          .delete()
          .eq('id', params.id)
          .eq('user_id', auth.userId)

        if (error) throw error

        return successResponse({ message: 'API key deleted successfully' })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Get available models for a provider
  .get('/models/:provider', async ({ params }) => {
    const models = {
      openrouter: [
        { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable OpenAI model' },
        { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
        {
          id: 'anthropic/claude-3-5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Best reasoning and analysis',
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: 'Fast and efficient',
        },
        {
          id: 'google/gemini-pro-1.5',
          name: 'Gemini Pro 1.5',
          description: 'Google\'s advanced model',
        },
      ],
      openai: [
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable model' },
        { id: 'gpt-4', name: 'GPT-4', description: 'Previous generation' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
      ],
      anthropic: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Latest and most capable',
        },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most intelligent' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest' },
      ],
    }

    const providerModels = models[params.provider as keyof typeof models] || []

    return successResponse({ models: providerModels })
  })
