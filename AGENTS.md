# AGENTS.md - AI Coding Agent Guidelines

## Project Overview

Bun-powered monorepo for an AI-driven business formation platform.

| Component    | Technology                                                    |
| :----------- | :------------------------------------------------------------ |
| **Runtime**  | Bun (all packages)                                            |
| **Frontend** | React 19 + Vite + Tailwind v4 + Catalyst UI                   |
| **Backend**  | ElysiaJS + LangGraph (Router-Delegate architecture)           |
| **Database** | Supabase (PostgreSQL)                                         |
| **State**    | TanStack Query + Zustand (UI), LangGraph checkpoints (Server) |
| **LLM**      | OpenRouter (Claude 3.5 Sonnet preferred)                      |

## Development Commands

| Task               | Command                                                   |
| :----------------- | :-------------------------------------------------------- |
| **Install**        | `bun install`                                             |
| **Dev (All)**      | `bun run dev`                                             |
| **Dev (Frontend)** | `bun run dev:frontend` (Port 5173)                        |
| **Dev (Backend)**  | `bun run dev:backend` (Port 3000)                         |
| **Quality**        | `bun run quality` (Runs format:check + lint + type-check) |
| **Test (All)**     | `cd backend && bun test`                                  |
| **Test (File)**    | `cd backend && bun test path/to/file.test.ts`             |

## Code Style & Limits

| Metric          | Limit / Rule                                                  |
| :-------------- | :------------------------------------------------------------ |
| **Formatting**  | No semicolons, single quotes, 2-space indent, 100 width       |
| **File Length** | Max 300 lines (ESLint error)                                  |
| **Func Length** | Max 50 lines (ESLint error)                                   |
| **Nesting**     | Max 4 levels (ESLint error)                                   |
| **Params**      | Max 4 parameters per function                                 |
| **Naming**      | kebab-case (Files), PascalCase (Components), camelCase (Vars) |

## TypeScript & API Conventions

- **Strict TS**: No `any` (use `unknown`), no `@ts-ignore`, no `!` assertions.
- **Backend Imports**: MUST use `.js` extension for local files (e.g., `import { x } from './file.js'`).
- **Path Aliases**: `@/*` for local package, `@shared/*` for shared library.
- **Validation**: Backend uses **TypeBox** (`t.Object`), NOT Zod for route schemas.
- **Error Handling**: Use `@/middleware/error.js` helpers (`successResponse`, `errors.notFound`).
- **Unused Vars**: Prefix with `_` to satisfy ESLint.

## Project Structure

```text
business-navigator/
├── frontend/src/
│   ├── features/          # auth, chat, dashboard, settings, tasks
│   │   └── {feature}/     # components/, hooks/, api/, types.ts
│   ├── components/
│   │   └── catalyst-ui-kit/typescript/  # Vendored Tailwind v4 UI kit
│   ├── layouts/           # Page layouts (e.g., SidebarLayout)
│   └── lib/               # Shared frontend utilities (queryClient, store)
├── backend/src/
│   ├── agents/            # LangGraph Implementation
│   │   ├── core/          # checkpoint.ts, llm.ts, state.ts, tools.ts
│   │   ├── triage/        # router.ts (Triage agent)
│   │   └── {domain}/      # legal-navigator, financial-planner, etc.
│   ├── routes/            # Elysia routes mapping to agents
│   ├── middleware/        # Auth, error, logging
│   ├── domains/           # (Placeholder for future domain logic)
│   └── infrastructure/    # (Placeholder for external services)
└── shared/src/            # types/, constants/
```

## AI Agent Protocols (LangGraph)

- **Architecture**: Router-Delegate pattern. The Triage agent routes to specialized delegates.
- **Tool Execution**: Manual execution within nodes. **DO NOT** use standard `ToolNode`.
- **State Management**: Persistent via LangGraph checkpoints; state must be serializable.
- **Safety**: NEVER provide definitive legal/tax advice. Always include "I am an AI assistant" disclaimers.
- **Prompting**: System prompts reside in `backend/src/agents/core/prompts.ts` or domain files.

## React & UI Patterns

- **Tailwind v4**: Use `@tailwind` directives. Avoid legacy Tailwind v3 configurations.
- **Catalyst UI**: Requires `@headlessui/react`, `clsx`, and `framer-motion`.
- **Components**: Functional components only. Use `forwardRef` for UI kit components.
- **State**: Use `Zustand` for global UI state and `TanStack Query` for server state.

## Anti-Patterns & Gotchas

- **Source of Truth**: Codebase patterns DIVERGE from Notion; prioritize existing code.
- **LLM Provider**: OpenRouter is primary. `OPENROUTER_API_KEY` is required in `.env`.
- **CI Enforcement**: Test job has `continue-on-error: true`. Quality job is strict.
- **Placeholder Dirs**: `domains/` and `infrastructure/` are intentional placeholders.
- **Console Logs**: `console.log` is forbidden. Use `console.warn/error` in frontend only.
- **Backend ESM**: Bun requires `.js` in imports even though files are `.ts`.
