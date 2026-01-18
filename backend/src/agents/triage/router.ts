/**
 * Triage Agent - Routes user queries to appropriate specialist agents
 */
import { END, START, StateGraph } from '@langchain/langgraph'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { TriageState, type TriageStateType } from '../core/state.js'
import { createLLM, getLLMConfigFromState } from '../core/llm.js'
import { TRIAGE_SYSTEM_PROMPT } from '../core/prompts.js'

/**
 * Classify user intent and determine which specialist agent to route to
 */
async function classifyIntent(state: TriageStateType): Promise<Partial<TriageStateType>> {
  const llmConfig = getLLMConfigFromState(state)
  const llm = createLLM({
    ...llmConfig,
    model: llmConfig.model, // Use fast model for routing
    temperature: 0.3, // Lower temperature for consistent routing
  })

  const lastMessage = state.messages[state.messages.length - 1]
  const userQuery = lastMessage.content as string

  const prompt = `${TRIAGE_SYSTEM_PROMPT}

User query: "${userQuery}"

Classify this query as one of: legal, financial, tasks, general
Respond in the following JSON format:
{
  "intent": "legal|financial|tasks|general",
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`

  try {
    const response = await llm.invoke([
      new SystemMessage(TRIAGE_SYSTEM_PROMPT),
      new HumanMessage(userQuery),
    ])

    const content = response.content as string

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback to general if can't parse
      return {
        intent: 'general',
        intentConfidence: 0.5,
        routingReason: 'Could not determine intent',
        activeAgent: 'triage',
      }
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      intent: result.intent,
      intentConfidence: result.confidence,
      routingReason: result.reason,
      activeAgent: result.intent === 'general' ? 'triage' : result.intent,
      messages: [new AIMessage(`Routing to ${result.intent} specialist: ${result.reason}`)],
    }
  } catch (error) {
    console.error('Error in intent classification:', error)
    return {
      intent: 'general',
      intentConfidence: 0.3,
      routingReason: 'Error in classification',
      activeAgent: 'triage',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Route to appropriate specialist based on intent
 */
function routeToSpecialist(state: TriageStateType): string {
  const intent = state.intent

  switch (intent) {
    case 'legal':
      return 'legal'
    case 'financial':
      return 'financial'
    case 'tasks':
      return 'tasks'
    default:
      return 'general'
  }
}

/**
 * Create the triage agent graph
 */
export function createTriageAgent() {
  const graph = new StateGraph(TriageState)
    .addNode('classify', classifyIntent)
    .addEdge(START, 'classify')
    .addConditionalEdges('classify', routeToSpecialist, {
      legal: END,
      financial: END,
      tasks: END,
      general: END,
    })

  return graph.compile()
}
