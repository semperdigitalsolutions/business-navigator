/**
 * useChat Hook - Manage chat state and interactions
 */
import { useState, useCallback } from 'react'
import { chatApi, type ChatMessage, type ChatRequest } from '../api/chat.api'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadId, setThreadId] = useState<string | undefined>()
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAgent, setCurrentAgent] = useState<string>('triage')

  const sendMessage = useCallback(
    async (content: string, options?: Partial<ChatRequest>) => {
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

      try {
        const response = await chatApi.sendMessage({
          message: content,
          threadId,
          sessionId,
          ...options,
        })

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
      } catch (err: any) {
        setError(err.error || 'An error occurred')
        // Remove the optimistic user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      } finally {
        setLoading(false)
      }
    },
    [threadId, sessionId]
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
    sendMessage,
    clearChat,
    loadSession,
  }
}
