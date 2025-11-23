# Business Navigator

AI-powered business formation platform that guides first-time founders through launching their first US business in 8 weeks.

## Project Structure
```
business-navigator/
├── frontend/          # React + Vite application
├── backend/           # ElysiaJS + LangGraph API
├── shared/            # Shared TypeScript types and constants
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## Tech Stack

- **Runtime:** Bun (all packages)
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Catalyst UI
- **Backend:** Bun, ElysiaJS, LangGraph, PostgreSQL
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude Sonnet 4 via LangGraph
- **Deployment:** Railway (backend), Netlify (frontend)

## Quick Start
```bash
# Install all dependencies (uses Bun workspaces)
bun install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run development servers
bun run dev
```

## Development

- `bun run dev` - Run both frontend and backend
- `bun run build` - Build all packages
- `bun run type-check` - Type check all packages

## Team

- 2 developers
- Timeline: 8 weeks to MVP
- Target: First-time founders launching US businesses

## Documentation

See `/docs` folder for detailed documentation:
- Database Schema
- API Documentation
- Architecture Decisions
- Development Workflow

---

**Status:** Initial Setup
**Last Updated:** November 2024
