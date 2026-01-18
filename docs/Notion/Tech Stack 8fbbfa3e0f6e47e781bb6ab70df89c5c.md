# Tech Stack

Created by: Erick Nolasco
Created time: December 25, 2025 8:13 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:08 AM
Doc Type: Technical Spec
Key Info: Full tech stack: Next.js, Postgres, Clerk, Stripe, OpenAI, database schema & APIs
Phase: Foundation
Priority: Critical

**Timeline:** 6-8 weeks | **Team:** 1 full-stack developer | **Budget:** Low-cost infrastructure

---

## Tech Stack

| Component        | Recommendation           | Why                                                        | Alternatives         |
| ---------------- | ------------------------ | ---------------------------------------------------------- | -------------------- |
| **Frontend**     | Next.js 14+ (App Router) | SSR for SEO, API routes, Vercel hosting (free), TypeScript | React + Vite         |
| **UI Library**   | shadcn/ui + Tailwind     | Copy/paste components, accessible, customizable            | Chakra UI, Mantine   |
| **Backend**      | Next.js API Routes       | Monolithic for MVP, serverless, easy to split later        | Python + FastAPI     |
| **Database**     | PostgreSQL               | ACID compliance, JSONB for flexibility                     | -                    |
| **DB Hosting**   | Supabase or Neon         | Free tier (500MB-10GB)                                     | Railway              |
| **Auth**         | Clerk                    | 10K MAUs free, OAuth built-in, great DX                    | Auth0, Supabase Auth |
| **Payments**     | Stripe                   | Industry standard, subscription management                 | -                    |
| **AI**           | OpenAI GPT-4o-mini       | $0.15/1M tokens, function calling                          | Claude               |
| **Email**        | Resend                   | 3K emails/mo free, React templates                         | SendGrid, Postmark   |
| **Analytics**    | PostHog                  | 1M events/mo free, session recording, feature flags        | Mixpanel             |
| **Hosting**      | Vercel                   | Free tier, auto-deploy from GitHub                         | Railway, Render      |
| **File Storage** | Vercel Blob              | 100GB bandwidth free                                       | Supabase Storage, S3 |

---

## Architecture

```

```

User → Next.js Frontend + API Routes

↓

Clerk Authentication

↓

Business Logic

├→ PostgreSQL (user data, plans, tasks)

├→ OpenAI API (AI personalization, chat)

├→ Stripe API (payments, subscriptions)

├→ Affiliate APIs (LegalZoom, Lendio)

├→ Resend (emails, notifications)

└→ PostHog (analytics, tracking)

```

```

---

## Database Schema

### Users

```sql
users {
  id, clerk_user_id, email, full_name
  onboarding_completed, subscription_tier
  stripe_customer_id, created_at, updated_at
}
```

### Business Plans

```sql
business_plans {
  id, user_id, business_name, business_type, state
  stage, timeline, funding_approach
  onboarding_data (JSONB)
  personalized_plan (JSONB)
  entity_type, selected_bank, selected_accounting
  confidence_score, tasks_completed, tasks_total
  created_at, updated_at
}
```

### Tasks

```sql
tasks {
  id, business_plan_id
  phase, title, description
  status, priority, estimated_minutes
  depends_on (UUID[])
  applicable_states (VARCHAR[])
  applicable_business_types (VARCHAR[])
  completed_at, skip_reason
  created_at, updated_at
}
```

### AI Conversations

```sql
ai_conversations {
  id, user_id, business_plan_id
  messages (JSONB)
  context
  created_at, updated_at
}
```

### Subscriptions

```sql
subscriptions {
  id, user_id
  stripe_subscription_id, stripe_price_id
  tier, status
  current_period_start, current_period_end
  cancel_at, canceled_at
  created_at, updated_at
}
```

### Affiliate Events

```sql
affiliate_events {
  id, user_id, partner, event_type
  context, metadata (JSONB)
  created_at
}
```

### Deadlines

```sql
deadlines {
  id, business_plan_id
  title, description, deadline_date
  category, severity, completed
  created_at
}
```

---

## Key API Endpoints

| Endpoint                  | Method  | Purpose                                              |
| ------------------------- | ------- | ---------------------------------------------------- |
| `/api/auth/*`             | Various | Clerk webhooks, session management                   |
| `/api/onboarding`         | POST    | Submit quiz, generate personalized plan              |
| `/api/dashboard`          | GET     | All dashboard data (hero task, progress, deadlines)  |
| `/api/chat`               | POST    | AI Assistant messages                                |
| `/api/tasks/:id`          | PATCH   | Update task status, unlock dependencies              |
| `/api/documents/generate` | POST    | Generate legal documents (Operating Agreement, etc.) |
| `/api/affiliates/track`   | POST    | Track affiliate clicks/conversions                   |
| `/api/payments/checkout`  | POST    | Create Stripe checkout session                       |
| `/api/payments/webhook`   | POST    | Handle Stripe subscription events                    |

---

## AI Implementation

### Confidence Score Algorithm

```tsx
weights = { ideation: 0.20, legal: 0.40, financial: 0.30, launch_prep: 0.10 }

score = 0
for each phase:
  completed = tasks with status='completed'
  total = all tasks in phase
  score += (completed/total) * weight * 100

return round(score)
```

### Cost Optimization

- Use GPT-4o-mini (~90% cheaper than GPT-4)
- Cache system prompts
- Rate limiting per user tier
- Estimated cost: $0.10-0.20/user/month

---

## Implementation Roadmap

| Week    | Focus             | Key Deliverables                                                                 |
| ------- | ----------------- | -------------------------------------------------------------------------------- |
| **1-2** | Foundation        | Next.js setup, PostgreSQL, Clerk auth, component library, PostHog                |
| **3-4** | Core Features     | Onboarding quiz, AI personalization, dashboard, Phase 1 tools, confidence score  |
| **5-6** | Legal & Financial | Entity wizard, state checklists, document generation, financial tools, deadlines |
| **7-8** | Polish & Launch   | Stripe integration, paywalls, affiliate tracking, emails, mobile polish          |

---

## Security

| Area                | Implementation                                                          |
| ------------------- | ----------------------------------------------------------------------- |
| **Authentication**  | Clerk session tokens, row-level security                                |
| **Data Protection** | Encrypt sensitive data at rest, HTTPS everywhere, sanitize inputs       |
| **API Keys**        | Environment variables, different keys per environment, rotate quarterly |
| **Compliance**      | GDPR data export/deletion, CCPA privacy policy, SOC 2 (future)          |

---

## Monitoring

| Tool                 | Purpose                  | Free Tier    |
| -------------------- | ------------------------ | ------------ |
| **Sentry**           | Error tracking           | 5K errors/mo |
| **Vercel Analytics** | Core Web Vitals          | Included     |
| **PostHog**          | Performance, API latency | 1M events/mo |

**Alerts:** Error rate >1%, API latency >2s (p95), Stripe webhook failures, OpenAI errors

---

## Cost Estimates (Monthly)

**Infrastructure:** $0

- Vercel, Supabase/Neon, Clerk, PostHog, Sentry all on free tiers

**Usage-Based:** $50-100

- OpenAI API: ~$50-100 (500 users × 100 interactions)
- Resend: $0 (3K emails included)
- Stripe: 2.9% + $0.30 per transaction

**Per User:** $0.10-0.20/month

**Break-Even:** ~50 paying users

---

## Environment Variables

```bash
DATABASE_URL=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
POSTHOG_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

```jsx
DATABASE_URL=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
POSTHOG_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```
