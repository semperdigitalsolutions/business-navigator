/**
 * Default AI models - used when API is unavailable
 */
import type { AIModel } from '../hooks/useModelsStore'

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and cost-effective',
    creditCost: 1,
    minTier: 'free',
    available: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Most capable OpenAI model',
    creditCost: 3,
    minTier: 'basic',
    available: true,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and efficient',
    creditCost: 1,
    minTier: 'free',
    available: true,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Best reasoning and analysis',
    creditCost: 3,
    minTier: 'basic',
    available: true,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most intelligent Anthropic model',
    creditCost: 5,
    minTier: 'pro',
    available: true,
  },
  {
    id: 'gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'google',
    description: "Google's advanced model",
    creditCost: 2,
    minTier: 'free',
    available: true,
  },
]
