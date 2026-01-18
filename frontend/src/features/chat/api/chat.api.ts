/**
 * Chat API - LangGraph agent communication
 */
import { apiClient } from '@/lib/api/client'

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
  }
  error?: string
}

export interface ChatSession {
  id: string
  thread_id: string
  agent_type: string
  status: string
  created_at: string
  updated_at: string
}

export const chatApi = {
  /**
   * Send a message to the AI agents
   */
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => apiClient.post('/api/agent/chat', request),

  /**
   * Get user's chat sessions
   */
  getSessions: async (): Promise<{ success: boolean; data?: { sessions: ChatSession[] } }> => apiClient.get('/api/agent/sessions'),

  /**
   * Get messages for a session
   */
  getSessionMessages: async (
    sessionId: string
  ): Promise<{ success: boolean; data?: { messages: ChatMessage[] } }> => apiClient.get(`/api/agent/sessions/${sessionId}/messages`),

  /**
   * Get agent information
   */
  getAgentInfo: async (): Promise<any> => apiClient.get('/api/agent/info'),
}
