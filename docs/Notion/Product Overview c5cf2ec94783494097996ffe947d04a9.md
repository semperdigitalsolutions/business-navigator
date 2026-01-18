# Product Overview

Created by: Erick Nolasco
Created time: December 30, 2025 1:26 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:52 AM
Doc Type: Overview
Key Info: Complete system map showing all features, architecture, user flows & task framework
Phase: Foundation
Priority: Reference

# Business Navigator - System Map

_Complete Visual Overview of Product, Tech, Design & Content_

_Last Updated: December 25, 2025_

> **Purpose**: This page provides a visual map of the entire Business Navigator system. Use it to understand how everything connects and quickly navigate to detailed documentation.

---

## 🎯 Product Overview

### What We're Building

**AI Business Navigator** is a mobile-first SaaS web app that guides aspiring entrepreneurs through launching their business in **3 core phases**:

**Phase 1**: Ideation & Validation (10 tasks)

**Phase 2**: Legal Foundation (12 tasks)

**Phase 3**: Financial Infrastructure (12 tasks)

**Target**: First-time entrepreneurs who feel overwhelmed by complexity

**Timeline**: 6-8 weeks to beta

**Goal**: 50-100 beta users

### Key Metrics

**From Survey (224 respondents)**:

- 65% cite "overwhelming complexity" as barrier
- 97% mobile users (48% iOS, 48% Android)
- 80% willing to pay for guidance
- 36% willing to pay $21-50/month

**Success Metrics**:

- 2-minute time to first task
- 70%+ task completion rate
- $2,825 MRR by month 6

---

## 📚 Documentation Structure

### Strategic & Product Docs

**🎯 Strategy & Planning**

