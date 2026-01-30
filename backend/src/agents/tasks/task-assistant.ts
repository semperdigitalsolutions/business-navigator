/**
 * Task Assistant Agent - Task management and progress tracking
 */
import { END, START, StateGraph } from '@langchain/langgraph'
import { AIMessage, SystemMessage } from '@langchain/core/messages'
import { TaskState, type TaskStateType } from '../core/state.js'
import { createLLM, getLLMConfigFromState } from '../core/llm.js'
import { TASK_SYSTEM_PROMPT } from '../core/prompts.js'
import { agentTools } from '../core/tools.js'

/**
 * Load task context
 */
async function loadTaskContext(state: TaskStateType): Promise<Partial<TaskStateType>> {
  try {
    if (state.userId) {
      const tasksTool = agentTools.find((t) => t.name === 'get_user_tasks')
      const businessTool = agentTools.find((t) => t.name === 'get_user_business')

      let tasksInfo = null
      let businessInfo = null

      if (tasksTool) {
        // @ts-expect-error - LangChain tool.invoke() complex generic signature mismatch
        const result = await tasksTool.invoke({ userId: state.userId })
        const parsed = JSON.parse(result as string)
        tasksInfo = parsed.tasks
      }

      if (businessTool) {
        // @ts-expect-error - LangChain tool.invoke() complex generic signature mismatch
        const result = await businessTool.invoke({ userId: state.userId })
        const parsed = JSON.parse(result as string)
        if (parsed.found) {
          businessInfo = parsed.business
        }
      }

      // Count completed tasks
      const completedCount = tasksInfo?.filter((t: any) => t.status === 'completed').length || 0
      const totalCount = tasksInfo?.length || 0

      return {
        businessId: businessInfo?.id,
        businessType: businessInfo?.type,
        state: businessInfo?.state,
        metadata: {
          ...state.metadata,
          tasks: tasksInfo,
          businessContext: businessInfo,
          progress: {
            completed: completedCount,
            total: totalCount,
            percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          },
        },
      }
    }

    return {}
  } catch (error) {
    console.error('Error loading task context:', error)
    return {}
  }
}

/**
 * Process task query
 */
async function processTaskQuery(state: TaskStateType): Promise<Partial<TaskStateType>> {
  const llmConfig = getLLMConfigFromState(state)
  const llm = createLLM(llmConfig)
  const llmWithTools = llm.bindTools(agentTools)

  const lastMessage = state.messages[state.messages.length - 1]
  const userQuery = lastMessage.content as string

  // Build context with task information (Issue #95)
  let contextInfo = ''

  // Use rich context if available
  if (state.userContextSummary) {
    contextInfo = `\n\n${state.userContextSummary}`
  } else {
    // Fallback to basic context
    if (state.metadata?.progress) {
      const { completed, total, percentage } = state.metadata.progress
      contextInfo += `\nUser progress: ${completed}/${total} tasks completed (${percentage}%)`
    }
    if (state.businessType) {
      contextInfo += `\nBusiness type: ${state.businessType}`
    }
    if (state.metadata?.tasks && state.metadata.tasks.length > 0) {
      const pendingTasks = state.metadata.tasks.filter((t: any) => t.status === 'pending')
      const inProgressTasks = state.metadata.tasks.filter((t: any) => t.status === 'in_progress')

      if (pendingTasks.length > 0) {
        contextInfo += `\nPending tasks: ${pendingTasks.map((t: any) => t.title).join(', ')}`
      }
      if (inProgressTasks.length > 0) {
        contextInfo += `\nIn progress: ${inProgressTasks.map((t: any) => t.title).join(', ')}`
      }
    }
  }

  const systemPrompt = TASK_SYSTEM_PROMPT + contextInfo

  try {
    const response = await llmWithTools.invoke([new SystemMessage(systemPrompt), ...state.messages])

    const toolCalls = response.tool_calls || []
    const responseMessages: any[] = [response]

    // Execute tool calls
    for (const toolCall of toolCalls) {
      const tool = agentTools.find((t) => t.name === toolCall.name)
      if (!tool) continue

      // @ts-expect-error - LangChain tool.invoke() complex generic signature mismatch
      const toolResult = await tool.invoke(toolCall.args).catch((err: Error) => {
        console.error(`Tool ${toolCall.name} error:`, err)
        return null
      })

      if (!toolResult) continue

      responseMessages.push(
        new AIMessage({
          content: `Tool ${toolCall.name} executed: ${toolResult}`,
          tool_calls: [],
        })
      )

      // If task was completed, add to completedSteps and return early
      if (toolCall.name !== 'complete_task') continue

      const parsed = JSON.parse(toolResult as string)
      if (parsed.success) {
        return {
          messages: responseMessages,
          completedSteps: [parsed.task.title],
        }
      }
    }

    const tokensUsed = Math.ceil(
      (systemPrompt.length + userQuery.length + (response.content as string).length) / 4
    )

    return {
      messages: responseMessages,
      tokensUsed,
      confidence: 0.9,
      metadata: {
        ...state.metadata,
        lastResponse: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('Error in task query processing:', error)
    return {
      messages: [
        new AIMessage(
          'I apologize, but I encountered an error processing your task query. Please try again.'
        ),
      ],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Determine if we should continue
 */
function shouldContinue(state: TaskStateType): string {
  if (state.error || (state.confidence && state.confidence < 0.5)) {
    return 'end'
  }

  const lastMessage = state.messages[state.messages.length - 1]
  const toolCalls = 'tool_calls' in lastMessage ? lastMessage.tool_calls : null
  if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
    return 'process'
  }

  return 'end'
}

/**
 * Create the Task Assistant agent graph
 */
export function createTaskAssistantAgent() {
  const graph = new StateGraph(TaskState)
    .addNode('loadContext', loadTaskContext)
    .addNode('process', processTaskQuery)
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'process')
    .addConditionalEdges('process', shouldContinue, {
      process: 'process',
      end: END,
    })

  return graph.compile()
}
