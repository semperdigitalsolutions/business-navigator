/**
 * LangGraph State Definitions
 * Defines the state structure for AI agent conversations
 */
import { BaseMessage } from '@langchain/core/messages'
import { Annotation } from '@langchain/langgraph'

/**
 * Main agent state that persists across conversation turns
 * This state is automatically saved to PostgreSQL checkpoints
 */
export const AgentState = Annotation.Root({
  // Conversation messages
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => prev.concat(next),
    default: () => [],
  }),

  // Thread and session identifiers
  threadId: Annotation<string>(),
  sessionId: Annotation<string | undefined>(),

  // User context
  userId: Annotation<string>(),
  businessId: Annotation<string | undefined>(),

  // Business context
  businessType: Annotation<string | undefined>(),
  state: Annotation<string | undefined>(), // US state
  hasPartners: Annotation<boolean | undefined>(),
  hasEmployees: Annotation<boolean | undefined>(),

  // Current task context
  currentTask: Annotation<
    | {
        id: string
        title: string
        category: string
        status: string
      }
    | undefined
  >(),

  // Progress tracking
  completedSteps: Annotation<string[]>({
    reducer: (prev, next) => [...new Set([...prev, ...next])],
    default: () => [],
  }),

  // Agent routing
  activeAgent: Annotation<'triage' | 'legal' | 'financial' | 'tasks' | undefined>(),
  intent: Annotation<'legal' | 'financial' | 'tasks' | 'general' | undefined>(),
  routingReason: Annotation<string | undefined>(),

  // Response metadata
  confidence: Annotation<number | undefined>(),
  tokensUsed: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),

  // LLM configuration (from user settings or defaults)
  llmProvider: Annotation<'openrouter' | 'openai' | 'anthropic' | undefined>(),
  llmModel: Annotation<string | undefined>(),
  llmApiKey: Annotation<string | undefined>(),

  // Additional metadata
  metadata: Annotation<Record<string, any>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),

  // Error handling
  error: Annotation<string | undefined>(),
  retryCount: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
})

export type AgentStateType = typeof AgentState.State

/**
 * Triage agent specific state
 */
export const TriageState = Annotation.Root({
  ...AgentState.spec,
  intentConfidence: Annotation<number | undefined>(),
})

export type TriageStateType = typeof TriageState.State

/**
 * Legal Navigator specific state
 */
export const LegalState = Annotation.Root({
  ...AgentState.spec,
  legalCategory: Annotation<'structure' | 'formation' | 'compliance' | 'documents' | undefined>(),
  recommendedActions: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  documentsGenerated: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
})

export type LegalStateType = typeof LegalState.State

/**
 * Financial Planner specific state
 */
export const FinancialState = Annotation.Root({
  ...AgentState.spec,
  financialCategory: Annotation<'projections' | 'taxes' | 'funding' | 'accounting' | undefined>(),
  projections: Annotation<
    | {
        revenue?: number[]
        expenses?: number[]
        cashFlow?: number[]
      }
    | undefined
  >(),
  recommendations: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
})

export type FinancialStateType = typeof FinancialState.State

/**
 * Task Assistant specific state
 */
export const TaskState = Annotation.Root({
  ...AgentState.spec,
  taskCategory: Annotation<
    'legal' | 'financial' | 'product' | 'marketing' | 'testing' | 'analytics' | undefined
  >(),
  taskStatus: Annotation<'pending' | 'in_progress' | 'completed' | 'blocked' | undefined>(),
  nextTasks: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
})

export type TaskStateType = typeof TaskState.State
