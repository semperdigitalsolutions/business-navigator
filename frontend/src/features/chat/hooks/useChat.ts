/**
 * useChat Hook - Manage chat state and interactions
 */
import { useCallback, useState } from 'react'
import { chatApi, isRateLimitResponse, type ChatMessage, type ChatRequest } from '../api/chat.api'
import { useChatUsageStore } from './useChatUsageStore'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadId, setThreadId] = useState<string | undefined>()
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAgent, setCurrentAgent] = useState<string>('triage')

  // Get usage state from store
  const { limitReached, incrementUsage } = useChatUsageStore()

  const sendMessage = useCallback(
    async (content: string, options?: Partial<ChatRequest>) => {
      // Check if limit reached before sending
      if (limitReached) {
        setError('Daily message limit reached. Please try again later.')
        return
      }

      setLoading(true)
      setError(null)

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Optimistically increment usage
      incrementUsage()

      try {
        const response = await chatApi.sendMessage({
          message: content,
          threadId,
          sessionId,
          ...options,
        })

        // Handle rate limit response
        if (isRateLimitResponse(response)) {
          setError(`Daily message limit reached. Resets in ${response.retryAfter} seconds.`)
          // Remove the optimistic user message
          setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
          return
        }

        if (response.success && response.data) {
          // Update thread and session IDs
          if (response.data.threadId) setThreadId(response.data.threadId)
          if (response.data.sessionId) setSessionId(response.data.sessionId)
          if (response.data.agent) setCurrentAgent(response.data.agent)

          // Add assistant message
          const assistantMessage: ChatMessage = {
            id: `${response.data.threadId}-${Date.now()}`,
            role: 'assistant',
            content: response.data.message,
            created_at: new Date().toISOString(),
            tokens_used: response.data.tokensUsed,
            metadata: {
              agent: response.data.agent,
              confidence: response.data.confidence,
            },
          }
          setMessages((prev) => [...prev, assistantMessage])
        } else {
          setError(response.error || 'Failed to send message')
        }
      } catch (err: unknown) {
        const errorObj = err as { error?: string; retryAfter?: number; status?: number }
        // Check if this is a rate limit error (429)
        if (errorObj.error === 'Too many requests' || errorObj.retryAfter) {
          setError(`Rate limit exceeded. Please try again in ${errorObj.retryAfter || 60} seconds.`)
        } else {
          setError(errorObj.error || 'An error occurred')
        }
        // Remove the optimistic user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      } finally {
        setLoading(false)
      }
    },
    [threadId, sessionId, limitReached, incrementUsage]
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setThreadId(undefined)
    setSessionId(undefined)
    setCurrentAgent('triage')
    setError(null)
  }, [])

  const loadSession = useCallback(async (loadSessionId: string) => {
    try {
      const response = await chatApi.getSessionMessages(loadSessionId)
      if (response.success && response.data) {
        setMessages(response.data.messages)
        setSessionId(loadSessionId)
      }
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }, [])

  return {
    messages,
    threadId,
    sessionId,
    currentAgent,
    loading,
    error,
    limitReached,
    sendMessage,
    clearChat,
    loadSession,
  }
}
