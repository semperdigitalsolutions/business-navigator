/**
 * Chat API - LangGraph agent communication
 */
import { apiClient } from '@/lib/api/client'
import { useChatUsageStore } from '../hooks/useChatUsageStore'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  tokens_used?: number
  metadata?: {
    agent?: string
    confidence?: number
  }
}

export interface ChatRequest {
  message: string
  threadId?: string
  sessionId?: string
  businessId?: string
  provider?: 'openrouter' | 'openai' | 'anthropic'
  model?: string
  apiKey?: string
}

export interface ChatResponse {
  success: boolean
  data?: {
    message: string
    threadId: string
    sessionId?: string
    agent: string
    confidence?: number
    tokensUsed?: number
    metadata?: {
      intent?: string
      routingReason?: string
    }
    // Usage information included in successful responses
    usage?: ChatUsageInfo
  }
  error?: string
}

/**
 * Chat usage limit information
 */
export interface ChatUsageInfo {
  messagesUsed: number
  messagesLimit: number
  remaining: number
  resetsAt: string
}

/**
 * Rate limit response when 429 is returned
 */
export interface ChatLimitReachedResponse {
  success: false
  limitReached: true
  current: number
  limit: number
  resetsAt: string
  error: string
  retryAfter: number
}

/**
 * Type guard to check if response is a rate limit response
 */
export function isRateLimitResponse(response: unknown): response is ChatLimitReachedResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'limitReached' in response &&
    (response as ChatLimitReachedResponse).limitReached === true
  )
}

export interface ChatSession {
  id: string
  thread_id: string
  agent_type: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * Suggested question for chat (Issue #96)
 */
export interface SuggestedQuestion {
  id: string
  text: string
  category: 'legal' | 'financial' | 'tasks' | 'general'
  priority: number
}

export interface SuggestionsResponse {
  success: boolean
  data?: {
    suggestions: SuggestedQuestion[]
  }
  error?: string
}

export const chatApi = {
  /**
   * Send a message to the AI agents
   * Handles 429 rate limit responses and updates usage store
   */
  sendMessage: async (request: ChatRequest): Promise<ChatResponse | ChatLimitReachedResponse> => {
    try {
      const response: ChatResponse = await apiClient.post('/api/agent/chat', request)

      // Update usage store if usage info is included in response
      if (response.success && response.data?.usage) {
        const { messagesUsed, messagesLimit, resetsAt } = response.data.usage
        useChatUsageStore.getState().setUsage({
          messagesUsed,
          messagesLimit,
          resetsAt,
        })
      }

      return response
    } catch (error: unknown) {
      // Handle 429 rate limit response
      if (isRateLimitError(error)) {
        const limitResponse = error as ChatLimitReachedResponse
        useChatUsageStore.getState().setLimitReached({
          messagesUsed: limitResponse.current,
          messagesLimit: limitResponse.limit,
          resetsAt: limitResponse.resetsAt,
        })
        return limitResponse
      }
      throw error
    }
  },

  /**
   * Get user's chat sessions
   */
  getSessions: async (): Promise<{ success: boolean; data?: { sessions: ChatSession[] } }> =>
    apiClient.get('/api/agent/sessions'),

  /**
   * Get messages for a session
   */
  getSessionMessages: async (
    sessionId: string
  ): Promise<{ success: boolean; data?: { messages: ChatMessage[] } }> =>
    apiClient.get(`/api/agent/sessions/${sessionId}/messages`),

  /**
   * Get agent information
   */
  getAgentInfo: async (): Promise<unknown> => apiClient.get('/api/agent/info'),

  /**
   * Get current chat usage for the authenticated user
   */
  getUsage: async (): Promise<{ success: boolean; data?: ChatUsageInfo }> => {
    try {
      const response = await apiClient.get('/api/agent/usage')
      if (response.success && response.data) {
        useChatUsageStore.getState().setUsage({
          messagesUsed: response.data.messagesUsed,
          messagesLimit: response.data.messagesLimit,
          resetsAt: response.data.resetsAt,
        })
      }
      return response
    } catch {
      // If endpoint doesn't exist yet, return a default response
      return { success: false }
    }
  },

  /**
   * Get context-aware suggested questions (Issue #96)
   */
  getSuggestions: async (businessId?: string): Promise<SuggestionsResponse> => {
    try {
      const params = businessId ? `?businessId=${businessId}` : ''
      const response = await apiClient.get(`/api/agent/suggestions${params}`)
      return response
    } catch {
      // Return empty suggestions on error
      return { success: false, data: { suggestions: [] } }
    }
  },
}

/**
 * Check if error is a rate limit error (429)
 */
function isRateLimitError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'limitReached' in error &&
    (error as ChatLimitReachedResponse).limitReached === true
  )
}
