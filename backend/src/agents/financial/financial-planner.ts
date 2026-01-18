/**
 * Financial Planner Agent - Financial projections and guidance
 */
import { END, START, StateGraph } from '@langchain/langgraph'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { FinancialState, type FinancialStateType } from '../core/state.js'
import { createLLM, getLLMConfigFromState } from '../core/llm.js'
import { FINANCIAL_SYSTEM_PROMPT } from '../core/prompts.js'
import { agentTools } from '../core/tools.js'

/**
 * Load financial context
 */
async function loadFinancialContext(
  state: FinancialStateType
): Promise<Partial<FinancialStateType>> {
  try {
    if (state.userId) {
      const businessTool = agentTools.find((t) => t.name === 'get_user_business')
      const tasksTool = agentTools.find((t) => t.name === 'get_user_tasks')

      let businessInfo = null
      let tasksInfo = null

      if (businessTool) {
        // @ts-expect-error - LangChain tool.invoke() complex generic signature mismatch
        const result = await businessTool.invoke({ userId: state.userId })
        const parsed = JSON.parse(result as string)
        if (parsed.found) {
          businessInfo = parsed.business
        }
      }

      if (tasksTool) {
        // @ts-expect-error - LangChain tool.invoke() complex generic signature mismatch
        const result = await tasksTool.invoke({ userId: state.userId, status: 'completed' })
        const parsed = JSON.parse(result as string)
        tasksInfo = parsed.tasks
      }

      return {
        businessId: businessInfo?.id,
        businessType: businessInfo?.type,
        state: businessInfo?.state,
        metadata: {
          ...state.metadata,
          businessContext: businessInfo,
          completedTasks: tasksInfo,
        },
      }
    }

    return {}
  } catch (error) {
    console.error('Error loading financial context:', error)
    return {}
  }
}

/**
 * Process financial query
 */
async function processFinancialQuery(
  state: FinancialStateType
): Promise<Partial<FinancialStateType>> {
  const llmConfig = getLLMConfigFromState(state)
  const llm = createLLM(llmConfig)
  const llmWithTools = llm.bindTools(agentTools)

  const lastMessage = state.messages[state.messages.length - 1]
  const userQuery = lastMessage.content as string

  // Build context
  let contextInfo = ''
  if (state.businessType) {
    contextInfo += `\nBusiness type: ${state.businessType}`
  }
  if (state.state) {
    contextInfo += `\nState: ${state.state}`
  }
  if (state.metadata?.businessContext) {
    contextInfo += `\nBusiness status: ${state.metadata.businessContext.status}`
  }

  const systemPrompt = FINANCIAL_SYSTEM_PROMPT + contextInfo

  try {
    const response = await llmWithTools.invoke([new SystemMessage(systemPrompt), ...state.messages])

    const toolCalls = response.tool_calls || []
    const responseMessages: any[] = [response]

    // Execute tool calls
    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const tool = agentTools.find((t) => t.name === toolCall.name)
        if (tool) {
          // @ts-expect-error - LangChain tool.invoke() complex generic signature mismatch
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
    console.error('Error in financial query processing:', error)
    return {
      messages: [
        new AIMessage(
          'I apologize, but I encountered an error processing your financial query. Please try again.'
        ),
      ],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Determine if we should continue processing
 */
function shouldContinue(state: FinancialStateType): string {
  if (state.error || (state.confidence && state.confidence < 0.5)) {
    return 'end'
  }

  const lastMessage = state.messages[state.messages.length - 1]
  if ('tool_calls' in lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return 'process'
  }

  return 'end'
}

/**
 * Create the Financial Planner agent graph
 */
export function createFinancialPlannerAgent() {
  const graph = new StateGraph(FinancialState)
    .addNode('loadContext', loadFinancialContext)
    .addNode('process', processFinancialQuery)
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'process')
    .addConditionalEdges('process', shouldContinue, {
      process: 'process',
      end: END,
    })

  return graph.compile()
}
