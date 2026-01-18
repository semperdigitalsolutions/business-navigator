# Content Checklist

Created by: Erick Nolasco
Created time: January 4, 2026 6:21 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 10:17 AM
Doc Type: Content Guide
Key Info: Content completion tracking: task content, AI prompts, emails, help docs, legal disclaimers
Phase: Core Features
Priority: High

Content tracking for all written materials needed before beta launch.

---

## ✅ Content Status Overview

| **Content Type**              | **Status**     | **% Complete** | **Owner**      | **Notes**                   |
| ----------------------------- | -------------- | -------------- | -------------- | --------------------------- |
| 34 Task Educational Content   | 🟢 Done        | 95%            | -              | Needs final review only     |
| AI Prompts & Templates        | 🟡 Testing     | 90%            | [Assign]       | Written, needs validation   |
| UI Copy & Microcopy           | 🟢 Done        | 95%            | -              | In style guide              |
| Email Templates (Core)        | 🟢 Done        | 100%           | -              | 7 templates written         |
| Email Templates (Full System) | 🟡 In Progress | 60%            | [Assign]       | Need 6 more templates       |
| Help Documentation            | 🟡 In Progress | 70%            | [Assign]       | Need troubleshooting guides |
| Legal Disclaimers             | 🔴 Not Started | 0%             | [Legal review] | **CRITICAL - needs lawyer** |
| State-Specific Content        | 🟡 In Progress | 40%            | [Assign]       | Top 10 states only          |

**Overall Progress**: ~75% complete

---

## 🔴 Critical Missing Items (Week 7 Priority)

### 1. Legal Disclaimers & Policies

**Status**: 🔴 Not started

**Urgency**: CRITICAL - Cannot launch without these

**Owner**: [Assign] + Legal review

**Estimated time**: 3-5 days (including lawyer review)

**What's needed**:

- [ ] Terms of Service
- [ ] Privacy Policy (GDPR, CCPA compliant)
- [ ] "Not legal/tax advice" disclaimer (for app footer + critical screens)
- [ ] Affiliate disclosure (if using affiliate links)
- [ ] Cookie policy (if tracking cookies)
- [ ] Data retention policy
- [ ] User data deletion policy

**Resources**:

- Template generators: Termly, Iubenda, TermsFeed
- **BUT**: Must have lawyer review before launch (liability risk)

**Action items**:

1. [ ] Generate first drafts using template tools
2. [ ] Customize for Business Navigator specifics
3. [ ] Send to lawyer for review (budget: $500-1,500)
4. [ ] Implement lawyer feedback
5. [ ] Add to app footer and relevant screens

**Decision needed**: Who's our lawyer? Do we have budget?

---

### 2. Missing Email Templates (from MVP Gaps Doc)

**Status**: 🟡 Partially done

**Urgency**: HIGH - Needed for retention

**Owner**: [Assign]

**Estimated time**: 2 days

