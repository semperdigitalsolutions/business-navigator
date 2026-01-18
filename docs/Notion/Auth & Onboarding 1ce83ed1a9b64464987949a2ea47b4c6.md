# Auth & Onboarding

Created by: Erick Nolasco
Created time: December 25, 2025 11:28 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:08 AM
Doc Type: Feature Spec
Key Info: Complete auth flow, 7-step onboarding, validation, states & hybrid approach
Phase: Core Features
Priority: Critical

**Flow:** Signup → Email verification → 7-step quiz → Dashboard | **Time to value:** <2 minutes

---

## Authentication

### Approach

**Recommended:** Clerk (10K MAUs free, OAuth built-in, Next.js integration)

### Screens

| Screen           | Purpose        | Key Fields                                         |
| ---------------- | -------------- | -------------------------------------------------- |
| **Signup**       | Create account | Email, password, full name, "Continue with Google" |
| **Login**        | Return user    | Email, password, remember me                       |
| **Email Verify** | Confirm email  | Auto-sent link, 24hr expiration                    |

**Separate screens** (not combined) for clarity

### Validation

| Field        | Rules                                           | Error Messages                                           |
| ------------ | ----------------------------------------------- | -------------------------------------------------------- |
| **Email**    | Required, RFC 5322 format, max 255 chars        | "Enter valid email" / "Email already exists"             |
| **Password** | Min 8 chars, 1 uppercase, 1 lowercase, 1 number | "Min 8 characters" / "Must contain upper, lower, number" |
| **Name**     | Required, max 255 chars                         | "Enter your name"                                        |

**Show/hide toggle** for password field

---

## Onboarding Quiz (7 Steps)

**Purpose:** Personalize roadmap, set context for AI

### Questions

| Step  | Question          | Options                                              | Stored As               |
| ----- | ----------------- | ---------------------------------------------------- | ----------------------- |
| **1** | Business type?    | Tech/SaaS, Service, E-commerce, Local                | `business_type`         |
| **2** | Current stage?    | Just an idea, Planning, Already started              | `stage`                 |
| **3** | What state?       | Dropdown (all 50), search enabled                    | `state` (2-letter code) |
| **4** | Timeline?         | ASAP (0-3mo), 3-6mo, 6-12mo, Just exploring          | `timeline`              |
| **5** | Funding approach? | Personal savings, Raising investment, Loan, Multiple | `funding_approach`      |
| **6** | Prior experience? | First business, Done this before                     | `previous_experience`   |
| **7** | Primary concern?  | Legal, Financial, Marketing, Product, Time           | `primary_concern`       |

**All optional** (skip button on each step)

**Progress:** "Step X of 7" + progress bar

**Auto-save:** After each step

**Resume:** If user exits mid-flow

### Design Pattern

```

```

Header: [← Back] Step X of 7 [×]

Progress: ████████░░░░░░░░ X/7

Password:

┌─────────────────────────────────────┐ ← Red border

│ 🔒 👁 │

└─────────────────────────────────────┘

Please enter a valid password ← Red text

```

```

```jsx
Email Address:
┌─────────────────────────────────────┐ ← Red border
│ 📧                                  │
└─────────────────────────────────────┘
Please enter a valid email address ← Red text

[Question text]

Must contain:
✅ At least 8 characters
✅ One uppercase letter
✅ One lowercase letter
❌ One number ← Changes to ✅ as they type
```

```jsx
Password
┌─────────────────────────────────────┐
│ 🔒                              👁  │
└─────────────────────────────────────┘
████████░░░░ Strong ← Green if strong, yellow if medium

[Large card option 1]
[Large card option 2]
[Large card option 3]

(Small checkbox, required to enable button)
```

```jsx
Above "Create account" button:
□ I agree to the Terms of Service and Privacy Policy

[Skip for now] [Continue →]
```

**Mobile:** Full-screen, auto-advance after selection

**Desktop:** Max 600px width, centered

---

## Impact on Experience

| Answer            | Affects                                                     |
| ----------------- | ----------------------------------------------------------- |
| **Business type** | Task priorities, content emphasis (IP vs. liability)        |
| **Stage**         | Tone (educational vs. fast-track), starting phase           |
| **State**         | Legal requirements, checklists, compliance alerts           |
| **Timeline**      | Urgency indicators, recommended pace                        |
| **Funding**       | Entity recommendation (C-Corp if raising, LLC if bootstrap) |
| **Experience**    | Content depth (explain "why" for first-timers)              |
| **Concern**       | Emphasized phase on dashboard                               |

---

## Post-Onboarding

### Loading Screen (3-5 seconds)

"Creating your plan..."

- Shows AI is working (not fake)
- Progressive messages every 1.5s

### Completion Screen

```

```

🎉 You're all set!

Welcome to Business Navigator! Click the button below to verify your email:

[Verify Email Address] ← Big blue button

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

--

The Business Navigator Team

```

```

```html
Hi [Full Name], We've personalized your business plan. ⚡ Your first task is ready 📋 34 tasks
organized into 3 phases 💬 AI assistant available anytime [View my dashboard →]
```

Auto-redirect after 3 seconds

---

## Data Storage

### Database Updates

```sql
-- After signup
users { clerk_user_id, email, full_name, onboarding_completed: false }

Request:
{
  "user_id": "usr_123",
  "step": 1,
  "data": {
    "business_type": "tech_saas"
  }
}

// Backend creates or updates business_plan record
const businessPlan = await
```

```jsx
// After each step, save to database
POST /api/onboarding/update

-- After each quiz step
business_plans {
  user_id, business_type, stage, state, timeline,
  funding_approach, onboarding_data (JSONB)
}

-- After completion
users { onboarding_completed: true, onboarding_step: 7 }
business_plans { personalized_plan (JSONB), confidence_score: 5 }
```

### Resume Logic

```jsx

```

// On next login

GET /api/auth/me

if (!user.onboarding_completed) {

redirect to `/onboarding?step=${user.onboarding_step + 1}`

```

```

---

## Analytics Events

| Event                       | When                | Data                                |
| --------------------------- | ------------------- | ----------------------------------- |
| `Onboarding Step Viewed`    | User lands on step  | step number, step name              |
| `Onboarding Step Completed` | User answers        | step, value, time spent             |
| `Onboarding Step Skipped`   | User skips          | step                                |
| `Onboarding Completed`      | Finished all steps  | total time, steps completed/skipped |
| `Onboarding Abandoned`      | User exits mid-flow | last step reached                   |

**Goal:** Identify drop-off points, optimize conversion

---

## Edge Cases

| Scenario                      | Handling                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| **Email already exists**      | "Account exists. [Log in instead]"                           |
| **OAuth fails**               | "Couldn't connect to Google. [Try again] [Use email]"        |
| **Verification link expired** | "Link expired. [Resend verification email]"                  |
| **User exits mid-quiz**       | Show modal: "Progress saved. Continue later?" [Stay] [Leave] |
| **Network error during save** | "Connection lost. Retrying..." with spinner                  |

---

## Future Optimization: Hybrid Approach

**Problem:** 7 questions upfront delays value delivery

**Solution (Post-Beta):**

1. Ask ONE question first: "What's your business idea?" (1-2 sentences)
2. AI generates 3 instant insights (15 seconds)
3. Show value proof + "Want more?" hook
4. Then collect remaining 6 questions
5. Full dashboard with complete plan

**Benefit:** Value at 55 seconds instead of 2 minutes

**Status:** Test in Weeks 9-10 via A/B test (50/50 split)
