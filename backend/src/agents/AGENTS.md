# LangGraph Multi-Agent System

This directory implements the core intelligent guidance engine for the Business Navigator platform, using a multi-agent orchestration pattern to handle complex legal, financial, and task-based business formation workflows.

## ARCHITECTURE

- **Nested Router-Delegate Pattern**: Instead of a single flat graph, the system uses a central orchestrator that delegates complex sub-tasks to specialized sub-graphs.
- **Central Orchestrator (`graph.ts`)**: Manages the top-level `StateGraph`, handling transitions between triage, specialists, and general conversation nodes.
- **Triage Sub-graph (`triage/router.ts`)**: An isolated graph that analyzes user intent and classifies it into domain-specific categories before routing.
- **Specialist Delegates**:
  - `legal/`: Dedicated sub-graph for business structure (LLC, Corp), state-specific compliance, and legal document guidance.
  - `financial/`: Specialized logic for financial projections, tax planning, funding strategies, and accounting setup.
  - `tasks/`: Orchestration for progress tracking, task dependencies, and custom formation roadmap management.

## KEY FILES

- `graph.ts`: The main entry point that compiles the `StateGraph` and manages global routing logic.
- `core/state.ts`: Defines the global `AgentState` using `Annotation.Root`, plus specialist state extensions like `LegalState` and `TaskState`.
- `core/tools.ts`: A centralized repository of Supabase-backed tools (e.g., `get_user_business`, `get_user_tasks`, `createUserTask`).
- `core/llm.ts`: A model factory supporting OpenRouter (primary), OpenAI, and Anthropic with automatic fallback configurations.
- `core/prompts.ts`: Contains domain-specific system prompts with hardcoded safety guardrails and "NEVER/ALWAYS" directives.
- `core/checkpoint.ts`: Implements persistence logic using `PostgresSaver` with a local `MemoryCheckpointer` for development fallback.

## UNIQUE PATTERNS

1. **Context Pre-loading**: Every specialist graph starts with a mandatory `loadContext` node. This node proactively fetches business state and task history from the database to ensure the LLM has ground truth data before generating a response.
2. **Manual Tool Execution**: Agents do NOT use the standard LangGraph `ToolNode`. Instead, they iterate through `tool_calls` manually in the node logic. This allows for specialized result formatting and prevents the agent from hallucinating tool outputs without verification.
3. **State Inheritance**: Specialist sub-graphs utilize state objects that extend the base `AgentState.spec`. This ensures a shared common context (userId, businessId) while allowing agents to track specialist-specific data like `legalCategory` or `projections`.
4. **Advanced Reducers**:
   - `messages`: Custom reducer using `.concat()` to preserve the complete history of human and AI messages.
   - `completedSteps`: A unique-set reducer that tracks progress without duplication across turns.
   - `tokensUsed`: A summation reducer that tracks total cost and usage across the entire session thread.
5. **Hybrid Persistence Strategy**: Uses `PostgresSaver` for production-grade thread persistence, automatically falling back to in-memory storage if the database is unavailable.

## ADDING A NEW AGENT

1. **Create Directory**: Initialize a new subdirectory (e.g., `marketing/`) for the specialist logic.
2. **Define State**: In `core/state.ts`, create a new `Annotation.Root` that spreads `AgentState.spec` and adds specialist fields.
3. **Build Sub-graph**: Implement a graph starting with `loadContext`, followed by an `agent` node, and a `shouldContinue` conditional edge.
4. **Register in Orchestrator**:
   - Import the sub-graph factory in `graph.ts`.
   - Add the agent's routing node to the main `StateGraph`.
   - Update the conditional edges in the `triage` node to include the new agent.
5. **Define Specialist Tools**: Add any new domain-specific tools to `core/tools.ts` and include them in the `agentTools` array if they should be globally accessible.

## ANTI-PATTERNS & GUARDRAILS

- **Definitive Advice**: NEVER provide absolute legal or tax advice. Use educational framing: "Commonly, LLCs are used for..." or "In most states...".
- **Professional Consultation**: ALWAYS include a standard disclaimer reminding users to consult with a licensed attorney or CPA.
- **Direct ToolNode Usage**: NEVER use `ToolNode` from `@langchain/langgraph/prebuilt`. Always follow the manual iteration pattern for consistency.
- **Blind LLM Invocations**: ALWAYS run a `loadContext` or similar data-fetching node before calling the LLM to prevent hallucinations based on stale session data.
- **Console Logs**: NEVER use `console.log` for debugging; use structured logging or `console.error` for exceptions as per project guidelines.
