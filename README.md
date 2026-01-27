# Business Navigator

AI-powered business formation platform that guides first-time founders through launching their first US business. Uses LangGraph multi-agent AI system for personalized guidance across legal, financial, and operational domains.

## Features

### Week 2 (Current)

- **7-Step Onboarding Wizard** - Comprehensive intake with auto-save and cross-device resume
- **AI Business Plan Generation** - Personalized roadmap using GPT-4/Opus via LangGraph
- **Hero Task System** - Single next-best-action displayed prominently
- **Confidence Score** - Real-time progress tracking across 4 phases (Ideation, Legal, Financial, Launch Prep)
- **Enhanced Authentication** - Password strength validation, OAuth (Google), httpOnly cookies
- **Responsive Dashboard** - Mobile-first design with desktop sidebar and mobile bottom nav

### Core Features

- **Multi-Agent AI System** - LangGraph-powered specialists (Legal Navigator, Financial Planner, Task Assistant)
- **Task Management** - Priority-based task queue with dependencies
- **Real-time Chat** - AI assistant for business formation questions
- **Progress Tracking** - Visual confidence scores and phase completion metrics

## Project Structure

```
business-navigator/
├── frontend/              # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── features/      # Feature-based architecture
│   │   │   ├── auth/      # Authentication (login, register, OAuth)
│   │   │   ├── onboarding/# 7-step wizard with AI integration
│   │   │   ├── dashboard/ # Hero task, confidence score, layout
│   │   │   ├── navigation/# Desktop sidebar, mobile bottom nav
│   │   │   ├── chat/      # AI chat interface
│   │   │   └── tasks/     # Task management
│   │   ├── components/    # Shared components (skeletons, error boundaries)
│   │   └── layouts/       # Layout wrappers
│   └── public/            # Static assets
│
├── backend/               # ElysiaJS + LangGraph
│   ├── src/
│   │   ├── agents/        # LangGraph multi-agent system
│   │   │   ├── graph.ts   # Main orchestrator
│   │   │   ├── triage/    # Intent classification router
│   │   │   ├── legal/     # Business structure, compliance
│   │   │   ├── financial/ # Projections, taxes, funding
│   │   │   ├── tasks/     # Task tracking and guidance
│   │   │   ├── onboarding/# Business plan generation
│   │   │   └── core/      # Shared tools, prompts, state
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Rate limiting, auth, error handling
│   │   ├── validation/    # TypeBox schemas
│   │   └── utils/         # Helpers (password, OAuth, encryption)
│   └── scripts/           # Database migrations
│
├── shared/                # Shared TypeScript types
└── docs/                  # Documentation
```

## Tech Stack

- **Runtime:** Bun (all packages)
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Catalyst UI Kit
- **Backend:** Bun, ElysiaJS, TypeScript
- **AI:** LangGraph (multi-agent orchestration)
  - Models: GPT-4o, Claude Opus 4.5, Claude Haiku 3.5
  - Providers: OpenRouter, OpenAI, Anthropic
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Authentication:** Supabase Auth (JWT + OAuth)
- **State Management:** Zustand (frontend), LangGraph checkpoints (backend)
- **Validation:** TypeBox (backend), Zod (frontend)
- **Deployment:** Railway (backend), Netlify (frontend)

## Quick Start

### Prerequisites

