# Business Navigator - Frontend

The frontend application for Business Navigator, an AI-powered business formation platform.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Bun** - JavaScript runtime and package manager
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev
```

The application will be available at `http://localhost:5173`

### Building

```bash
# Type check
bun run type-check

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── styles/          # Global styles and Tailwind configuration
│   │   └── globals.css  # Global CSS with Tailwind directives
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── public/              # Public static files
├── .env.example         # Environment variables template
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.app.json    # TypeScript configuration for app
├── tsconfig.json        # TypeScript base configuration
├── tsconfig.node.json   # TypeScript configuration for Node
└── vite.config.ts       # Vite configuration
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Path Aliases

The following path aliases are configured:

- `@/*` - Maps to `./src/*`
- `@shared/*` - Maps to `../shared/src/*` (monorepo shared code)

Example usage:

```typescript
import { Button } from '@/components/Button'
import { User, ApiResponse } from '@shared/types'
import { APP_NAME } from '@shared/constants'
```

### Vite Configuration

The Vite server is configured with:

- **Port**: 5173
- **API Proxy**: `/api` routes are proxied to `http://localhost:3000`

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run type-check` - Run TypeScript type checking
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow the existing code structure and naming conventions
- Use Tailwind CSS for styling
- Keep components small and focused

### State Management

- Use **TanStack Query** for server state (data fetching, caching)
- Use **Zustand** for client state (UI state, user preferences)

### API Calls

- Use the configured Axios instance
- Leverage TanStack Query for data fetching
- Handle errors gracefully with proper user feedback

## Monorepo Structure

This frontend is part of the Business Navigator monorepo:

```
business-navigator/
├── frontend/    # This package (React frontend)
├── backend/     # Backend API (ElysiaJS)
├── shared/      # Shared types and utilities
└── docs/        # Documentation
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `bun run type-check` and `bun run lint`
4. Test your changes thoroughly
5. Submit a pull request

## License

Proprietary - All rights reserved
