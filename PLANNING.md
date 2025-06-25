# Project Plan: Business Navigator

This document outlines the project's vision, technical architecture, and a phased development roadmap. Its purpose is to serve as a central reference for all planning and development activities.

## 1. Core Objective

The Business Navigator application will guide entrepreneurs and small business owners through the complex process of setting up and managing their business. It will provide a step-by-step, module-based journey covering legal registration, financial setup, operational readiness, and more.

## 2. Phased Development Roadmap

Development will proceed in logical phases to ensure a stable and scalable build-out of features.

### Phase 1: Core User Foundation & Onboarding

**Objective:** Establish the Supabase backend, implement a robust authentication system, and create a seamless user onboarding experience.

**Key Tasks:**

1.  **Supabase Project Setup:**
    *   Initialize a new Supabase project.
    *   Configure environment variables for local and production environments.
2.  **Database Schema (Core Tables):**
    *   Implement the initial database schema focusing on user management and business profiles.
    *   See **Section 3: Database Architecture** for detailed table definitions (`users`, `user_business_profiles`).
3.  **Authentication Flow:**
    *   Replace the current mock authentication with Supabase Auth.
    *   Build login, signup, and password reset pages.
    *   Implement session management (cookies or tokens).
    *   Secure routes to ensure only authenticated users can access protected content.
4.  **Onboarding Process:**
    *   Create a multi-step onboarding form that appears after a user's first login.
    *   The form will collect essential business information to populate the `user_business_profiles` table.
    *   A modal or dedicated page will guide the user until `onboarding_completed` is `true`.
5.  **Security Implementation:**
    *   Enable Row Level Security (RLS) on all tables containing user data.
    *   Write initial RLS policies to ensure users can only access their own information.
    *   Implement basic duplicate account prevention measures (e.g., checking IP address, device info).

### Phase 2: Module & Progress Tracking

**Objective:** Build the core functionality of the navigator, allowing users to progress through business setup modules and track their completion.

**Key Tasks:**

1.  **Module & Step Definition:**
    *   For the MVP, module and step content can be hardcoded in the application.
    *   For scalability, implement `modules` and `steps` tables in the database (see **Section 3**).
2.  **User Progress Schema:**
    *   Implement `user_step_progress` and `user_step_notes` tables to track user interactions.
3.  **UI Development:**
    *   Create a main dashboard (`/home`) to display modules and overall progress.
    *   Build the UI for individual steps, including checklists, informational content, and input fields for notes.
4.  **Backend Logic:**
    *   Develop API endpoints to fetch module/step data and save user progress and notes.

### Phase 3: Subscriptions & Payments

**Objective:** Integrate a payment system to manage user subscriptions for premium features.

**Key Tasks:**

1.  **Subscription Schema:**
    *   Implement `subscriptions` and `payments` tables.
2.  **Payment Gateway Integration:**
    *   Integrate with a payment provider like Stripe.
    *   Set up webhooks to handle payment events and update subscription statuses.
3.  **UI/UX for Subscriptions:**
    *   Create a pricing page.
    *   Build a user-facing dashboard to manage subscription plans.
    *   Gate premium features based on the user's subscription tier.

### Phase 4: Resource Hub & Advanced Features

**Objective:** Provide additional value through a curated resource hub and introduce AI-powered assistance.

**Key Tasks:**

1.  **Resource Hub:**
    *   Implement the `resources` table.
    *   Build a searchable and filterable UI for users to find articles, tools, and guides.
2.  **AI Integration (Future):**
    *   Explore using AI to generate suggestions, summarize notes, or provide personalized guidance based on user data.
    *   The `content_type` field in `user_step_notes` is designed for future compatibility with AI-generated content.

---

## 3. Database Architecture (Supabase)

This section details the planned schema for the PostgreSQL database managed by Supabase.

### `users`

Stores core user authentication data, managed primarily by Supabase Auth.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (References `auth.users.id`). |
| `email` | `Text` | User's email address. |
| `onboarding_completed`| `Boolean` | `false` by default. Triggers onboarding flow. |
| `ip_address` | `Text` | For duplicate account detection. |
| `device_info` | `JSONB` | For duplicate account detection. |
| `account_creation_source`| `Text` | e.g., 'WebApp', 'MobileApp'. |

### `user_business_profiles`

Stores detailed information about a user's business.

| Column | Type | Description |
| :--- | :--- | :--- |
| `profile_id` | `UUID` | Primary Key. |
| `user_id` | `UUID` | Foreign Key to `users.id`. |
| `business_name` | `Text` | Legal name of the business. |
| `industry` | `Text` | e.g., 'Technology', 'Retail'. |
| `entity_type` | `Text` | e.g., 'Sole Proprietorship', 'LLC'. |
| `state_of_incorporation`| `Text` | State where the business is registered. |
| `is_primary` | `Boolean` | `true` for the user's main business profile. |
| `subscription_tier` | `Text` | e.g., 'Free', 'Premium'. Default 'Free'. |

### `modules`

Defines the high-level sections of the business navigator.

| Column | Type | Description |
| :--- | :--- | :--- |
| `module_id` | `UUID` | Primary Key. |
| `module_name` | `Text` | e.g., 'Legal & Registration'. |
| `description` | `Text` | Brief overview of the module. |
| `module_order` | `Integer` | Defines the display sequence. |

### `steps`

Defines the individual tasks within each module.

| Column | Type | Description |
| :--- | :--- | :--- |
| `step_id` | `UUID` | Primary Key. |
| `module_id` | `UUID` | Foreign Key to `modules.module_id`. |
| `step_name` | `Text` | e.g., 'Register for an EIN'. |
| `step_type` | `Text` | 'Informational', 'Action', 'Decision'. |
| `step_order` | `Integer` | Defines the display sequence within a module. |

### `user_step_progress`

Tracks a user's completion status for each step.

| Column | Type | Description |
| :--- | :--- | :--- |
| `progress_id` | `UUID` | Primary Key. |
| `user_id` | `UUID` | Foreign Key to `users.id`. |
| `step_id` | `UUID` | Foreign Key to `steps.step_id`. |
| `status` | `Text` | 'Not Started', 'In Progress', 'Completed'. |
| `completed_at` | `Timestamp` | When the step was marked as completed. |

### `user_step_notes`

Stores user-generated notes and data for each step.

| Column | Type | Description |
| :--- | :--- | :--- |
| `note_id` | `UUID` | Primary Key. |
| `user_id` | `UUID` | Foreign Key to `users.id`. |
| `step_id` | `UUID` | Foreign Key to `steps.step_id`. |
| `content` | `Text` | User's notes. |
| `content_type` | `Text` | 'Text', 'JSON', 'AI_Generated'. |

### `subscriptions` & `payments`

(Schema to be detailed in Phase 3)

### `resources`

(Schema to be detailed in Phase 4)

---

## 4. Security & Best Practices

-   **Row Level Security (RLS):** RLS will be enabled on all tables. Policies will strictly enforce that users can only access data linked to their `user_id`.
-   **Input Validation:** All user inputs will be validated on both the client and server to prevent injection attacks.
-   **Environment Variables:** All sensitive keys (Supabase URL, anon key, service role key) will be managed through environment variables and never hardcoded.
-   **Code Conventions:** The project will follow standard coding conventions for TypeScript, React, and SQL to maintain readability and consistency.