- Bun >= 1.0.0 ([install](https://bun.sh))
- PostgreSQL >= 14 (via Supabase account)
- OpenRouter/OpenAI/Anthropic API key

### Installation

```bash
# Clone repository
git clone https://github.com/semperdigitalsolutions/business-navigator.git
cd business-navigator

# Install all dependencies (uses Bun workspaces)
bun install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure backend/.env:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key  # or OPENAI_API_KEY / ANTHROPIC_API_KEY
DATABASE_URL=postgresql://...           # for LangGraph checkpoints

# Configure frontend/.env:
VITE_API_URL=http://localhost:3000

# Apply database migrations
bun run migrate

# Run development servers
bun run dev  # Frontend: http://localhost:5173, Backend: http://localhost:3000
```

## Development

### Commands

```bash
# Development
bun run dev              # Run both frontend and backend concurrently
bun run dev:frontend     # Frontend only (Vite on port 5173)
bun run dev:backend      # Backend only (Elysia on port 3000)

# Build
bun run build            # Build all packages (shared → backend → frontend)

# Quality Checks
bun run quality          # Run all checks: format, lint, type-check
bun run type-check       # TypeScript type checking
bun run lint             # ESLint
bun run lint:fix         # Auto-fix lint issues
bun run format           # Prettier formatting

# Testing
cd backend && bun test   # Run backend tests
cd frontend && bun test  # Run frontend tests (when configured)

# Database
bun run migrate          # Apply database migrations
bun run migrate:rollback # Rollback last migration
```

### Code Style

- **No semicolons** (ASI)
- **Single quotes**
- **2-space indentation**
- **100 character line width**
- **Strict TypeScript** (no `any`, no `@ts-ignore`)
- Prefix unused vars with `_` (e.g., `_unusedParam`)

Pre-commit hooks run format, lint, and type-check automatically.

### Architecture Patterns

**Frontend:**

- Feature-based architecture (`features/*/`)
- Zustand for state management
- TanStack Query for data fetching
- Error boundaries for fault tolerance
- Loading skeletons for perceived performance

**Backend:**

- ElysiaJS with TypeBox validation
- LangGraph multi-agent system
- Manual tool execution (no `ToolNode` prebuilt)
- Context pre-loading in all specialist graphs
- PostgreSQL checkpoints for conversation persistence

**LangGraph Best Practices:**

- Always load context before LLM invocation
- Manual tool iteration for verified execution
- Educational framing (no definitive legal/tax advice)
- Fallback strategies for AI failures

## Team

- 2 developers
- Timeline: 8 weeks to MVP
- Target: First-time founders launching US businesses

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/password/validate` - Validate password strength
- `GET /api/auth/oauth/google` - Initiate Google OAuth flow
- `GET /api/auth/oauth/callback` - Handle OAuth callback

### Onboarding

- `GET /api/onboarding/status` - Check onboarding completion status
- `GET /api/onboarding/resume` - Load incomplete onboarding session
- `POST /api/onboarding/save` - Auto-save onboarding progress
- `POST /api/onboarding/complete` - Complete onboarding + generate AI plan

### Dashboard

- `GET /api/dashboard` - Get aggregated dashboard data
- `GET /api/dashboard/confidence` - Get real-time confidence score
- `POST /api/dashboard/hero-task/complete` - Mark hero task complete
- `POST /api/dashboard/hero-task/skip` - Skip hero task (24h cooldown)

### AI Chat

- `POST /api/agent/chat` - Send message to LangGraph multi-agent system

All endpoints require authentication via `Authorization: Bearer <token>` header (except register/login/OAuth).

## Key Features Explained

### 7-Step Onboarding Wizard

Comprehensive intake questionnaire that captures:

1. Business name (optional)
2. Business category (tech/SaaS, service, e-commerce, local) + current stage
3. State selection (50 US states + DC, searchable)
4. Primary goals (up to 5, multi-select)
5. Timeline (ASAP, 3 months, 6+ months, exploring) + team size
6. Final details (funding approach, experience level, primary concern)

**Features:**

- Auto-save every 2 seconds (debounced)
- Dual persistence (localStorage + server)
- Cross-device resume
- Progress indicator (7 dots on mobile, numbered circles on desktop)
- Validation per step
- AI plan generation on completion (3-5 seconds)

### AI Business Plan Generation

On onboarding completion, LangGraph agent:

1. Analyzes all onboarding responses
2. Recommends optimal business entity (LLC, S-Corp, C-Corp, Sole Prop)
3. Generates personalized executive summary
4. Creates phase-specific recommendations (Ideation, Legal, Financial, Launch Prep)
5. Selects 15-20 most relevant tasks from template library
6. Identifies "hero task" (single next-best-action)
7. Calculates initial confidence scores (5-15%)

**Fallback:** Template-based plan if AI generation fails (timeout, API error).

### Hero Task System

Single most important next action displayed prominently on dashboard:

- **Selection algorithm:** Priority-based with dependencies and skip cooldown
- **Actions:** Mark complete (updates confidence score) or Skip (24h cooldown)
- **Learn More:** Deep link to AI chat for guidance
- **Optimistic updates:** Immediate UI feedback

### Confidence Score

Real-time progress metric (0-100%) with phase breakdown:

- **Ideation (20% weight):** Business concept validation
- **Legal (40% weight):** Entity formation, compliance
- **Financial (30% weight):** Accounting, taxes, funding
- **Launch Prep (10% weight):** Marketing, product readiness

Updates automatically when tasks completed. Visualized as circular progress with color coding (red < 30, yellow 30-70, green > 70).

### Multi-Agent AI System

LangGraph-powered orchestration:

1. **Triage Router:** Classifies user intent → routes to specialist
2. **Legal Navigator:** Business structure, formation, compliance
3. **Financial Planner:** Projections, taxes, funding strategies
4. **Task Assistant:** Progress tracking, task guidance
5. **Onboarding Planner:** Personalized business plan generation

All agents have access to shared tools (get user business, tasks, templates, state requirements).

### Security Features

- **Rate Limiting:** 10 auth requests/min, 20 AI requests/min, 100 normal/15min
- **Password Strength:** Enforced complexity (uppercase, lowercase, numbers, special chars)
- **OAuth Security:** State parameter (CSRF) + PKCE (code challenge)
- **httpOnly Cookies:** Planned (currently using localStorage with rotation)
- **Input Sanitization:** XSS and SQL injection protection
- **RLS Policies:** Row-level security for multi-tenant data isolation
- **API Key Encryption:** AES-256-GCM encryption for stored API keys

## Testing

See `INTEGRATION_TESTS.md` for comprehensive testing guide covering:

- 7 test flows (registration, onboarding, dashboard, security, navigation, errors, cross-device)
- Security testing (rate limiting, passwords, OAuth, input sanitization)
- Performance benchmarks
- Success criteria checklist

**Quick smoke test:**

1. Register new user → should redirect to `/onboarding`
2. Complete 7-step wizard → should generate AI plan in <5s
3. View dashboard → should show hero task + confidence score
4. Mark task complete → confidence score should update

## Deployment

### Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up
```

Environment variables required: All from `backend/.env`

### Frontend (Netlify)

```bash
# Build
bun run build

# Deploy
netlify deploy --prod --dir=frontend/dist
```

Environment variables required: `VITE_API_URL` (Railway backend URL)

## Documentation

See `/docs` folder for detailed documentation:

- **Database Schema:** Table structures, RLS policies, indexes
- **API Documentation:** Endpoint specifications, request/response formats
- **Architecture Decisions:** Technical choices and rationale
- **LangGraph Implementation:** Agent design patterns
- **Security Best Practices:** Authentication, authorization, encryption

Additional resources:

- `CLAUDE.md` - Project instructions for Claude Code
- `CODE_QUALITY.md` - Code quality standards and limits
- `INTEGRATION_TESTS.md` - Testing guide with 7 flows

## Roadmap

### Week 3-4 (Next)

- Task detail pages with AI guidance
- State-specific legal requirements
- Financial projection calculator
- Document generation (Operating Agreement, etc.)

### Week 5-6

- Payment integration (Stripe)
- Email notifications
- Admin dashboard
- Analytics tracking

### Week 7-8

- Mobile PWA optimization
- Performance tuning
- Security audit
- Beta launch prep

## Team

- 2 developers
- Timeline: 8 weeks to BETA launch
- Target: First-time founders launching US businesses
- Current Sprint: Week 2 (Auth, Onboarding, Dashboard)

---

**Status:** Week 2 Complete (Auth + Onboarding + Dashboard)
**Last Updated:** January 2026
**License:** Proprietary - Semper Digital Solutions
