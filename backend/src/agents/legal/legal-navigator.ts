/**
 * Legal Navigator Agent - Business formation and legal guidance
 */
import { StateGraph, START, END } from '@langchain/langgraph'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { LegalState, type LegalStateType } from '../core/state.js'
import { createLLM, getLLMConfigFromState } from '../core/llm.js'
import { LEGAL_SYSTEM_PROMPT } from '../core/prompts.js'
import { agentTools } from '../core/tools.js'

/**
 * Load user context (business info, tasks, etc.)
 */
async function loadContext(state: LegalStateType): Promise<Partial<LegalStateType>> {
  try {
    // Use tools to get user's business info if we have userId
    if (state.userId) {
      const businessTool = agentTools.find((t) => t.name === 'get_user_business')
      if (businessTool) {
        const businessInfo = await businessTool.invoke({ userId: state.userId })
        const parsed = JSON.parse(businessInfo as string)

        if (parsed.found) {
          return {
            businessId: parsed.business.id,
            businessType: parsed.business.type,
            state: parsed.business.state,
            metadata: {
              ...state.metadata,
              businessContext: parsed.business,
            },
          }
        }
      }
    }

    return {}
  } catch (error) {
    console.error('Error loading context:', error)
    return {}
  }
}

/**
 * Process legal query with LLM
 */
async function processLegalQuery(state: LegalStateType): Promise<Partial<LegalStateType>> {
  const llmConfig = getLLMConfigFromState(state)
  const llm = createLLM(llmConfig)

  // Bind tools to LLM for function calling
  const llmWithTools = llm.bindTools(agentTools)

  const lastMessage = state.messages[state.messages.length - 1]
  const userQuery = lastMessage.content as string

  // Build context-aware system prompt
  let contextInfo = ''
  if (state.businessType) {
    contextInfo += `\nUser's business type: ${state.businessType}`
  }
  if (state.state) {
    contextInfo += `\nUser's state: ${state.state}`
  }
  if (state.metadata?.businessContext) {
    contextInfo += `\nBusiness status: ${state.metadata.businessContext.status}`
  }

  const systemPrompt = LEGAL_SYSTEM_PROMPT + contextInfo

  try {
    const response = await llmWithTools.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ])

    // Extract tool calls if any
    const toolCalls = response.tool_calls || []
    const responseMessages: any[] = [response]

    // Execute tool calls if present
    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const tool = agentTools.find((t) => t.name === toolCall.name)
        if (tool) {
          try {
            const toolResult = await tool.invoke(toolCall.args)
            responseMessages.push(
              new AIMessage({
                content: `Tool ${toolCall.name} executed: ${toolResult}`,
                tool_calls: [],
              })
            )
          } catch (error) {
            console.error(`Tool ${toolCall.name} error:`, error)
          }
        }
      }
    }

    // Calculate tokens used (rough estimate)
    const tokensUsed = Math.ceil(
      (systemPrompt.length + userQuery.length + (response.content as string).length) / 4
    )

    return {
      messages: responseMessages,
      tokensUsed,
      confidence: 0.85,
      metadata: {
        ...state.metadata,
        lastResponse: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('Error in legal query processing:', error)
    return {
      messages: [
        new AIMessage(
          'I apologize, but I encountered an error processing your legal query. Please try again or rephrase your question.'
        ),
      ],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Determine if we need to route back to triage or continue
 */
function shouldContinue(state: LegalStateType): string {
  // If there's an error or low confidence, might want to route back
  if (state.error || (state.confidence && state.confidence < 0.5)) {
    return 'end'
  }

  // Check if there are pending tool calls
  const lastMessage = state.messages[state.messages.length - 1]
  if ('tool_calls' in lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return 'process'
  }

  return 'end'
}

/**
 * Create the Legal Navigator agent graph
 */
export function createLegalNavigatorAgent() {
  const graph = new StateGraph(LegalState)
    .addNode('loadContext', loadContext)
    .addNode('process', processLegalQuery)
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'process')
    .addConditionalEdges('process', shouldContinue, {
      process: 'process',
      end: END,
    })

  return graph.compile()
}
