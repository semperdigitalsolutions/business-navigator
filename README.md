# Business Setup Navigator

An AI-powered web platform to guide aspiring entrepreneurs through starting a business.

## Tech Stack
- Frontend: Vite + React (TypeScript), React Router, Tailwind CSS, Catalyst UI
- Backend: ElysiaJS (TypeScript), Supabase
- Deployment: Netlify
- AI: xAI Grok API (or similar)

## Client Structure
- `app/ui-kit/catalyst`: Untouched Catalyst UI kit (source of truth; do not modify).
- `app/components/ui`: Custom components (Catalyst wrappers or scratch-built).
- `app/routes`: File-based routes using @react-router/dev.

## Setup
1. Clone the repo: `git clone git@github.com:semperdigitalsolutions/business-navigator.git`
2. Install dependencies:
   - Frontend: `cd client && bun install`
   - Backend: `cd server && bun install`
3. Run development servers:
   - Frontend: `cd client && bun run dev`
   - Backend: `cd server && bun run dev`

## Resources
- [Catalyst UI Docs](https://catalyst.tailwindui.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs/installation/using-vite)
- [React Router Docs](https://reactrouter.com/en/main)