/**
 * Message Bubble Component
 * Issue #103: Updated to support inline task link chips in AI responses
 */
import type { ChatMessage } from '../api/chat.api'
import { MessageContent } from './MessageContent'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const agent = message.metadata?.agent

  const agentColors = {
    legal: 'bg-blue-100 dark:bg-blue-900',
    financial: 'bg-green-100 dark:bg-green-900',
    tasks: 'bg-purple-100 dark:bg-purple-900',
    triage: 'bg-gray-100 dark:bg-gray-700',
  }

  const agentIcons = {
    legal: '⚖️',
    financial: '💰',
    tasks: '✅',
    triage: '🤖',
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && agent && (
          <div className="flex items-center gap-2 mb-1 px-4">
            <span className="text-lg">{agentIcons[agent as keyof typeof agentIcons]}</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
              {agent} Navigator
            </span>
            {message.metadata?.confidence && (
              <span className="text-xs text-gray-500">
                ({Math.round(message.metadata.confidence * 100)}% confident)
              </span>
            )}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-indigo-600 text-white'
              : agent
                ? agentColors[agent as keyof typeof agentColors] || 'bg-gray-100 dark:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {/* User messages render as plain text, AI responses parse task links */}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MessageContent content={message.content} />
          )}
          {message.tokens_used && (
            <p className="text-xs mt-2 opacity-70">{message.tokens_used} tokens used</p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-4">
          {new Date(message.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
