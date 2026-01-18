# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Business Navigator is an AI-powered business formation platform that guides first-time founders through launching their first US business. It uses a multi-agent AI system built with LangGraph to provide specialized assistance for legal, financial, and task-related queries.

**Current Sprint:** Week 2 of 8-week build to BETA launch.

**Key Architecture Decisions (Confirmed Jan 2026):**

- Auth: Supabase Auth with JWT
- AI: LangGraph multi-agent (Triage → Legal/Financial/Tasks specialists)
- Rate Limiting: Credit-based system (users select model, different costs)
- Frontend: React 19 PWA (mobile-first, works on desktop)
- Onboarding: 7-step wizard for maximum AI context

## Commands

```bash
# Install dependencies (uses Bun workspaces)
bun install

# Development
bun run dev                  # Run both frontend and backend concurrently
bun run dev:frontend         # Frontend only (Vite on port 5173)
bun run dev:backend          # Backend only (Elysia on port 3000)

# Build
bun run build                # Build all packages (shared → backend → frontend)

# Quality checks
bun run quality              # Run all checks: format, lint, type-check
bun run type-check           # TypeScript type checking
bun run lint                 # ESLint
bun run lint:fix             # Auto-fix lint issues
bun run format               # Prettier formatting

# Testing (infrastructure ready, add *.test.ts files as needed)
cd backend && bun test                    # Run all backend tests
cd backend && bun test src/path/file.test.ts  # Run single test file
```

## Architecture

### Monorepo Structure

This is a Bun workspaces monorepo with three packages:

- `frontend/` - React 19 + Vite + Tailwind CSS
- `backend/` - ElysiaJS API server with LangGraph agents
- `shared/` - TypeScript types and constants shared between frontend and backend

### LangGraph Multi-Agent System

The backend implements a LangGraph-based AI orchestration system in `backend/src/agents/`:

```
agents/
├── graph.ts              # Main StateGraph orchestrator (entry point)
├── triage/router.ts      # Intent classification → routes to specialists
├── legal/legal-navigator.ts    # Business structure, formation, compliance
├── financial/financial-planner.ts  # Projections, taxes, funding
├── tasks/task-assistant.ts     # Task tracking and guidance
└── core/
    ├── state.ts          # LangGraph state annotations (AgentState, TriageState, etc.)
    ├── checkpoint.ts     # PostgreSQL checkpointing for conversation persistence
    ├── llm.ts            # LLM configuration (OpenRouter, OpenAI, Anthropic)
    ├── prompts.ts        # System prompts for each agent
    └── tools.ts          # Shared tools available to agents
```

**Flow:** User message → Triage Agent (classifies intent) → Specialist Agent (legal/financial/tasks/general) → Response

State is persisted to PostgreSQL via LangGraph checkpoints, enabling conversation continuity across sessions.

**LangGraph Implementation Patterns:**

- **Context Pre-loading**: Every specialist graph MUST start with a `loadContext` node that fetches business state before LLM invocation
- **Manual Tool Execution**: DO NOT use `ToolNode` from `@langchain/langgraph/prebuilt`. Iterate through `tool_calls` manually for verified execution
- **Safety Guardrails**: NEVER provide definitive legal/tax advice. Use educational framing ("Commonly, LLCs are used for...") and always include professional consultation disclaimers

### Frontend Feature Structure

The frontend uses a feature-based architecture in `frontend/src/features/`:

- `auth/` - Authentication (Zustand store, login/register forms)
- `chat/` - AI chat interface (hooks, components, API)
- `dashboard/` - Main dashboard
- `tasks/` - Task tracking
- `settings/` - User settings including API key management

State management uses Zustand, data fetching uses TanStack Query.

### Backend Routes

ElysiaJS routes are in `backend/src/routes/`:

- `auth.routes.ts` - JWT authentication
- `business.routes.ts` - CRUD for businesses
- `agent.routes.ts` - LangGraph chat endpoints
- `settings.routes.ts` - API key management

### Database

Uses Supabase (PostgreSQL). Types are in `backend/src/types/database.ts`.

## Code Style & Conventions

**Formatting (Prettier):**

- No semicolons (ASI)
- Single quotes
- 2-space indentation
- 100 character line width

**TypeScript:**

- Path aliases: `@/*` for local src, `@shared/*` for shared package
- Backend imports MUST use `.js` extension for local files (e.g., `import { x } from './utils.js'`)
- Naming: `camelCase` for vars/funcs, `PascalCase` for components/classes, `kebab-case` for files
- Strict: No `any` (use `unknown`), no `@ts-ignore`, no `!` assertions
- Prefix unused vars with `_` to satisfy ESLint (e.g., `_unusedParam`)

**Backend API:**

- Validation uses **TypeBox** (`t.Object`), NOT Zod for route schemas
- Error handling: Use `@/middleware/error.js` helpers (`successResponse`, `errors.notFound`)

**Console Logging:**

- Frontend: `console.log` is forbidden; use `console.warn/error` only
- Backend: Console logging allowed for debugging/logging

**Enforced limits (see `docs/CODE_QUALITY.md`):**

- Max 300 lines per file
- Max 50 lines per function
- Max cyclomatic complexity: 10
- Max nesting depth: 4
- Max function parameters: 4

Pre-commit hooks run format, lint, and type-check automatically.

## Project Documentation

Check `docs/Notion/` for exported Notion specs. Key documents:

- **User Flows** - Task interaction patterns, navigation, user journeys
- **Auth & Onboarding** - 7-step onboarding quiz, validation rules, data storage
- **8-Week Build Plan** - Sprint timeline and milestones
- **AI Chat System** - Chat system design
- **Architecture Implementation Details** - Technical implementation specifics
- **Design Specs** - UI/UX design specifications
- **Product Overview** - Product vision and feature descriptions
- **Security & Performance** - Security requirements and performance targets

**Note:** Codebase patterns may diverge from Notion documentation. When conflicts occur, prioritize actual codebase patterns over documentation.

## Environment Variables

Backend requires `.env` with:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `OPENROUTER_API_KEY` (or user-provided API keys via settings)
- `DATABASE_URL` (for LangGraph checkpoints)

Frontend requires `.env` with:

- `VITE_API_URL` (backend URL)
