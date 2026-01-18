# Frontend Features Guidelines

This directory follows a feature-based React architecture. Each feature is a self-contained module containing its own components, hooks, and API logic.

## Structure

Each feature directory MUST follow this structure:

- `api/`: Centralized API calls (e.g., `auth.api.ts`)
- `components/`: Feature-specific UI components
- `hooks/`: Feature-specific hooks and state management (Zustand)
- `types.ts`: Feature-specific TypeScript interfaces (optional)

### Core Features

- `auth/`: Login, Register, `useAuthStore` (Zustand with persistence)
- `chat/`: ChatInterface, MessageBubble, `useChat` hook, agent API
- `dashboard/`: DashboardPage (hero task, progress indicators)
- `settings/`: ApiKeySettings (user LLM key management)
- `tasks/`: TaskDashboard (business formation tracking)

## Patterns

### Component Organization

Follow this exact order within components:

1. **Hooks**: `useQuery`, `useAuthStore`, `useState`, etc.
2. **Refs**: `useRef`
3. **Effects**: `useEffect`
4. **Handlers**: `handleClick`, `handleSubmit`, etc.
5. **Early Returns**: Loading and error state checks
6. **Render**: Main JSX return

```tsx
export function FeatureComponent({ prop }: Props) {
  const { data, isLoading } = useQuery(...)  // 1. Hooks first
  const [state, setState] = useState()
  const scrollRef = useRef()                 // 2. Refs

  useEffect(() => { ... }, [deps])           // 3. Effects after

  const handleClick = () => { ... }          // 4. Handlers

  if (isLoading) return <Spinner />          // 5. Early returns

  return ( ... )                             // 6. Render
}
```

### State Management

- **Client State**: Use **Zustand** for global UI state and persistence (e.g., `useAuthStore`).
- **Server State**: Use **TanStack Query** (`useQuery`, `useMutation`) for all API interactions.
- **API Calls**: MUST reside in the `{feature}/api/` directory using the shared `apiClient`.

## Imports

- **Shared UI**: `@/components/`
- **Shared Types**: `@shared/types`
- **Catalyst UI**: `@/components/catalyst-ui-kit/typescript/`
- **Internal**: Relative paths for feature-local files (e.g., `../hooks/useChat`)

## Anti-Patterns

- **No console.log**: Use `console.warn` or `console.error` for debugging.
- **File Limits**: Max 300 lines per file, 50 lines per function.
- **Complexity**: Max 4 levels of nesting; NO nested ternaries.
- **Direct Fetch**: Always use `apiClient` within TanStack Query hooks.
