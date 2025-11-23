/**
 * Task Assistant Agent - Task management and progress tracking
 */
import { StateGraph, START, END } from '@langchain/langgraph'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
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
        const result = await tasksTool.invoke({ userId: state.userId })
        const parsed = JSON.parse(result as string)
        tasksInfo = parsed.tasks
      }

      if (businessTool) {
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

  // Build context with task information
  let contextInfo = ''
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

  const systemPrompt = TASK_SYSTEM_PROMPT + contextInfo

  try {
    const response = await llmWithTools.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ])

    const toolCalls = response.tool_calls || []
    const responseMessages: any[] = [response]

    // Execute tool calls
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

            // If task was completed, add to completedSteps
            if (toolCall.name === 'complete_task') {
              const result = JSON.parse(toolResult as string)
              if (result.success) {
                return {
                  messages: responseMessages,
                  completedSteps: [result.task.title],
                }
              }
            }
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
      confidence: 0.90,
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
  if ('tool_calls' in lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
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
