/**
 * Base AI Agent class
 * All specialized agents extend this base class
 */

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AgentResponse {
  content: string
  confidence: number
  metadata?: Record<string, any>
}

export abstract class BaseAgent {
  protected name: string
  protected systemPrompt: string

  constructor(name: string, systemPrompt: string) {
    this.name = name
    this.systemPrompt = systemPrompt
  }

  /**
   * Process a user query and generate a response
   */
  abstract process(
    query: string,
    context?: Record<string, any>
  ): Promise<AgentResponse>

  /**
   * Build conversation messages for LLM
   */
  protected buildMessages(query: string, context?: Record<string, any>): AgentMessage[] {
    const messages: AgentMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt,
      },
    ]

    // Add context if provided
    if (context) {
      messages.push({
        role: 'system',
        content: `Context: ${JSON.stringify(context)}`,
      })
    }

    messages.push({
      role: 'user',
      content: query,
    })

    return messages
  }

  /**
   * Validate agent response
   */
  protected validateResponse(response: string): boolean {
    return Boolean(response && response.length > 0)
  }
}
