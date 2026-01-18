# Dashboard Design

Created by: Erick Nolasco
Created time: December 25, 2025 8:48 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:08 AM
Doc Type: Design Spec
Key Info: Mobile-first dashboard redesign: hero task, confidence score, collapsible sections
Phase: Core Features
Priority: Critical

**Insight:** 97% mobile usage | **Principle:** One primary action per screen | **Focus:** Hero task + confidence score

---

## Layout

### Mobile (Primary)

1. Header (greeting + confidence badge)
2. **Hero Task Card** (largest element)
3. Confidence Score Detail (expandable)
4. Progress Overview (collapsible)
5. Upcoming Deadlines (collapsible)
6. Key Decisions (collapsible)

Bottom Nav: 🏠 Home | ✓ Tasks | 💬 Assistant | 📊 Progress | ⋯ More

### Desktop (Secondary)

- Left Sidebar (240px): Navigation
- Main Content: Hero task + confidence + progress
- Right Sidebar (280px): Deadlines + decisions

---

## Key Components

### Hero Task Card

**Purpose:** Single next priority action (eliminates "what should I do?")

| Element         | Spec                                                             |
| --------------- | ---------------------------------------------------------------- |
| **Layout**      | Full-width mobile, max 600px desktop, 16px border-radius, shadow |
| **Icon**        | 24px emoji                                                       |
| **Label**       | "Your next step" (14px, gray, uppercase)                         |
| **Title**       | 24px bold, max 2 lines                                           |
| **Description** | 16px, gray, "Why this matters"                                   |
| **CTA Button**  | Blue 500, white text, 48px height, full-width mobile             |
| **Metadata**    | "Learn more" link, time estimate (~15 min)                       |

**States:** Loading (skeleton), completed (celebration + confetti)

---

### Confidence Score

| Element       | Display                                                          |
| ------------- | ---------------------------------------------------------------- |
| **Score**     | 0-100%, large circular progress (120px), blue fill               |
| **Dots**      | 10 dots (filled/empty) representing 10% increments               |
| **Message**   | Dynamic encouragement based on score range                       |
| **Breakdown** | Category progress bars (Ideation, Legal, Financial, Launch Prep) |
| **Colors**    | Green (90-100%), Blue (1-89%), Gray (0%)                         |

**Algorithm:**

```

```

Ideation: 20% weight

Legal: 40% weight

Financial: 30% weight

Launch Prep: 10% weight

```

```

---

### Progress Overview

| Phase          | Display                                     |
| -------------- | ------------------------------------------- |
| **Header**     | "Your Progress [4/22]" with chevron toggle  |
| **Each Phase** | Name, progress bar (8px height), task count |
| **Bar Colors** | Gradient blue 400→600                       |
| **CTA**        | "View all tasks →"                          |

**Mobile:** Starts collapsed

**Desktop:** Always expanded, 2-column if space

---

### Upcoming Deadlines

**Display:** Date, title, time remaining, urgency indicator

| Urgency  | Color  | Timeframe  |
| -------- | ------ | ---------- |
| Critical | Red    | <7 days    |
| Soon     | Orange | 7-30 days  |
| Upcoming | Yellow | 31-60 days |
| Future   | Gray   | >60 days   |

**Max shown:** 3 (then "View all →")

**Empty state:** "You're all caught up!"

---

### Key Decisions

**Format:** Label, value, [Change] button

Examples:

- Legal Structure: Delaware C-Corp
- Funding Strategy: Bootstrapped
- Target Launch: Q2 2026

**Max shown:** 3 initially

**Interaction:** Tap [Change] → Opens decision wizard with impact warning

---

## Mobile Interactions

| Gesture                    | Action                                  |
| -------------------------- | --------------------------------------- |
| **Swipe left** (task)      | Reveals "Mark complete" button          |
| **Pull to refresh**        | Updates all dashboard data              |
| **Swipe between tabs**     | Switches Home/Tasks/Assistant/Progress  |
| **Long press** (hero task) | Quick actions menu (view, skip, snooze) |

---

## Responsive Breakpoints

| Size                    | Layout                                       | Nav                       |
| ----------------------- | -------------------------------------------- | ------------------------- |
| **<768px** (Mobile)     | Single column, full-width cards, 16px margin | Bottom nav (fixed)        |
| **768-1024px** (Tablet) | 2-column possible, side nav slides in        | Side nav (hamburger)      |
| **>1024px** (Desktop)   | 3-column (240px + main + 280px)              | Side nav (always visible) |

---

## Animations

| Event               | Animation                                                                               |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Page load**       | Skeleton (500ms) → Header fade (100ms) → Hero scale-up (200ms) → Rest fade in           |
| **Score update**    | Pulse (300ms) → Number counts up (500ms) → Bar animates (500ms) → Confetti if milestone |
| **Task complete**   | Checkmark (300ms) → Card slides out (300ms) → Next task slides in (300ms + 200ms delay) |
| **Collapse/expand** | Height animation (300ms ease-out/200ms ease-in), chevron rotates 180°                   |

---

## Accessibility

| Feature            | Implementation                              |
| ------------------ | ------------------------------------------- |
| **Contrast**       | WCAG AA (4.5:1 small text, 3:1 large)       |
| **Focus**          | 2px blue ring with 2px offset               |
| **Screen readers** | aria-labels, live regions for score updates |
| **Keyboard nav**   | Tab order: Header → Hero CTA → Sections     |
| **Reduced motion** | Disable confetti, count-up, scale effects   |

---

## Edge Cases

| Scenario            | Display                                                     |
| ------------------- | ----------------------------------------------------------- |
| **No internet**     | "⚠️ You're offline. Progress saved locally."                |
| **API error**       | "⚠️ Something went wrong" + [Retry] [Contact support]       |
| **All tasks done**  | "🎉 Amazing work! 100% confidence. You're ready to launch." |
| **Free tier limit** | "🔒 Upgrade to continue" + plan benefits + [View plans]     |

---

## Design Tokens

```jsx
// Spacing
section: 24px, card: 16px, internal: 12px, tight: 8px, margin: 16px

// Typography
hero: 24px/700/1.3
h1: 20px/600/1.4
h2: 18px/600/1.4
body: 16px/400/1.5
small: 14px/400/1.4
tiny: 12px/500/1.3

// Colors
primary: #3B82F6 (Blue 500)
success: #22C55E (Green 500)
warning: #F97316 (Orange 500)
error: #EF4444 (Red 500)
```