[MVP Plan](https://www.notion.so/MVP-Plan-ffb2629a0e624b9196a23d4a4eff2855?pvs=21)

_Complete product strategy, features, roadmap, go-to-market_

📊 **What's inside**:

- Target personas
- Feature prioritization (P0/P1)
- 6-8 week development roadmap
- Revenue projections
- Launch strategy

**📋 Feature Specifications**

[Feature & Content Specs](https://www.notion.so/Feature-Content-Specs-aa260f3eeeb14b879242c49bdb0e4529?pvs=21)

_All 34 MVP tasks with acceptance criteria_

📋 **What's inside**:

- Complete task inventory
- Phase 1: Ideation (10 tasks)
- Phase 2: Legal (12 tasks)
- Phase 3: Financial (12 tasks)

### Technical & Architecture Docs

**⚙️ Technical Architecture**

[Tech Stack](https://www.notion.so/Tech-Stack-8fbbfa3e0f6e47e781bb6ab70df89c5c?pvs=21)

_Complete tech stack, database schema, API specs_

🔧 **What's inside**:

- Tech stack (Next.js 14, PostgreSQL, Clerk, Stripe, OpenAI)
- Database schema (9 tables)
- API endpoint specifications
- Implementation priorities

**📊 Data & Progress Systems**

[Progress & Export System](https://www.notion.so/Progress-Export-System-ba1e4a4c20de499a93c6a5db7582967f?pvs=21)

_How we save, organize, and export everything_

💾 **What's inside**:

- Auto-save architecture
- Real-time sync strategy
- PDF export generation
- Version history & rollback

### Design & UX Docs

**🎨 UI/UX Specifications**

[Export Features](https://www.notion.so/Export-Features-7ceefd28cfa54bc6bb9115783e9167bb?pvs=21)

_How features surface in the interface_

🖼️ **What's inside**:

- 4-tab navigation structure
- Screen-by-screen layouts
- Progressive disclosure pattern
- Mobile-first design specs
- Component library

**🎨 Design System**

[Design Timeline](https://www.notion.so/Design-Timeline-940d43925da34557aa7921019f4d8814?pvs=21)

_Visual design, components, patterns_

🎨 **What's inside**:

- Design principles
- Visual system (colors, typography)
- Component specifications
- Implementation timeline

### User Flows & Interactions

**🚪 Authentication & Onboarding**

[Auth & Onboarding](https://www.notion.so/Auth-Onboarding-1ce83ed1a9b64464987949a2ea47b4c6?pvs=21)

_Signup, login, email verification, 7-step questionnaire_

🔐 **What's inside**:

- Login/signup screens with OAuth
- Email verification flow
- 7-step onboarding wizard
- Personalization logic
- Error states & validation

**🎯 Dashboard & Core Experience**

[Dashboard Design](https://www.notion.so/Dashboard-Design-787eb5e7df1d479b95849968d4011d3b?pvs=21)

_Hero task, confidence score, progress tracking_

📱 **What's inside**:

- Dashboard layout
- Hero task selection logic
- Confidence score algorithm
- Progress visualization

**📝 User Flows**

[User Flows](https://www.notion.so/User-Flows-f55a51c35f31476fb483da1281a14da3?pvs=21)

_How users navigate through the app_

🔄 **What's inside**:

- First-time user journey
- Task completion flows
- Navigation patterns
- State transitions

**💬 AI Chat Integration**

[AI Chat System](https://www.notion.so/AI-Chat-System-0f1e741342b944f5930175a4f88d1924?pvs=21)

_How AI assistant works with tasks and context_

🤖 **What's inside**:

- Context payload structure
- 5 integration patterns
- Chat + task coordination
- Prompt engineering

### Content & Copy

**✍️ Content & Copy Guide**

_All UI copy, AI prompts, email templates_

📝 **What's inside**:

- UI microcopy for all screens
- AI chat prompts & responses
- Email templates
- Help documentation
- Marketing copy

**🎯 Task Framework**

[Core Framework](https://www.notion.so/Core-Framework-2c5d9a9d5ece802da0b2c12209b55034?pvs=21)

_Structure for all 34 tasks_

📐 **What's inside**:

- Task structure template
- Content patterns
- Validation logic
- AI feedback templates

---

## 🔄 User Journey Map

### First-Time User Flow (2 minutes)

```
1. LANDING PAGE
   ↓
   [Get Started] CTA
   ↓

2. AUTHENTICATION (30 sec)
   • Email/password signup OR
   • Google OAuth (one-click)
   ↓
   [Email verification if needed]
   ↓

3. ONBOARDING QUESTIONNAIRE (60 sec)
   Step 1: Business Type (Tech/SaaS, Service, E-commerce, Local)
   Step 2: Current Stage (Idea, Planning, Started)
   Step 3: Location (US State)
   Step 4: Timeline (ASAP, 3-6mo, 6-12mo, Exploring)
   Step 5: Funding (Bootstrapped, Raising, Loan, Multiple)
   Step 6: Experience (First time, Experienced)
   Step 7: Goals (What success looks like)
   ↓

4. DASHBOARD WITH PERSONALIZED HERO TASK
   • Confidence Score: 0%
   • Hero Task: "Define Your Problem"
   • 34 tasks organized into 3 phases
   • AI chat available
   ↓

5. TASK COMPLETION CYCLE
   [View task] → [Complete form/wizard] → [Auto-save] → [Mark complete]
   ↓
   • Confidence score increases
   • Next task unlocks
   • Progress saved to "living business plan"
   ↓

6. MILESTONE CELEBRATION
   🎉 Phase Complete!
   • Export progress report option
   • Continue to next phase
   ↓

7. BUSINESS PLAN COMPLETE
   • Export professional PDF
   • Share with partners/investors
   • Launch checklist complete
```

---

## 🏗️ System Architecture

### High-Level Components

**Frontend (User-Facing)**

**Tech**: Next.js 14 (App Router), React, TypeScript, Tailwind + shadcn/ui

**Key Components**:

- 🏠 Dashboard (Hero task, progress, deadlines)
- 📋 Tasks (Sequential, phase-organized)
- 💬 Chat (AI assistant with context)
- ⚙️ More (Plan view, export, history, docs)

**State Management**: React hooks + Context

**Routing**: File-based (Next.js App Router)

**Styling**: Tailwind utility classes

**Backend (API Layer)**

**Tech**: Next.js API Routes, PostgreSQL, Prisma ORM

**Key Services**:

- 🔐 Auth ([Clerk.dev](http://Clerk.dev))
- 💳 Payments (Stripe)
- 🤖 AI (OpenAI GPT-4o)
- 📧 Email (Resend)
- 📊 Analytics (PostHog)
- 🗄️ Storage (Vercel Blob / AWS S3)

**Database**: PostgreSQL with JSONB

**Hosting**: Vercel

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE                      │
│  Dashboard | Tasks | Chat | More                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND LOGIC                        │
│  • React Components                                     │
│  • State Management (hooks)                             │
│  • Auto-save (debounced)                                │
│  • Optimistic UI updates                                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                            │
│  Next.js API Routes                                     │
│  • /api/auth/* (Clerk)                                  │
│  • /api/tasks/*                                         │
│  • /api/chat/*                                          │
│  • /api/export/*                                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                              │
│  PostgreSQL (9 tables)                                  │
│  • users                                                │
│  • business_plans                                       │
│  • user_tasks (with JSONB completion_data)              │
│  • user_decisions                                       │
│  • documents                                            │
│  • user_deadlines                                       │
│  • chat_conversations & chat_messages                   │
│  • export_history                                       │
│  • activity_log                                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                EXTERNAL SERVICES                        │
│  • OpenAI API (AI chat responses)                       │
│  • Stripe API (subscription billing)                    │
│  • Resend API (transactional emails)                    │
│  • Vercel Blob (file storage)                           │
│  • PostHog (analytics events)                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 App Structure

### Mobile Bottom Navigation (4 Tabs)

**🏠 Tab 1: Dashboard (Home)**

_Default view when app opens_

**Key Elements**:

- Launch Confidence Score (0-100%)
- Hero Task card (next priority)
- Progress by phase (3 progress bars)
- Quick stats (business name, entity, model, funding)
- Upcoming deadlines (next 3)
- Recent activity feed

**Documentation Features** (subtle):

- "View full plan" link → My Business Plan
- Progress % pulls from database
- No export buttons (not intrusive)

**📋 Tab 2: Tasks**

_Where 80% of work happens_

**Key Elements**:

- Phase 1: Ideation (10 tasks)
- Phase 2: Legal (12 tasks)
- Phase 3: Financial (12 tasks)
- Sequential unlocking
- Task detail screens with forms/wizards

**Auto-save indicator** (only UI element):

- ☁️ Saved (gray)
- ☁️ Saving... (blue, animated)
- ⚠️ Not saved (orange)

**💬 Tab 3: Chat**

_AI assistant with full context_

**Key Elements**:

- Full-screen chat interface
- Context-aware responses
- Action buttons (navigate to tasks, view plan)
- Can update data with confirmation

**Context includes**:

- All onboarding data
- Completed tasks
- Key decisions
- Current screen/task
- Upcoming deadlines

**⚙️ Tab 4: More**

_Documentation features live here_

**Key Elements**:

- 📊 My Business Plan (living document)
- 📥 Export & Share
- 🕐 Version History
- 📄 Documents (file library)
- 🔔 Reminders
- ⚙️ Settings
- 💳 Billing
- ❓ Help

**Progressive disclosure**: Hidden during task work, accessible when needed

---

## 💾 Database Schema

### Core Tables (9 total)

**1. `users`**

- Stores: email, name, avatar, plan tier, auth provider
- Auth: [Clerk.dev](http://Clerk.dev) handles this

**2. `business_plans`**

- Stores: business context from onboarding
- Fields: business_name, type, industry, stage, state, timeline, funding_approach
- Progress: confidence_score, phase_1/2/3_progress, current_hero_task_id

**3. `user_tasks`**

- Stores: task completion status & data
- Key field: `completion_data` (JSONB) - all form answers
- Example: `{"problem": "...", "who": "...", "current_solution": "..."}`

**4. `user_decisions`**

- Stores: key choices extracted from tasks
- Examples: entity_type, business_name, target_customer, business_model
- Includes: reasoning, alternatives_considered, version tracking

**5. `documents`**

- Stores: uploaded & AI-generated files
- Types: registration, license, contract, generated_agreement
- Includes: storage_url, tags, is_sensitive flag

**6. `user_deadlines`**

- Stores: reminders & recurring dates
- Examples: quarterly taxes, annual reports, license renewals
- Includes: recurrence rules, reminder flags

**7. `chat_conversations` & `chat_messages`**

- Stores: all AI chat history
- Includes: context used, model, tokens, actions taken

**8. `export_history`**

- Stores: all generated exports (PDFs, Excel, etc.)
- Includes: snapshot of data at export time

**9. `activity_log`**

- Stores: complete audit trail
- Tracks: task completions, decision changes, document uploads

---

## 🎨 Design System

### Visual Language

**Colors**

**Primary**:

- Blue: #3B82F6
- Dark Blue: #2563EB

**Status**:

- Success Green: #10B981
- Warning Orange: #F59E0B
- Error Red: #EF4444

**Neutral**:

- Gray 900 (text): #111827
- Gray 700: #374151
- Gray 500: #6B7280
- Gray 200 (borders): #E5E7EB

**Semantic**:

- 📊 Strategic: Blue
- ⚖️ Legal: Purple
- 💰 Financial: Green
- 🚀 Launch: Orange

**Typography**

**Headings**:

- H1: 28px Bold
- H2: 20px Semibold
- H3: 16px Semibold

**Body**:

- Regular: 16px
- Small: 14px
- Caption: 12px

**Buttons**:

- Primary: 16px Semibold
- Secondary: 14px Medium

**Font**: System fonts

- iOS: SF Pro
- Android: Roboto
- Web: -apple-system, BlinkMacSystemFont, "Segoe UI"

### Component Patterns

**Cards**:

- Border radius: 12px
- Padding: 16px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Min tap target: 44px height

**Buttons**:

- Primary: Blue gradient, white text
- Secondary: Gray border, dark text
- Disabled: Gray, 50% opacity

**Progress bars**:

- Height: 8px
- Border radius: 4px
- Smooth fill transition

**Badges**:

- ✅ Complete: Green
- ⚠️ Incomplete: Orange
- 🔒 Locked: Gray

---

## 🤖 AI Integration

### How AI Works Throughout the App

**During Tasks**

**Pattern**: Structured tasks (primary) + AI help (secondary)

**Usage**:

- Validate user input ("Is my problem clear?")
- Suggest improvements ("Consider adding...")
- Explain concepts ("What's an LLC?")
- Answer questions (contextual help button)

**Model**: GPT-4o (faster, cheaper than GPT-4)

**Context sent**:

- Task ID & description
- User's current answer
- Business type & state
- Previous decisions

**In Chat Tab**

**Pattern**: Full context awareness

**Usage patterns** (from design):

1. Contextual help (40%): "What do I need to register in CA?"
2. Alternative completion (25%): User completes task via chat
3. Proactive suggestions (15%): "Ready for your EIN?"
4. Cross-task insights (10%): "Your budget affects your entity choice"
5. Task recommendations (10%): "Try this task next"

**Full context payload includes**:

- All onboarding data
- Completed tasks + decisions
- Current screen/task
- Upcoming deadlines
- Recent chat history

### AI Response Format

**Standard response structure**:

```
[Answer to user's question]

[Optional: Relevant insight based on their context]

[Action buttons]
- [View relevant task →]
- [Update business plan →]
```

**Action buttons** trigger:

- Navigation to tasks
- Updates to data (with confirmation)
- Document generation
- Exports

---

## 💰 Business Model

### Pricing Tiers

**Free**

- 10 AI messages/day
- Basic task access (Phase 1 only)
- View-only exports

**Starter - $10/month**

- 50 AI messages/day
- Full task access (all 3 phases)
- Basic exports (PDF)
- Legal checklists
- Funding tools

**Growth - $19/month**

- Unlimited AI messages
- Advanced exports (Excel, templates)
- State-specific guidance (top 10 states)
- Document generation
- Priority support

**Pro - $29/month**

- All Growth features
- All 50 states supported
- AI document generation
- White-label exports
- 1-on-1 onboarding call

### Revenue Projections (Conservative)

**Month 1-3** (Beta): 50-100 free users

**Month 4**: Launch paid, 50 conversions → **$500 MRR**

**Month 5**: 100 paid users → **$1,400 MRR**

**Month 6**: 150 paid users → **$2,825 MRR**

**Additional revenue**: Affiliate partnerships (accounting software, banks, legal services) → **$750/month**

**Total Month 6**: **$3,575 MRR**

---

## 📊 Success Metrics

### Key Performance Indicators

**User Acquisition**:

- ✅ 50-100 beta users (month 1-3)
- ✅ 150 paid users by month 6

**Engagement**:

- ✅ 70%+ task completion rate
- ✅ 2-minute time to first task
- ✅ 3+ sessions per week
- ✅ 80% weekly active rate

**Retention**:

- ✅ 85% month 1 retention
- ✅ 70% month 3 retention
- ✅ <10% churn rate

**Revenue**:

- ✅ 30% free-to-paid conversion
- ✅ $2,825 MRR by month 6
- ✅ $18.83 average revenue per user
- ✅ <5% churn rate

**Quality**:

- ✅ 4.5+ star rating
- ✅ NPS score >50
- ✅ 50%+ recommend to friends

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Week 1: Setup & Auth**

- Project setup (Next.js 14, TypeScript, Tailwind)
- Database schema (PostgreSQL + Prisma)
- Authentication ([Clerk.dev](http://Clerk.dev) integration)
- Onboarding questionnaire (7 steps)

**Week 2: Core UI & Navigation**

- Bottom navigation (4 tabs)
- Dashboard layout
- Task list view
- Basic styling (mobile-first)

### Phase 2: Task System (Weeks 3-4)

**Week 3: Task Infrastructure**

- Task detail screens
- Form components
- Auto-save system
- Progress tracking logic
- Confidence score calculation

**Week 4: Task Content**

- Phase 1 tasks (10 tasks)
- Phase 2 tasks (12 tasks)
- Phase 3 tasks (12 tasks)
- Validation & error handling

### Phase 3: AI & Intelligence (Weeks 5-6)

**Week 5: AI Chat**

- Chat interface
- Context system
- OpenAI integration
- Action buttons

**Week 6: AI Task Help**

- Task validation with AI
- Contextual help
- Proactive suggestions

### Phase 4: Polish & Launch (Weeks 7-8)

**Week 7: Export & Documentation**

- My Business Plan view
- PDF export generation
- Document library
- Version history

**Week 8: Beta Launch**

- Payment integration (Stripe)
- Analytics (PostHog)
- Email notifications (Resend)
- Beta user onboarding
- Bug fixes & polish

---

## 📝 Next Steps

### Immediate Priorities

**1. Finalize Remaining Documentation**

- [ ] Subscription & payment flows
- [ ] Email & notification system
- [ ] Error handling guide

**2. Design Refinement**

- [ ] Complete Figma designs (dashboard, all task screens)
- [ ] Create mobile prototypes
- [ ] User testing with 5-10 people

**3. Development Preparation**

- [ ] Set up development environment
- [ ] Initialize Next.js project
- [ ] Set up PostgreSQL database
- [ ] Configure Clerk, Stripe, OpenAI accounts

**4. Content Creation**

- [ ] Write all task content (34 tasks)
- [ ] Write AI prompts
- [ ] Write email templates
- [ ] Create help documentation

### Questions to Answer

**Product**:

- Final brand name? (Business Navigator or alternative?)
- Launch pricing? (stick with $10/$19/$29 or adjust?)
- Beta invite strategy? (waitlist, referrals, direct outreach?)

**Technical**:

- Use [Clerk.dev](http://Clerk.dev) for auth or alternatives?
- Vercel hosting or alternatives?
- File storage: Vercel Blob vs AWS S3?

**Design**:

- Design system: Build custom or use shadcn/ui?
- Icon library: Lucide, Heroicons, or custom?
- Animation library: Framer Motion or CSS only?

---

## 🔗 Quick Links

### All Documentation

**Strategy & Product**

- [MVP Plan](https://www.notion.so/MVP-Plan-ffb2629a0e624b9196a23d4a4eff2855?pvs=21)
- [Feature & Content Specs](https://www.notion.so/Feature-Content-Specs-aa260f3eeeb14b879242c49bdb0e4529?pvs=21)
- [Design Timeline](https://www.notion.so/Design-Timeline-940d43925da34557aa7921019f4d8814?pvs=21)

**Technical**

- [Tech Stack](https://www.notion.so/Tech-Stack-8fbbfa3e0f6e47e781bb6ab70df89c5c?pvs=21)
- [Progress & Export System](https://www.notion.so/Progress-Export-System-ba1e4a4c20de499a93c6a5db7582967f?pvs=21)

**Design & UX**

- [Export Features](https://www.notion.so/Export-Features-7ceefd28cfa54bc6bb9115783e9167bb?pvs=21)
- [Dashboard Design](https://www.notion.so/Dashboard-Design-787eb5e7df1d479b95849968d4011d3b?pvs=21)
- [Auth & Onboarding](https://www.notion.so/Auth-Onboarding-1ce83ed1a9b64464987949a2ea47b4c6?pvs=21)

**User Flows**

- [User Flows](https://www.notion.so/User-Flows-f55a51c35f31476fb483da1281a14da3?pvs=21)
- [AI Chat System](https://www.notion.so/AI-Chat-System-0f1e741342b944f5930175a4f88d1924?pvs=21)
- [Core Framework](https://www.notion.so/Core-Framework-2c5d9a9d5ece802da0b2c12209b55034?pvs=21)

### Hub Pages

- [Business Navigator](https://www.notion.so/Business-Navigator-2d6d9a9d5ece80789a48d280aa6d6b65?pvs=21)

---

**🗺️ System Map Complete** ✅

Use this page as your starting point to understand and navigate the entire Business Navigator system. Each section links to detailed documentation.
