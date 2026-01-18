# 8-Week Build Plan

Created by: Erick Nolasco
Created time: January 5, 2026 5:07 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 5:25 PM
Doc Type: Planning Doc
Key Info: Complete 8-week dev + content parallel workflow with weekly milestones & dependencies
Phase: Foundation
Priority: Critical

Coordinated development and content plan for Business Navigator beta launch.

---

## Overview

**Timeline:** 8 weeks to beta launch

**Target:** 50-100 beta users

**Approach:** Parallel workflows (dev builds while content is finalized)

**Team Structure:**

- **Dev:** Full-stack developer (Next.js, PostgreSQL, integrations)
- **Product/Design:** Erick (specs, content, design QA)
- **Legal:** External lawyer (Week 7 only)

### Critical Path Items

| **Week** | **Dev Milestone**             | **Content Milestone**  | **Blocker Risk**               |
| -------- | ----------------------------- | ---------------------- | ------------------------------ |
| 1-2      | Infrastructure setup complete | Task content finalized | 🟢 Low                         |
| 3-4      | Task system functional        | AI prompts tested      | 🟢 Low                         |
| 5-6      | AI chat working               | Email templates done   | 🟡 Medium (OpenAI integration) |
| 7        | Export + payments working     | Legal docs approved    | 🔴 High (lawyer turnaround)    |
| 8        | Bug fixes + polish            | All copy in place      | 🟢 Low                         |

---

## Week 1: Foundation & Setup

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **Initialize Next.js 14 project**
• App Router structure
• TypeScript config
• Tailwind + shadcn/ui setup | 4 hours | ☐ |
| **Database setup**
• PostgreSQL (Supabase or Neon)
• Prisma ORM config
• Create all 9 tables
• Seed with test data | 6 hours | ☐ |
| **Clerk authentication**
• Install Clerk SDK
• Configure OAuth (Google)
• Email/password auth
• Middleware for protected routes | 4 hours | ☐ |
| **Basic routing & layout**
• Create 4 main routes (/dashboard, /tasks, /chat, /more)
• Bottom navigation component
• Mobile-first responsive layout | 6 hours | ☐ |
| **Environment setup**
• Vercel deployment pipeline
• Environment variables
• GitHub repo + branch strategy | 2 hours | ☐ |

