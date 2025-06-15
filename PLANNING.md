# Project Planning: Business Setup Navigator

This document outlines the current state of mock features and a high-level roadmap for module development.

## Authentication Flow (Initial Mock Version)

The application currently uses a mock authentication mechanism for development and testing purposes:

-   **State Management**: An `isAuthenticated` boolean state is managed in `client/app/root.tsx`. This state is provided to the application components via React Context (`AuthContext`).
-   **Toggling Authentication**: For testing, the `isAuthenticated` state can be toggled by pressing `Ctrl+A` on the keyboard. This is a temporary developer feature.
-   **Layout Switching**:
    -   If `isAuthenticated` is `false`, users accessing `/login` or `/signup` routes are presented with `AuthLayout.tsx`. This is a minimal layout designed to center authentication forms.
    -   If `isAuthenticated` is `true` (or for any routes other than `/login` and `/signup`), `AppLayout.tsx` is used. This layout includes a full navbar, a sidebar (for authenticated users), and a footer.
    -   Navigation links and UI elements within `AppLayout.tsx` (e.g., profile dropdown, module-specific sidebar links) are conditionally rendered based on the `isAuthenticated` state.
-   **Page Access**:
    -   The main landing page (`/`) will show a welcome message and links to login/signup if the user is not authenticated. If authenticated, it will redirect to `/home`.
    -   Authenticated routes (e.g., `/home`, `/profile`, `/2ndPage`, `/legal-registration`) check the `isAuthenticated` state (via `useAuth()` hook) and may redirect or show a message if accessed by a non-authenticated user.

-   **Future Plans**: The current mock authentication will be replaced with Supabase for actual user authentication, including user registration, login, session management, and potentially social providers.

## Module Roadmap (High-Level)

The following modules are planned for development for authenticated users. These modules aim to guide entrepreneurs through various stages of setting up their business.

1.  **Idea Validation & Naming**:
    *   **Route**: `/2ndPage` (Current placeholder: `client/app/routes/2ndPage.tsx`)
    *   **Description**: Tools and resources to help users validate their business ideas and choose effective names. May include market research tips, naming strategy guides, and domain/social media handle availability checks.

2.  **Legal Registration**:
    *   **Route**: `/legal-registration` (Current placeholder: `client/app/routes/legal-registration.tsx`)
    *   **Description**: Information and guidance on the legal aspects of starting a business, such as choosing a business structure (sole proprietorship, LLC, corporation), registering the business name, and obtaining necessary licenses and permits.

3.  **Branding & Online Presence**:
    *   **Route**: `/branding` (Planned)
    *   **Description**: Assistance with creating a brand identity, including logo design concepts, color palette selection, and basic website/social media setup advice.

4.  **Financial Planning**:
    *   **Route**: `/financial-planning` (Planned)
    *   **Description**: Tools for basic financial forecasting, understanding startup costs, and an introduction to funding options.

5.  **Marketing & Sales Strategy**:
    *   **Route**: `/marketing-sales` (Planned)
    *   **Description**: Introduction to basic marketing principles, identifying target audiences, and initial sales strategies.

6.  **Operational Setup**:
    *   **Route**: `/operations` (Planned)
    *   **Description**: Guidance on setting up operational aspects like choosing business software, understanding basic HR needs (if applicable), and setting up supplier relationships.

Each module will likely consist of informational content, interactive tools or checklists, and links to external resources. The AI assistant will be integrated to provide personalized guidance within these modules.
