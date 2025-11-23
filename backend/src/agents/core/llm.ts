/**
 * LLM Provider Integration
 * Supports OpenRouter, OpenAI, and Anthropic
 */
import { ChatOpenAI } from '@langchain/openai'
import { env } from '@/config/env.js'

export type LLMProvider = 'openrouter' | 'openai' | 'anthropic'

export interface LLMConfig {
  provider: LLMProvider
  model: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
  streaming?: boolean
}

/**
 * Create an LLM instance based on provider and configuration
 */
export function createLLM(config: LLMConfig) {
  const {
    provider,
    model,
    apiKey,
    temperature = 0.7,
    maxTokens = 2000,
    streaming = false,
  } = config

  // Determine API key (user-provided or environment default)
  let resolvedApiKey: string | undefined
  let baseURL: string | undefined

  switch (provider) {
    case 'openrouter':
      resolvedApiKey = apiKey || env.OPENROUTER_API_KEY
      baseURL = 'https://openrouter.ai/api/v1'
      break
    case 'openai':
      resolvedApiKey = apiKey || env.OPENAI_API_KEY
      break
    case 'anthropic':
      // For Anthropic via OpenRouter
      resolvedApiKey = apiKey || env.OPENROUTER_API_KEY || env.ANTHROPIC_API_KEY
      if (apiKey || env.OPENROUTER_API_KEY) {
        baseURL = 'https://openrouter.ai/api/v1'
      }
      break
  }

  if (!resolvedApiKey) {
    throw new Error(
      `No API key available for provider: ${provider}. Please set ${provider.toUpperCase()}_API_KEY in environment or provide user API key.`
    )
  }

  // All providers use ChatOpenAI with different base URLs
  return new ChatOpenAI({
    modelName: model,
    openAIApiKey: resolvedApiKey,
    temperature,
    maxTokens,
    streaming,
    ...(baseURL && {
      configuration: {
        baseURL,
      },
    }),
  })
}

/**
 * Get LLM configuration from agent state or defaults
 */
export function getLLMConfigFromState(state: any): LLMConfig {
  return {
    provider: state.llmProvider || 'openrouter',
    model: state.llmModel || env.DEFAULT_LLM_MODEL,
    apiKey: state.llmApiKey,
    temperature: 0.7,
    maxTokens: 2000,
    streaming: false,
  }
}

/**
 * Popular model presets for different use cases
 */
export const MODEL_PRESETS = {
  // Fast and cheap - good for classification/routing
  fast: {
    openrouter: 'openai/gpt-3.5-turbo',
    openai: 'gpt-3.5-turbo',
    anthropic: 'anthropic/claude-3-haiku',
  },
  // Balanced - good for most conversations
  balanced: {
    openrouter: 'openai/gpt-4-turbo',
    openai: 'gpt-4-turbo',
    anthropic: 'anthropic/claude-3-5-sonnet',
  },
  // Best quality - for complex reasoning
  premium: {
    openrouter: 'anthropic/claude-3-5-sonnet',
    openai: 'gpt-4',
    anthropic: 'anthropic/claude-3-opus',
  },
}

/**
 * Get recommended model for a specific task
 */
export function getRecommendedModel(
  task: 'routing' | 'conversation' | 'complex',
  provider: LLMProvider = 'openrouter'
): string {
  switch (task) {
    case 'routing':
      return MODEL_PRESETS.fast[provider]
    case 'conversation':
      return MODEL_PRESETS.balanced[provider]
    case 'complex':
      return MODEL_PRESETS.premium[provider]
    default:
      return MODEL_PRESETS.balanced[provider]
  }
}