**Total dev time:** ~22 hours (3 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Review all 34 task contents**
• Read through each task
• Check for clarity, accuracy
• Mark any that need rewrites | Erick | 4 hours | ☐ |
| **Write empty state copy**
• Dashboard (new user)
• Tasks (all locked)
• Chat (no history)
• Documents (nothing generated)
• Deadlines (none set)
• Progress (just started) | Erick | 2 hours | ☐ |
| **Start legal doc process**
• Get quotes from 2-3 lawyers
• Use Termly/Iubenda for first drafts
• Prepare list of customizations needed | Erick | 3 hours | ☐ |
| **Create style guide**
• Finalize color palette
• Typography scale
• Icon library choice
• Button styles | Erick | 2 hours | ☐ |

**Total content time:** ~11 hours (1.5 days)

### 📦 Week 1 Deliverables

✅ Next.js project running locally and on Vercel

✅ Database schema deployed

✅ Authentication working (can sign up/login)

✅ Basic navigation between 4 tabs

✅ All task content reviewed

✅ Empty state copy written

✅ Lawyer quotes received

---

## Week 2: Onboarding & Core UI

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **Onboarding flow**
• 7-step questionnaire screens
• Progress indicator
• Form validation
• Save to database
• Generate initial business_plan record | 10 hours | ☐ |
| **Dashboard layout**
• Confidence score component
• Hero task card
• Progress by phase (3 bars)
• Quick stats section
• Upcoming deadlines (next 3)
• Recent activity feed | 8 hours | ☐ |
| **Task list view**
• Phase accordion (3 phases)
• Task cards with status icons
• Lock/unlock logic
• Estimated time display
• Navigate to task detail | 6 hours | ☐ |
| **Component library**
• Buttons (primary, secondary, ghost)
• Form inputs (text, select, textarea)
• Cards, badges, progress bars
• Loading states
• Alert/notification components | 6 hours | ☐ |

**Total dev time:** ~30 hours (4 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Rewrite flagged tasks**
• Fix any clarity issues from Week 1 review
• Ensure all tasks have clear CTAs | Erick | 3 hours | ☐ |
| **Finalize onboarding questions**
• Review 7-step quiz copy
• Write all option descriptions
• Add helpful tooltips | Erick | 2 hours | ☐ |
| **Create UI mockups**
• Dashboard (if not done)
• Onboarding screens (if not done)
• Task detail screens (top 5 tasks) | Erick | 6 hours | ☐ |
| **Source illustrations**
• Find or create icons for empty states
• Find or create phase illustrations
• Milestone celebration graphics | Erick | 2 hours | ☐ |

**Total content time:** ~13 hours (2 days)

### 📦 Week 2 Deliverables

✅ Complete onboarding flow (7 steps)

✅ Dashboard fully designed and functional

✅ Task list with phase organization

✅ Component library with all common elements

✅ All task content revised and final

✅ UI mockups for key screens

---

## Week 3: Task System (Part 1)

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **Task detail screens**
• Task header (title, phase, time estimate)
• Educational content section
• Form/wizard section
• Back/Save/Complete buttons
• Breadcrumb navigation | 8 hours | ☐ |
| **Form components**
• Text inputs with validation
• Textareas with character count
• Select dropdowns
• Radio button groups
• Checkboxes
• File upload (basic) | 8 hours | ☐ |
| **Auto-save system**
• Debounced save (2-second delay)
• Visual indicator (☁️ Saving... / ☁️ Saved)
• Optimistic UI updates
• Error handling (⚠️ Not saved) | 6 hours | ☐ |
| **Phase 1 tasks (10 tasks)**
• Build forms for all 10 Phase 1 tasks
• Wire up to database
• Test validation rules | 10 hours | ☐ |

**Total dev time:** ~32 hours (4 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Write AI prompt templates**
• System prompt structure
• Task-specific prompts (34 tasks)
• Edge case handling
• Action button triggers | Erick | 6 hours | ☐ |
| **Test task forms with real data**
• Go through each Phase 1 task
• Fill in forms as test user
• Note any confusing fields
• Suggest improvements | Erick | 3 hours | ☐ |
| **Coordinate with lawyer**
• Send customized legal doc drafts
• Answer lawyer questions
• Review first round of edits | Erick | 2 hours | ☐ |

**Total content time:** ~11 hours (1.5 days)

### 📦 Week 3 Deliverables

✅ Task detail page template working

✅ Auto-save system functional

✅ All Phase 1 tasks (10/34) built and testable

✅ Form validation working

✅ AI prompt templates written

✅ First legal doc review round complete

---

## Week 4: Task System (Part 2)

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **Phase 2 tasks (12 tasks)**
• Build forms for all 12 Phase 2 tasks
• Legal-specific components (EIN input, entity selector)
• Wire up to database | 12 hours | ☐ |
| **Phase 3 tasks (12 tasks)**
• Build forms for all 12 Phase 3 tasks
• Financial components (budget calculator, projections)
• Wire up to database | 12 hours | ☐ |
| **Progress tracking logic**
• Confidence score algorithm
• Task completion tracking
• Phase progress calculation
• Update dashboard in real-time | 4 hours | ☐ |
| **Task dependencies**
• Lock/unlock logic based on completion
• Dependency rules (e.g., "Complete Task 1.1 first")
• Visual indicators for locked tasks | 4 hours | ☐ |

**Total dev time:** ~32 hours (4 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Test Phase 2 & 3 tasks**
• Go through each task as test user
• Check legal/financial content accuracy
• Flag any unclear instructions | Erick | 4 hours | ☐ |
| **Write microcopy**
• Tooltips for all complex fields
• Validation error messages
• Success confirmations
• Loading states text | Erick | 3 hours | ☐ |
| **Create help docs (first pass)**
• "How to use Business Navigator"
• "Understanding the confidence score"
• "What happens to my data?"
• "How to export my plan" | Erick | 4 hours | ☐ |

**Total content time:** ~11 hours (1.5 days)

### 📦 Week 4 Deliverables

✅ All 34 tasks built and functional

✅ Progress tracking working (confidence score updates)

✅ Task dependencies enforced

✅ All microcopy written

✅ Help docs first draft complete

**🎉 MAJOR MILESTONE:** Core task system complete!

---

## Week 5: AI Chat Integration

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **Chat UI**
• Full-screen chat interface
• Message bubbles (user vs AI)
• Input field with send button
• Loading animation (typing indicator)
• Scroll to bottom on new message | 6 hours | ☐ |
| **OpenAI integration**
• API route for chat endpoint
• Streaming responses (optional)
• Error handling (rate limits, API errors)
• Token usage tracking | 6 hours | ☐ |
| **Context system**
• Build context payload from database
• Include: onboarding data, completed tasks, decisions, current screen
• Inject context into system prompt
• Test context accuracy | 8 hours | ☐ |
| **Action buttons**
• Parse AI response for action buttons
• Render buttons in chat ("View task →", "Update plan →")
• Wire up navigation
• Handle data updates with confirmation | 6 hours | ☐ |
| **Usage limits**
• Track AI questions per user
• Enforce plan limits (10/day Free, 50/day Starter, unlimited Growth)
• Show usage in UI
• Upgrade prompt when limit reached | 4 hours | ☐ |

**Total dev time:** ~30 hours (4 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Test AI prompts**
• Run 20-30 test questions through chat
• Verify context is accurate
• Check for hallucinations or bad advice
• Refine prompts based on results | Erick | 4 hours | ☐ |
| **Write edge case prompts**
• "I don't know" responses
• "That's outside my expertise" redirects
• Legal disclaimer reminders
• Proactive suggestions | Erick | 2 hours | ☐ |
| **Start email templates**
• Welcome email (already done)
• Email verification (already done)
• Password reset (already done)
• Inactive user (7 days no login)
• Phase completion celebration
• Upgrade prompt | Erick | 3 hours | ☐ |

**Total content time:** ~9 hours (1 day)

### 📦 Week 5 Deliverables

✅ AI chat fully functional

✅ Context system working (AI knows user's business)

✅ Action buttons navigate and update data

✅ Usage limits enforced

✅ AI prompts tested and refined

✅ Email templates (6/13) written

---

## Week 6: Intelligence & Recommendations

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **AI task validation**
• After user completes task, send data to AI
• AI provides feedback (green/yellow/red)
• Show feedback in task detail
• Suggest improvements if needed | 6 hours | ☐ |
| **Proactive suggestions**
• Detect user hesitation (time on task >5 min)
• Show AI tip: "💡 Need help with this?"
• Background context analysis
• Cross-task insights | 6 hours | ☐ |
| **Hero task logic**
• Algorithm to select next hero task
• Priority: unlock blockers, approaching deadlines, momentum
• Update dashboard when task completed | 4 hours | ☐ |
| **Deadline system**
• Create deadlines from task data (e.g., tax filing dates)
• Show in dashboard (next 3)
• Send reminders (30 days, 7 days, 1 day)
• Mark complete when task done | 6 hours | ☐ |
| **Notification system**
• Email notifications via Resend
• Configure email templates
• Unsubscribe handling
• Test all email flows | 6 hours | ☐ |

**Total dev time:** ~28 hours (3.5 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Finish email templates**
• Task reminder (generic)
• Deadline approaching
• Milestone celebration
• Weekly progress summary
• Referral request
• Feedback request | Erick | 3 hours | ☐ |
| **Write notification copy**
• Push notification text (if PWA)
• In-app notification banners
• Email subject lines | Erick | 1 hour | ☐ |
| **Finalize help docs**
• Add troubleshooting guides
• FAQ section
• Video tutorials (optional)
• Contact support info | Erick | 3 hours | ☐ |
| **Legal docs - final review**
• Receive final legal docs from lawyer
• Review and approve
• Prepare for implementation | Erick | 2 hours | ☐ |

**Total content time:** ~9 hours (1 day)

### 📦 Week 6 Deliverables

✅ AI provides task feedback

✅ Proactive AI suggestions working

✅ Hero task auto-updates

✅ Deadline system functional

✅ Email notifications working

✅ All 13 email templates complete

✅ Help docs finished

✅ Legal docs approved and ready

---

## Week 7: Export, Payments & Polish

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **"My Business Plan" view**
• Living document view
• Organized by section
• Show all completed task data
• "Export" button at top | 6 hours | ☐ |
| **PDF export**
• Install Puppeteer or PDFKit
• Create PDF template (HTML)
• Generate PDF from user data
• Upload to Vercel Blob
• Return download link (expires in 7 days) | 10 hours | ☐ |
| **Export history**
• Store exports in database
• Show list of past exports
• Re-download or delete | 3 hours | ☐ |
| **Stripe integration**
• Install Stripe SDK
• Create products & prices
• Checkout flow (redirect to Stripe)
• Webhook handling (subscription.created, payment.succeeded)
• Update user plan tier in database | 8 hours | ☐ |
| **Plan upgrade UI**
• Pricing page
• "Upgrade" prompts (when limits hit)
• Billing settings page
• Cancel subscription flow | 5 hours | ☐ |

**Total dev time:** ~32 hours (4 days)

### ✍️ Content & Design Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Add legal docs to app**
• Terms of Service page
• Privacy Policy page
• Footer links
• Disclaimer on relevant screens | Erick | 2 hours | ☐ |
| **Design PDF template**
• Professional layout
• Cover page, TOC, sections
• Branding (logo, colors)
• Test export with sample data | Erick | 4 hours | ☐ |
| **Write pricing page copy**
• Feature comparison table
• Plan descriptions
• FAQ about billing
• Testimonials (if available) | Erick | 2 hours | ☐ |
| **Final content audit**
• Check all screens for typos
• Verify consistency
• Test all flows as end user
• Fix any issues found | Erick | 4 hours | ☐ |

**Total content time:** ~12 hours (1.5 days)

### 📦 Week 7 Deliverables

✅ PDF export working

✅ Stripe payments functional

✅ Plan upgrades working

✅ Legal docs live in app

✅ All content reviewed and final

**🎉 MAJOR MILESTONE:** Feature complete! Ready for testing.

---

## Week 8: Beta Launch

### 🛠️ Development Tasks

| **Task** | **Time** | **Status** |
| -------- | -------- | ---------- |

| **Analytics setup**
• Install PostHog
• Configure all events (see Operations Guide)
• Test event tracking
• Create dashboards | 4 hours | ☐ |
| **Error monitoring**
• Install Sentry (or use Vercel errors)
• Configure error alerts
• Test error reporting | 2 hours | ☐ |
| **QA testing**
• Run through Launch Checklist QA tests
• Test on iOS Safari, Android Chrome
• Test all P0 flows (signup, task, payment)
• Cross-browser testing | 8 hours | ☐ |
| **Bug fixes**
• Fix all P0 bugs found in QA
• Fix high-priority P1 bugs
• Document P2 bugs for post-launch | 10 hours | ☐ |
| **Performance optimization**
• Run Lighthouse audits
• Optimize images
• Code splitting
• Fix any slow API endpoints | 4 hours | ☐ |
| **Launch day deployment**
• Final database backup
• Deploy to production
• Smoke test (see Launch Checklist)
• Monitor for errors | 4 hours | ☐ |

**Total dev time:** ~32 hours (4 days)

### ✍️ Content & Launch Tasks

| **Task** | **Owner** | **Time** | **Status** |
| -------- | --------- | -------- | ---------- |

| **Beta invite emails**
• Finalize list of 100 beta users
• Write personal invite emails
• Schedule sends (50 at launch, 50 at +2 hours) | Erick | 2 hours | ☐ |
| **Product Hunt prep**
• Create PH account (if needed)
• Write launch post
• Prepare images/GIFs
• Schedule for launch day | Erick | 3 hours | ☐ |
| **Social posts**
• Write Twitter/X thread
• Write LinkedIn post
• Schedule for launch day
• Prepare follow-up posts | Erick | 2 hours | ☐ |
| **Launch day monitoring**
• Watch for signups in PostHog
• Monitor error logs
• Respond to support emails
• Engage on Product Hunt | Erick | 8 hours | ☐ |
| **User onboarding calls**
• Schedule 1-on-1 calls with first 10 users
• Walk them through the app
• Gather feedback
• Document issues | Erick | 10 hours | ☐ |

**Total content time:** ~25 hours (3 days)

### 📦 Week 8 Deliverables

✅ Analytics tracking all events

✅ Error monitoring active

✅ All P0 bugs fixed

✅ Performance optimized (Lighthouse score >90)

✅ Beta invites sent

✅ Product Hunt launched

✅ 50-100 users signed up

**🚀 LAUNCH!**

---

## Post-Launch (Week 9+)

### Immediate Priorities

**Week 9:**

- Monitor metrics daily (see Operations Guide)
- Fix critical bugs as they emerge
- Respond to all support tickets within 24 hours
- Schedule user feedback calls

**Week 10:**

- Analyze week 1 data (signups, completion rates, drop-offs)
- Prioritize top 3 UX improvements
- Plan first update release

**Week 11-12:**

- Implement high-impact improvements
- Expand to more beta users (100 → 200)
- Start building waitlist for public launch

---

## Risk Mitigation

### High-Risk Items & Contingencies

| **Risk**                              | **Likelihood** | **Impact**  | **Mitigation**                                                                           |
| ------------------------------------- | -------------- | ----------- | ---------------------------------------------------------------------------------------- |
| **Lawyer delays legal docs**          | 🟡 Medium      | 🔴 Critical | Start Week 1, use templates, get quotes from 3 lawyers (fastest wins)                    |
| **OpenAI API issues**                 | 🟢 Low         | 🟡 Medium   | Build chat UI first, stub AI responses, integrate API later                              |
| **Task content not ready**            | 🟢 Low         | 🟡 Medium   | Already 95% done, just needs review. Can launch with placeholder for 1-2 tasks if needed |
| **Stripe integration problems**       | 🟢 Low         | 🟡 Medium   | Can launch Free tier only, add payments in Week 9                                        |
| **Dev velocity slower than expected** | 🟡 Medium      | 🟡 Medium   | Cut P1 features: version history, document generation, advanced exports                  |

---

## Weekly Check-Ins

### Every Friday at 4pm

**Agenda:**

1. **Review week's deliverables** (5 min)
   - What shipped?
   - What's blocked?
2. **Demo working features** (10 min)
   - Dev shows progress
   - Erick provides feedback
3. **Next week planning** (5 min)
   - Confirm priorities
   - Adjust timeline if needed
4. **Blocker discussion** (10 min)
   - What's preventing progress?
   - How to unblock?

**Total:** 30 minutes

---

## Success Metrics

### Week-by-Week Goals

| **Week** | **Completion Target**  | **Key Metric**                    |
| -------- | ---------------------- | --------------------------------- |
| 1        | Infrastructure setup   | Can deploy to Vercel              |
| 2        | Onboarding + dashboard | Can complete onboarding flow      |
| 3        | Phase 1 tasks working  | Can complete 1 task end-to-end    |
| 4        | All 34 tasks working   | Can complete all tasks            |
| 5        | AI chat functional     | AI responds with accurate context |
| 6        | Intelligence features  | AI validates tasks, sends emails  |
| 7        | Export + payments      | Can generate PDF, upgrade plan    |
| 8        | Beta launch            | 50-100 users signed up            |

### Beta Success Criteria (Week 1 post-launch)

✅ 100 signups

✅ >60% onboarding completion

✅ >50% complete ≥1 task

✅ <5 P0 bugs

✅ <10 min avg time to first task

✅ <20 support tickets

---

## Budget & Resources

### Development Costs

| **Item**                            | **Cost**          | **Notes**                                                         |
| ----------------------------------- | ----------------- | ----------------------------------------------------------------- |
| **Developer (8 weeks)**             | $8,000-20,000     | $25-60/hr × 160 hours OR fixed project fee                        |
| **Legal review**                    | $500-1,500        | Terms, Privacy Policy, disclaimers                                |
| **Infrastructure (first 3 months)** | $150-300          | Vercel ($20/mo), DB ($20/mo), Clerk ($25/mo), OpenAI ($50-100/mo) |
| **Tools & subscriptions**           | $100-200          | Figma, stock images, fonts, misc                                  |
| **Total**                           | **$8,750-22,000** | Depends on dev rate and legal complexity                          |

---

## Next Steps

### This Week (Week 0)

- [ ] **Hire developer** (if not already hired)
- [ ] **Get lawyer quotes** (3 lawyers, fastest turnaround)
- [ ] **Review this build plan** with dev
- [ ] **Set up project management** (Notion, Linear, or Trello)
- [ ] **Schedule weekly check-ins** (Fridays 4pm)
- [ ] **Kick off Week 1** (Infrastructure setup)

### Before Week 1 Starts

- [ ] All accounts created (Vercel, Clerk, Stripe, OpenAI, Resend, PostHog)
- [ ] Domain registered (if not already)
- [ ] GitHub repo created
- [ ] Figma files organized
- [ ] Task content docs shared with dev

**Ready to build?** 🚀
