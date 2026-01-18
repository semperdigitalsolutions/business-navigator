# Feature & Content Specs

Created by: Erick Nolasco
Created time: December 25, 2025 8:13 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:52 AM
Doc Type: Feature Spec
Key Info: User stories, acceptance criteria, edge cases + complete task content matrix
Phase: Foundation
Priority: Critical

_AI Business Navigator MVP_

_Last Updated: December 25, 2025_

## Overview

This document breaks down each major feature into detailed user stories, acceptance criteria, and edge cases. Use this as the single source of truth for what needs to be built.

**Format:**

- **User Story:** As a [persona], I want [goal], so that [reason]
- **Acceptance Criteria:** Specific, testable requirements
- **Technical Notes:** Implementation hints for developer
- **Design Notes:** UI/UX considerations for designer

---

## Epic 1: Authentication & Onboarding

### Feature 1.1: User Registration

**User Story:**

As a visitor, I want to create an account quickly, so that I can start planning my business.

**Acceptance Criteria:**

- [ ] User can sign up with email + password
- [ ] User can sign up with Google OAuth
- [ ] Email verification sent (but not required to continue)
- [ ] User is redirected to onboarding quiz after signup
- [ ] Password must be 8+ characters
- [ ] Error messages for: duplicate email, weak password, OAuth failures

**Technical Notes:**

- Use Clerk for authentication
- Store user record in `users` table with `clerk_user_id`
- Create empty `business_plans` record on signup

**Design Notes:**

- Signup form: email, password, confirm password fields
- "Or continue with Google" button with logo
- Link to "Already have an account? Sign in"

**Edge Cases:**

- User closes tab mid-signup → show "Continue where you left off" on return
- OAuth fails → show error with retry option
- Email already exists → suggest password reset

---

### Feature 1.2: Onboarding Quiz

**User Story:**

As a new user, I want to answer questions about my business, so that I get personalized guidance.

**Acceptance Criteria:**

- [ ] 5-step wizard flow with progress indicator
- [ ] Step 1: Business type (Tech/SaaS or Service)
- [ ] Step 2: Stage (idea, planning, filing, launched)
- [ ] Step 3: State (dropdown of all 50 US states)
- [ ] Step 4: Timeline (side hustle or full-time)
- [ ] Step 5: Funding approach (bootstrap, investment, grants, unsure)
- [ ] Can go back to previous steps
- [ ] Can save and continue later (auto-save on each step)
- [ ] Loading screen after submission ("Creating your plan...")
- [ ] Redirect to dashboard after 3-5 seconds

**Technical Notes:**

- POST to `/api/onboarding` with all responses
- Trigger AI personalization in background
- Generate initial tasks based on responses
- Calculate initial confidence score (will be low, ~5%)

**Design Notes:**

- Large, card-based answer options for easy clicking
- Progress bar: "Step 2 of 5"
- Back button always visible (except step 1)
- Next button disabled until answer selected
- Loading screen with animated progress messages

**Edge Cases:**

- User refreshes during onboarding → restore progress from last saved step
- User abandons onboarding → send email reminder after 24 hours
- AI personalization fails → use default template, log error, retry later

---

## Epic 2: Dashboard & Progress Tracking

### Feature 2.1: Main Dashboard

**User Story:**

As a user, I want to see my progress and next steps at a glance, so that I know what to do next.

**Acceptance Criteria:**

- [ ] Shows Launch Confidence Score (0-100%) prominently
- [ ] Shows next priority task with "Start now" button
- [ ] Shows progress bars for each phase (Ideation, Legal, Financial)
- [ ] Shows upcoming deadlines (sorted by date)
- [ ] Shows key decisions made (entity type, funding, etc.)
- [ ] Updates in real-time when tasks are completed
- [ ] Mobile: stacked layout, desktop: 3-column layout

**Technical Notes:**