**Already written** (7 templates in [Content Guide](https://www.notion.so/Content-Guide-47c816698e8945a092cd7b786ce67e68?pvs=21)):

- ✅ Welcome email
- ✅ Email verification
- ✅ Password reset
- ✅ Task reminder (generic)
- ✅ Deadline approaching
- ✅ Milestone celebration
- ✅ Upgrade confirmation
- ✅ Payment failed
- ✅ Subscription canceled

**Still need to write** (6 templates from [MVP Gaps](https://www.notion.so/MVP-Gaps-ecca997046de4b40be4426f8851bdc4c?pvs=21)):

- [ ] **Onboarding abandoned** (24h after signup if quiz incomplete)
- [ ] **First task not completed** (48h after starting but not finishing)
- [ ] **Weekly progress digest** (sent every Monday with stats)
- [ ] **Re-engagement series** (7d, 14d, 30d inactive)
- [ ] **Free tier limit approaching** (8 of 10 AI questions used)
- [ ] **Free tier limit reached** (with upgrade prompt)

**Action items**:

1. [ ] Draft 6 missing email templates
2. [ ] Follow tone guidelines from Content Guide
3. [ ] Add to email sending logic in backend
4. [ ] Test email rendering (mobile + desktop)
5. [ ] Set up email scheduling system

**Template location**: Add to [Content Guide](https://www.notion.so/Content-Guide-47c816698e8945a092cd7b786ce67e68?pvs=21) (new section)

---

### 3. AI Prompts Testing & Validation

**Status**: 🟡 Written but not tested

**Urgency**: HIGH - Core feature

**Owner**: [Assign] + Developer

**Estimated time**: 3-4 days

**What needs testing**:

- [ ] Problem definition analysis (Green/Yellow/Red feedback)
- [ ] Target customer persona generation
- [ ] Value proposition generator (3 options)
- [ ] Business model recommendation
- [ ] Entity type selection recommendation
- [ ] Pricing strategy recommendation
- [ ] Funding strategy recommendation
- [ ] Financial projections reality check
- [ ] General chatbot Q&A responses

**Testing process**:

1. [ ] Create test scenarios (10 different user profiles)
2. [ ] Run each scenario through AI prompts
3. [ ] Evaluate output quality (accuracy, helpfulness, tone)
4. [ ] Refine prompts based on results
5. [ ] Test edge cases (incomplete data, unusual business types)
6. [ ] Document prompt versions and improvements

**Success criteria**:

- [ ] 80%+ responses are helpful without further refinement
- [ ] No hallucinations or incorrect legal/tax advice
- [ ] Tone matches brand voice (friendly mentor, not corporate)
- [ ] Responses reference user context correctly

**Budget note**: OpenAI API testing costs ~$50-100

---

## 🟡 Important But Can Wait Until Week 8

### 4. Help Documentation Completion

**Status**: 70% complete

**Owner**: [Assign]

**Estimated time**: 2 days

**Already written**:

- ✅ Getting started (how to start plan, confidence score, change answers)
- ✅ Using tasks (locked tasks, skip tasks, task timing)
- ✅ AI Assistant (what it can do, question limits)
- ✅ Billing & Plans (plan comparison, cancellation)

**Still need**:

- [ ] **Troubleshooting guides**:
  - "My bank account application was rejected"
  - "I made a mistake on my state filing"
  - "How do I change my entity type after filing?"
  - "My payment isn't processing"
  - "I can't access a task I completed"
- [ ] **State-specific FAQs** (for top 10 states):
  - "California-specific requirements"
  - "Texas-specific requirements"
  - etc.
- [ ] **Video tutorials** (optional, can use Loom):
  - "How to complete your first task"
  - "Using the AI Assistant effectively"
  - "Understanding your confidence score"

**Action items**:

1. [ ] Draft troubleshooting guides based on common issues
2. [ ] Create state-specific FAQ sections
3. [ ] Consider video tutorials (optional, post-launch is fine)
4. [ ] Add to Help Center in app

---

### 5. State-Specific Content (Top 10 States)

**Status**: 40% complete

**Owner**: [Assign] + Research

**Estimated time**: 5-7 days

**States to cover**: CA, TX, FL, NY, PA, IL, OH, GA, NC, MI

**What's needed for each state**:

- [ ] Entity registration process (step-by-step)
- [ ] Filing fees (LLC, C-Corp, S-Corp)
- [ ] Processing times
- [ ] Required licenses by industry (Tech/SaaS, Service)
- [ ] State tax obligations (income tax, franchise tax, sales tax)
- [ ] Annual/biennial reporting requirements
- [ ] Registered agent requirements
- [ ] Links to state websites (SOS, tax authority)

**Current status**:

- ✅ California: 80% complete (most detailed)
- ✅ Texas: 60% complete
- 🟡 Florida, New York: 40% complete
- 🔴 Other 6 states: 20% complete (basic info only)

**Action items**:

1. [ ] Research each state's requirements (use official state websites)
2. [ ] Create standardized template for state-specific content
3. [ ] Fill in template for all 10 states
4. [ ] Verify accuracy (sources, dates, fees)
5. [ ] Add dynamic content to tasks (shows based on user's state)
6. [ ] Set quarterly review reminder (state laws change)

**Resources**:

- State Secretary of State websites
- NOLO legal guides
- [SBA.gov](http://SBA.gov) state-by-state guides

---

### 6. Empty State Copy & First-Time User Experience

**Status**: Not written

**Owner**: [Assign]

**Estimated time**: 1 day

**Needed** (from [MVP Gaps](https://www.notion.so/MVP-Gaps-ecca997046de4b40be4426f8851bdc4c?pvs=21)):

- [ ] Dashboard empty state (new user, no tasks completed)
- [ ] Tasks tab empty state (all tasks locked)
- [ ] Chat tab empty state (no conversation history)
- [ ] Documents empty state (nothing generated)
- [ ] Deadlines empty state (none set)
- [ ] Progress view empty state (just started)

**Template for each**:

- Icon/illustration
- Heading (encouraging)
- Description (what will appear here)
- CTA button (what to do next)

**Action items**:

1. [ ] Write copy for all 6 empty states
2. [ ] Create or source illustrations (can use free icon libraries)
3. [ ] Add to UI components
4. [ ] Test with new user flow

---

## 📋 Content Review Checklist

Before launch, all content should be reviewed for:

### Accuracy

- [ ] Legal/tax information is current (as of launch date)
- [ ] State-specific details are verified with official sources
- [ ] Links to external sites are working
- [ ] Fees and pricing are up-to-date

### Clarity

- [ ] No jargon without explanation
- [ ] Step-by-step instructions are clear
- [ ] Examples are relevant and helpful
- [ ] Technical concepts are explained simply

### Consistency

- [ ] Tone matches voice guidelines (friendly, encouraging)
- [ ] Terminology is consistent across all content
- [ ] UI copy matches actual button/field labels in app
- [ ] No contradictions between different docs

### Completeness

- [ ] All 34 tasks have educational content
- [ ] All user-facing screens have copy
- [ ] All email triggers have templates
- [ ] All help topics are covered

### Legal Compliance

- [ ] Disclaimers are present where needed
- [ ] Terms of Service and Privacy Policy are linked
- [ ] Data handling is clearly explained
- [ ] "Not legal/tax advice" warning on relevant screens

---

## 🎯 Week 7-8 Content Sprint Plan

### Week 7 (Pre-Launch)

**Days 1-2**: Legal disclaimers

- Generate drafts using templates
- Send to lawyer for review

**Day 3**: Missing email templates

- Write 6 missing templates
- Add to Content Guide doc

**Days 4-5**: AI prompt testing

- Run test scenarios
- Refine prompts
- Document results

### Week 8 (Launch Week)

**Day 1**: Empty state copy

- Write copy for all empty states
- Source illustrations

**Day 2**: Help docs completion

- Write troubleshooting guides
- Add state-specific FAQs

**Days 3-5**: Content review & polish

- Review all content for accuracy, clarity, consistency
- Make final edits
- Get stakeholder approval

---

## 👥 Content Ownership (Assign Roles)

**Content Lead** (writes & edits): [ASSIGN]

- Responsible for: Email templates, help docs, empty states, content review
- Time commitment: 20-30 hours over 2 weeks

**Legal Reviewer** (lawyer): [ASSIGN]

- Responsible for: Terms, Privacy Policy, disclaimers
- Time commitment: 4-8 hours + review cycles
- Budget: $500-1,500

**AI Prompt Engineer** (dev + content): [ASSIGN]

- Responsible for: Testing prompts, refining based on results
- Time commitment: 15-20 hours

**State Research** (intern or contractor?): [ASSIGN]

- Responsible for: Gathering state-specific requirements
- Time commitment: 30-40 hours
- Budget: $15-25/hr × 35 hours = $525-875

**Total estimated budget**: $1,025-2,375 (legal + research)

**Total estimated time**: 69-98 hours across team

---

## 📊 Content Completion Tracking

**Update this weekly** to track progress:

**Week 7 Progress** (Target: 90% complete):

- [ ] Legal disclaimers: \_\_% done
- [ ] Missing emails: \_\_% done
- [ ] AI prompts tested: \_\_% done
- [ ] Overall: \_\_% content complete

**Week 8 Progress** (Target: 100% complete):

- [ ] Empty states: \_\_% done
- [ ] Help docs: \_\_% done
- [ ] Content review: \_\_% done
- [ ] Legal approval: Yes/No
- [ ] Overall: \_\_% content complete

---

## ✅ Definition of "Content Complete"

Beta launch is ready when:

- [x] All 34 task educational content is written (DONE)
- [x] All AI prompts are written and tested (needs testing)
- [x] All core email templates are written (7 done, 6 to go)
- [x] All UI copy is in style guide (DONE)
- [ ] Legal disclaimers are lawyer-approved
- [x] Help docs cover common questions (70% done)
- [ ] Empty states have copy (not started)
- [x] Content review completed (needs final pass)

**Current status**: 7 of 8 criteria met (~75% complete)

**Blockers**: Legal review (most critical)

---

**Next steps**:

1. Assign owners for each content type
2. Secure legal reviewer (get quotes from 2-3 lawyers)
3. Start Week 7 content sprint (see plan above)
4. Update this checklist daily during sprint
