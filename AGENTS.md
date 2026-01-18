# AGENTS.md - AI Coding Agent Guidelines

## Project Context

Business Navigator is a Bun-powered monorepo for an AI-driven business formation platform.

**CRITICAL:** The codebase architecture DIVERGES significantly from the Notion documentation. Always prioritize codebase patterns over documentation when they conflict.

| Layer    | Technology                                                     |
| -------- | -------------------------------------------------------------- |
| Runtime  | Bun (all packages)                                             |
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS                    |
| Backend  | ElysiaJS + LangGraph + Supabase (PostgreSQL)                   |
| AI       | LangGraph multi-agent system (Triage, Legal, Financial, Tasks) |
| State    | TanStack Query (server) + Zustand (client)                     |

## Commands

```bash
# Development
bun install                                 # Install all dependencies
bun run dev                                 # Start frontend & backend
bun run dev:frontend                        # Frontend only (port 5173)
bun run dev:backend                         # Backend only (port 3000)

# Quality (CI enforced)
bun run quality                             # Run ALL checks
bun run format && bun run lint              # Format + lint
bun run type-check                          # TypeScript check

# Testing
cd backend && bun test                      # All tests
cd backend && bun test path/to/file.test.ts # Single file
```

## Code Style

### Formatting (Prettier)

- NO semicolons, single quotes, 2-space indent, 100 char width
- ES5 trailing commas, arrow parens always

### File Limits (ESLint - errors block CI)

| Rule               | Limit |
| ------------------ | ----- |
| Max lines/file     | 300   |
| Max lines/function | 50    |
| Max nesting depth  | 4     |
| Max params         | 4     |

### TypeScript

- Strict mode, no `any` (use `unknown`), no `@ts-ignore`, no `!` assertions
- Prefix unused vars with `_`

### Imports

```typescript
// Frontend
import { Component } from '@/components/Component'
import { User } from '@shared/types'

// Backend - MUST use .js extension for local files
import { supabase } from '@/config/database.js'
import { errorResponse } from '@/middleware/error.js'
```

Import order: External → `@shared/*` → `@/*` → Relative

### Naming

| Type       | Convention           | Example                      |
| ---------- | -------------------- | ---------------------------- |
| vars/funcs | camelCase            | `getUserById`                |
| Components | PascalCase           | `ChatInterface`              |
| Files      | kebab-case           | `auth-routes.ts`             |
| Constants  | SCREAMING_SNAKE      | `MAX_RETRIES`                |
| Enums      | PascalCase.SCREAMING | `BusinessStatus.IN_PROGRESS` |

### Error Handling (Backend)

```typescript
import { errorResponse, successResponse, errors } from '@/middleware/error.js'
return successResponse({ user }, 'Success')
return errors.unauthorized() | errors.notFound('Resource') | errors.badRequest('msg')
```

### API Validation (ElysiaJS TypeBox)

```typescript
.post('/register', handler, {
  body: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 8 }),
  }),
})
```

### React Patterns

```typescript
// Feature structure: src/features/{name}/{components,hooks,api,types.ts}
export function Component({ prop }: Props) {
  const [state, setState] = useState()       // hooks first
  const { data } = useQuery()
  useEffect(() => {}, [deps])                // effects after
  const handleClick = () => {}               // handlers
  if (isLoading) return <Spinner />          // early returns
  return (...)                               // render
}
```

## Structure

```
business-navigator/
├── frontend/src/
│   ├── features/     # Auth, Chat, Dashboard, Settings, Tasks
│   ├── components/   # Shared UI
│   └── layouts/
├── backend/src/
│   ├── agents/       # LangGraph (core/, triage/, legal/, financial/, tasks/)
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth, error
│   └── config/       # Database, env
└── shared/src/       # Types & constants
```

## Agent Protocols

1. **Search First**: Find existing patterns before writing new code
2. **Respect Limits**: Split files > 300 lines
3. **Verify**: Run `bun run type-check` after changes
4. **Match Patterns**: Copy style from similar files
5. **No Console**: Use `console.warn/error` only (frontend)

## Gotchas

- Backend imports MUST use `.js` extension (Bun ESM)
- ElysiaJS uses TypeBox (`t.Object`), not Zod
- LangGraph agents in `backend/src/agents/` - NOT simple OpenAI calls
- Supabase client: `@/config/database.js`