- GET `/api/dashboard` returns all necessary data
- Use React Query for caching and real-time updates
- Confidence score calculated server-side
- Next task determined by: priority, dependencies, phase order

**Design Notes:**

- Hero card for next task (largest element on page)
- Confidence score as circular progress with percentage in center
- Category progress bars with colors (green = completed, blue = in progress)
- Deadlines with color-coded severity (red = urgent, orange = soon, gray = later)

**Edge Cases:**

- All tasks completed → show celebration + "What's next?" options
- No upcoming deadlines → show "You're all caught up!"
- First visit after onboarding → show "Welcome! Here's how to use this dashboard" tooltip

---

### Feature 2.2: Launch Confidence Score

**User Story:**

As a user, I want to know how ready I am to launch, so that I can feel confident in my progress.

**Acceptance Criteria:**

- [ ] Score ranges from 0-100%
- [ ] Breaks down by category (Ideation, Legal, Financial, Launch Prep)
- [ ] Shows what's needed to reach next milestone (e.g., "2 tasks to reach 60%")
- [ ] Updates immediately when tasks are completed
- [ ] Animates when score increases
- [ ] Shows celebration at 25%, 50%, 75%, 100%

**Algorithm:**

```
Ideation: 20% weight
Legal: 40% weight
Financial: 30% weight
Launch Prep: 10% weight

Score = Sum of (completed tasks / total tasks) * weight for each category
```

**Technical Notes:**

- Calculate on every task status change
- Store in `business_plans.confidence_score`
- Return in `/api/dashboard` and `/api/tasks/:id` responses

**Design Notes:**

- Circular progress ring (matches survey mockup)
- Large percentage number in center
- Breakdown shown below as smaller progress bars
- Confetti animation on milestone achievements

**Edge Cases:**

- Score decreases (user marks task as incomplete) → allow it, no negative feedback
- Score stuck at same % for long time → show encouragement message

---

## Epic 3: Phase 1 - Ideation & Validation

### Feature 3.1: Business Concept Builder

**User Story:**

As a user with a business idea, I want to clearly define my problem and solution, so that I can validate my concept.

**Acceptance Criteria:**

- [ ] Form with 4 sections: Problem, Solution, Target Market, Value Proposition
- [ ] Each section has guiding questions
- [ ] AI suggestions based on business type (Tech/SaaS or Service)
- [ ] Save draft functionality (auto-save every 30 seconds)
- [ ] Can mark as "Complete" when ready
- [ ] Marking complete unlocks next task

**Technical Notes:**

- Store in `business_plans.onboarding_data.concept` (JSONB)
- POST to `/api/tasks/:taskId/complete` when marked complete
- AI suggestions via OpenAI API (optional, nice-to-have)

**Design Notes:**

- Textarea fields with placeholder examples
- Character count (encourage depth: min 100 characters)
- "Need help?" button opens AI Assistant
- Progress indicator ("1 of 4 sections complete")

**Edge Cases:**

- User tries to skip → warn "This helps create your personalized plan"
- User writes very little → gentle nudge "Add more detail for better results"

---

### Feature 3.2: Market Validation Checklist

**User Story:**

As a user, I want to validate demand for my business, so that I don't waste time on a non-viable idea.

**Acceptance Criteria:**

- [ ] Checklist of validation tasks:
  - [ ] Research 3 competitors
  - [ ] Interview 5 potential customers
  - [ ] Calculate addressable market size
  - [ ] Test pricing with 10 people
  - [ ] Get 10 email signups or letters of intent
- [ ] Each item has "Learn how" guide
- [ ] Can check off items as completed
- [ ] Shows progress ("2 of 5 completed")
- [ ] Marking all complete triggers Go/No-Go assessment

**Technical Notes:**

- Store checklist state in `tasks` table as separate sub-tasks
- Or use single task with JSONB `metadata` for checklist items

**Design Notes:**

