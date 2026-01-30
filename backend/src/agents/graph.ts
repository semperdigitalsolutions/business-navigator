/* eslint-disable max-lines */
/**
 * Main LangGraph Orchestration
 * Routes user queries through triage to appropriate specialist agents
 */
import { END, START, StateGraph } from '@langchain/langgraph'
import { AIMessage } from '@langchain/core/messages'
import { AgentState, type AgentStateType } from './core/state.js'
import { getCheckpointerWithFallback } from './core/checkpoint.js'
import { createTriageAgent } from './triage/router.js'
import { createLegalNavigatorAgent } from './legal/legal-navigator.js'
import { createFinancialPlannerAgent } from './financial/financial-planner.js'
import { createTaskAssistantAgent } from './tasks/task-assistant.js'
import { GENERAL_SYSTEM_PROMPT } from './core/prompts.js'
import { createLLM, getLLMConfigFromState } from './core/llm.js'
import { appendDisclaimer, shouldAddDisclaimer } from './core/disclaimers.js'

/**
 * Initialize all specialist agents
 */
const triageAgent = createTriageAgent()
const legalAgent = createLegalNavigatorAgent()
const financialAgent = createFinancialPlannerAgent()
const taskAgent = createTaskAssistantAgent()

/**
 * Route to triage agent
 */
async function routeToTriage(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const result = await triageAgent.invoke(state)
    return {
      activeAgent: result.activeAgent || 'triage',
      intent: result.intent,
      routingReason: result.routingReason,
      confidence: result.intentConfidence,
    }
  } catch (error) {
    console.error('Error in triage routing:', error)
    return {
      activeAgent: 'triage',
      error: error instanceof Error ? error.message : 'Unknown routing error',
    }
  }
}

/**
 * Route to legal agent
 */
async function routeToLegal(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const result = await legalAgent.invoke(state)

    // Get user query for topic-specific disclaimer
    const lastUserMessage = state.messages[state.messages.length - 1]
    const userQuery = lastUserMessage ? (lastUserMessage.content as string) : ''

    // Add disclaimers to response messages
    const messagesWithDisclaimers = addDisclaimersToMessages(
      result.messages as AIMessage[],
      'legal',
      userQuery
    )

    return {
      messages: messagesWithDisclaimers,
      tokensUsed: result.tokensUsed || 0,
      confidence: result.confidence,
      metadata: { ...result.metadata, disclaimerAdded: true },
    }
  } catch (error) {
    console.error('Error in legal agent:', error)
    return {
      messages: [
        new AIMessage(
          'I apologize, but I encountered an error processing your legal query. Please try again.'
        ),
      ],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Route to financial agent
 */
async function routeToFinancial(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const result = await financialAgent.invoke(state)

    // Get user query for topic-specific disclaimer
    const lastUserMessage = state.messages[state.messages.length - 1]
    const userQuery = lastUserMessage ? (lastUserMessage.content as string) : ''

    // Add disclaimers to response messages
    const messagesWithDisclaimers = addDisclaimersToMessages(
      result.messages as AIMessage[],
      'financial',
      userQuery
    )

    return {
      messages: messagesWithDisclaimers,
      tokensUsed: result.tokensUsed || 0,
      confidence: result.confidence,
      metadata: { ...result.metadata, disclaimerAdded: true },
    }
  } catch (error) {
    console.error('Error in financial agent:', error)
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
 * Route to task agent
 */
async function routeToTask(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const result = await taskAgent.invoke(state)

    // Get user query for topic-specific disclaimer (tasks may discuss legal/financial topics)
    const lastUserMessage = state.messages[state.messages.length - 1]
    const userQuery = lastUserMessage ? (lastUserMessage.content as string) : ''

    // Add disclaimers if task response discusses legal/financial topics
    const messagesWithDisclaimers = addDisclaimersToMessages(
      result.messages as AIMessage[],
      'tasks',
      userQuery
    )

    return {
      messages: messagesWithDisclaimers,
      tokensUsed: result.tokensUsed || 0,
      confidence: result.confidence,
      completedSteps: result.completedSteps || [],
      metadata: result.metadata,
    }
  } catch (error) {
    console.error('Error in task agent:', error)
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
 * Handle general queries
 */
async function handleGeneral(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const llmConfig = getLLMConfigFromState(state)
    const llm = createLLM(llmConfig)

    // Build system prompt with context if available (Issue #95)
    let systemPrompt = GENERAL_SYSTEM_PROMPT
    if (state.userContextSummary) {
      systemPrompt = `${GENERAL_SYSTEM_PROMPT}\n\n${state.userContextSummary}`
    }

    const lastMessage = state.messages[state.messages.length - 1]
    const userQuery = lastMessage.content as string

    const response = await llm.invoke([
      { role: 'system', content: systemPrompt },
      ...state.messages,
    ])

    // Add disclaimers if general response discusses legal/financial topics
    const messagesWithDisclaimers = addDisclaimersToMessages(
      [response as AIMessage],
      'general',
      userQuery
    )

    const tokensUsed = Math.ceil(
      (systemPrompt.length + userQuery.length + (response.content as string).length) / 4
    )

    return {
      messages: messagesWithDisclaimers,
      tokensUsed,
      confidence: 0.8,
    }
  } catch (error) {
    console.error('Error in general handler:', error)
    return {
      messages: [
        new AIMessage('I apologize, but I encountered an error. How else can I help you today?'),
      ],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Determine next step based on active agent
 */
function routeByAgent(state: AgentStateType): string {
  switch (state.activeAgent) {
    case 'legal':
      return 'legal'
    case 'financial':
      return 'financial'
    case 'tasks':
      return 'tasks'
    case 'triage':
    default:
      return 'general'
  }
}

/**
 * Helper function to add disclaimers to agent response messages
 */
function addDisclaimersToMessages(
  messages: AIMessage[],
  agentType: string,
  userQuery: string
): AIMessage[] {
  return messages.map((msg) => {
    const content = msg.content as string
    if (!shouldAddDisclaimer(content, agentType)) {
      return msg
    }
    const contentWithDisclaimer = appendDisclaimer(content, agentType, userQuery)
    if (contentWithDisclaimer === content) {
      return msg
    }
    return new AIMessage({
      content: contentWithDisclaimer,
      tool_calls: msg.tool_calls || [],
    })
  })
}

/**
 * Create the main agent graph
 */
export async function createMainGraph() {
  const checkpointer = await getCheckpointerWithFallback()

  const graph = new StateGraph(AgentState)
    .addNode('triage', routeToTriage)
    .addNode('legal', routeToLegal)
    .addNode('financial', routeToFinancial)
    .addNode('tasks', routeToTask)
    .addNode('general', handleGeneral)
    .addEdge(START, 'triage')
    .addConditionalEdges('triage', routeByAgent, {
      legal: 'legal',
      financial: 'financial',
      tasks: 'tasks',
      general: 'general',
    })
    .addEdge('legal', END)
    .addEdge('financial', END)
    .addEdge('tasks', END)
    .addEdge('general', END)

  return graph.compile({ checkpointer })
}

/**
 * Initialize the main graph (singleton)
 */
let mainGraph: Awaited<ReturnType<typeof createMainGraph>> | null = null

export async function getMainGraph() {
  if (!mainGraph) {
    mainGraph = await createMainGraph()
  }
  return mainGraph
}
