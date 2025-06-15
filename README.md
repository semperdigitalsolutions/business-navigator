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
- `app/layouts`: Custom layout components (`AppLayout.tsx`, `AuthLayout.tsx`).
- `app/routes`: File-based routes using @react-router/dev, defining page components.
- `app/welcome`: Components specific to the landing page.
- `app/root.tsx`: Main application entry point, handles dynamic layout switching and authentication context.

## Layout Strategy

The application employs a dynamic layout strategy based on user authentication status, managed in `client/app/root.tsx`:

-   **`AuthLayout.tsx`**: (`client/app/layouts/AuthLayout.tsx`)
    -   Used for non-authenticated routes like `/login` and `/signup`.
    -   Provides a minimal structure with a simple header (app logo placeholder) and a centered main content area for forms.
-   **`AppLayout.tsx`**: (`client/app/layouts/AppLayout.tsx`)
    -   Used for authenticated users.
    -   Features a comprehensive navigation structure:
        -   **Navbar**:
            -   Non-Authenticated (Fallback, if somehow reached): Shows links to "Home" (`/`), "Login" (`/login`), "Sign Up" (`/signup`).
            -   Authenticated: Shows links to "Home" (`/home`), "2nd Page" (`/2ndPage`), "Profile" (`/profile`), and "Logout" (`/logout`).
            -   Authenticated users also see a team dropdown, search icon, inbox icon, and user profile dropdown in the navbar.
        -   **Sidebar**:
            -   Only rendered for authenticated users.
            -   Includes navigation items like "2nd Page" (`/2ndPage`) and "Legal Registration" (`/legal-registration`).
            -   Features a team dropdown in the sidebar header.
        -   **Footer**:
            -   Always visible within `AppLayout`.
            -   Contains links to "Privacy Policy" (`/privacy`) and "Terms of Service" (`/tos`).
-   **Conditional Rendering**: The visibility of navbar and sidebar elements within `AppLayout.tsx` is conditional based on a mock `isAuthenticated` state managed in `root.tsx` via `AuthContext`.

## Routing

Routing is managed by `@react-router/dev`, with route definitions centralized in `client/app/routes.ts` and component files located primarily in `client/app/routes/` and `client/app/welcome/`.

Key routes include:

-   **Public Routes**:
    -   `/` (`client/app/welcome/welcome.tsx`):
        -   Serves as the main landing page.
        -   For non-authenticated users, it displays a welcome message and links to login/signup.
        -   For authenticated users, it automatically redirects to `/home`.
    -   `/login` (`client/app/routes/login.tsx`): Public login page, uses `AuthLayout`.
    -   `/signup` (`client/app/routes/signup.tsx`): Public signup page, uses `AuthLayout`.
    -   `/privacy` (`client/app/routes/privacy.tsx`): Publicly accessible Privacy Policy page, linked from `AppLayout` footer.
    -   `/tos` (`client/app/routes/tos.tsx`): Publicly accessible Terms of Service page, linked from `AppLayout` footer.

-   **Authenticated Routes** (primarily use `AppLayout`):
    -   `/home` (`client/app/routes/home.tsx`): User dashboard after login.
    -   `/2ndPage` (`client/app/routes/2ndPage.tsx`): Placeholder for "Idea Validation & Naming" module.
    -   `/profile` (`client/app/routes/profile.tsx`): Placeholder for user profile page.
    -   `/legal-registration` (`client/app/routes/legal-registration.tsx`): Placeholder for "Legal Registration" module.
    -   Other authenticated module routes will be added as features are developed (e.g., `/branding`).

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