- Standard checkbox list
- "Learn how" expands inline guide (or opens modal)
- Green checkmarks for completed items

**Edge Cases:**

- User completes all but still wants to quit → show "No-Go" path (offer resources, don't delete account)
- User completes Go/No-Go and chooses "Go" → celebration, unlock Phase 2

---

## Epic 4: Phase 2 - Legal Foundation

### Feature 4.1: Entity Selection Wizard

**User Story:**

As a user, I want to choose the right legal structure, so that I'm protected and compliant.

**Acceptance Criteria:**

- [ ] Step 1: Learn about options (LLC, C-Corp, S-Corp, Sole Prop)
- [ ] Step 2: Comparison table (Taxes, Liability, Complexity, Cost)
- [ ] Step 3: AI recommendation based on business type, state, funding
- [ ] Step 4: User selects entity type (can override AI)
- [ ] Step 5: Confirmation with next steps
- [ ] Shows state-specific considerations (e.g., CA annual fees)
- [ ] Link to "Consult an expert" (affiliate: Rocket Lawyer)

**Technical Notes:**

- AI recommendation via OpenAI with structured output (function calling)
- Store selection in `business_plans.entity_type`
- POST to `/api/business-plan/update`

**Design Notes:**

- Multi-step wizard (back/next navigation)
- Comparison table: rows = entity types, columns = factors
- AI recommendation as highlighted card with reasoning
- Override option clearly visible (don't hide it)

**Edge Cases:**

- User unsure → offer "Schedule consultation" (affiliate)
- User changes entity type later → warn "This may affect other decisions"
- State = CA → show "C-Corp has $800 annual fee" warning

---

### Feature 4.2: State-Specific Compliance Checklists

**User Story:**

As a user in a specific state, I want to know all legal requirements, so that I don't miss anything important.

**Acceptance Criteria:**

- [ ] Checklist generated based on state + entity type + business type
- [ ] Top 10 states: detailed requirements (CA, TX, FL, NY, PA, IL, OH, GA, NC, MI)
- [ ] Other states: generic requirements + "Consult local resources"
- [ ] Each item has: title, description, deadline (if applicable), resources
- [ ] Can mark items as completed
- [ ] Proactive alerts for time-sensitive items (e.g., CA Statement of Info)

**Technical Notes:**

- Checklist data stored in JSON config file or database table
- Use Notion database or Airtable for easy non-code updates
- Deadline alerts via scheduled job (check daily, send emails)

**Design Notes:**

- Grouped by category (Registration, Taxes, Permits, Ongoing)
- Red/orange/green indicators for urgency
- Expandable items for more details
- "Learn more" links to official state resources

**Edge Cases:**

- User moves to different state → regenerate checklist, warn of changes
- User in non-top-10 state → show generic + recommend LegalZoom (affiliate)
- Regulation changes → quarterly review process, update checklists

---

### Feature 4.3: Document Generation (Operating Agreement)

**User Story:**

As a user forming an LLC, I want to generate an Operating Agreement, so that I have the necessary legal documents.

**Acceptance Criteria:**

- [ ] Input form for required info (member names, capital contributions, ownership %)
- [ ] AI generates document based on entity type + state + inputs
- [ ] Preview document before finalizing
- [ ] Download as PDF or Word
- [ ] Disclaimer: "AI-generated, have a lawyer review"
- [ ] Link to legal review service (affiliate: Rocket Lawyer)

**Technical Notes:**

- Use OpenAI API with long context (GPT-4o)
- Template in markdown, convert to PDF via library (e.g., jsPDF, Puppeteer)
- Store in user's account for later access

**Design Notes:**

- Form with clear labels and examples
- Live preview on right side (desktop) or below (mobile)
- "Download" button prominent
- Disclaimer in yellow callout box

**Edge Cases:**

- Multi-member LLC → dynamic form (add/remove members)
- State requires notarization → note in document + link to notary services
- User edits generated document → allow editing, re-show disclaimer

---

## Epic 5: Phase 3 - Financial Infrastructure

### Feature 5.1: Banking Setup Checklist

**User Story:**

As a user, I want to open a business bank account, so that I can separate personal and business finances.

**Acceptance Criteria:**

- [ ] Checklist of what's needed (EIN, Operating Agreement, ID, etc.)
- [ ] Bank comparison tool (fees, features, business types)
- [ ] Links to open accounts online
- [ ] Recommendations based on business type (e.g., Mercury for tech startups)
- [ ] Mark as complete when account opened

**Technical Notes:**

- Static bank comparison data (can hard-code initially)
- Affiliate links for banks (if available)

**Design Notes:**

- Checklist with checkboxes
- Comparison table (like entity selection)
- "Popular for Tech/SaaS" badge on recommended banks

**Edge Cases:**

- User has existing account → allow "Skip this step"
- Multiple bank accounts → form to add multiple

---

### Feature 5.2: Simple Financial Projections Tool

**User Story:**

As a user, I want to create basic financial projections, so that I know if my business is viable.

**Acceptance Criteria:**

- [ ] Input: Revenue assumptions (pricing, customers)
- [ ] Input: Cost assumptions (fixed costs, variable costs)
- [ ] Calculate: Monthly profit/loss for 12 months
- [ ] Calculate: Break-even point
- [ ] Visual: Chart showing revenue, costs, profit over time
- [ ] Export as CSV or PDF

**Technical Notes:**

- Simple calculations (no complex modeling)
- Use Chart.js or Recharts for visualization
- Store assumptions and results in `business_[plans.financial](http://plans.financial)_projections` (JSONB)

**Design Notes:**

- Form on left, chart on right (desktop)
- Inputs with $ formatting
- Chart updates in real-time as inputs change
- Color-code: revenue (green), costs (red), profit (blue)

**Edge Cases:**

- Costs > Revenue → show in red, message "You need to increase revenue or reduce costs"
- Negative break-even → "Your costs are too high to break even"

---

### Feature 5.3: Funding Strategy Builder

**User Story:**

As a user, I want to explore funding options, so that I can finance my business.

**Acceptance Criteria:**

- [ ] Quiz to determine best funding approach (bootstrap, loans, grants, investors)
- [ ] Based on: business type, capital needed, timeline, willingness to give up equity
- [ ] AI generates personalized recommendations
- [ ] For each option: Pros, cons, next steps, resources
- [ ] Affiliate links to funding platforms (Lendio for loans, Kickstarter for crowdfunding)

**Technical Notes:**

- Decision tree logic (if-then rules)
- Optional AI enhancement for personalization
- Store selected strategy in `business_plans.funding_approach`

**Design Notes:**

- Wizard or questionnaire format
- Results as cards (one card per funding option)
- "Learn more" expands details
- CTA buttons to external platforms (tracked as affiliates)

**Edge Cases:**

- User unsure of capital needed → link to financial projections tool
- No good options → show "Consider scaling down initial scope"

---

## Epic 6: AI Assistant

### Feature 6.1: Chat Interface

**User Story:**

As a user, I want to ask questions anytime, so that I can get help without leaving the app.

**Acceptance Criteria:**

- [ ] Floating chat button (bottom right)
- [ ] Opens chat panel (slides in from right on desktop, full screen on mobile)
- [ ] User can type questions and get AI responses
- [ ] Context-aware (knows current page, business type, state)
- [ ] Suggested questions based on context
- [ ] Conversation history persisted
- [ ] Rate limiting based on tier (Free: 10/week, Starter: 50/week, Growth+: unlimited)
- [ ] Shows remaining questions for current week

**Technical Notes:**

- OpenAI API with conversation history (store in `ai_conversations` table)
- System prompt includes user context:
  ```
  User is on the Entity Selection page.
  Business type: Tech/SaaS
  ```
