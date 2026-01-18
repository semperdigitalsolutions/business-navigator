# Design Specs

Created by: Erick Nolasco
Created time: December 25, 2025 8:13 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:52 AM
Doc Type: Design Spec
Key Info: Complete design system (colors, typography, components) + 8-week design timeline
Phase: Foundation
Priority: High

_AI Business Navigator MVP_

_Last Updated: December 25, 2025_

## Overview

This document provides comprehensive design guidelines, UI specifications, component requirements, and design principles for the AI Business Navigator MVP. The goal is to create a **clean, trustworthy, and encouraging** interface that reduces anxiety around the complex process of starting a business.

---

## Design Principles

### 1. Clarity Over Cleverness

**Problem:** 65% of survey respondents find existing tools "too complex or confusing"

**Solution:**

- Use plain language, avoid jargon
- One primary action per screen
- Clear visual hierarchy
- Obvious next steps

**Example:**

- ❌ Bad: "Initialize entity structuring"
- ✅ Good: "Choose your business structure"

### 2. Progress Visibility

**Problem:** Users feel lost and don't know how far they've come or how far they have to go

**Solution:**

- Always show overall progress (confidence score)
- Phase-level progress bars
- Task counters ("3 of 12 completed")
- Timeline estimates

### 3. Reduce Anxiety

**Problem:** Legal and financial topics are inherently stressful

**Solution:**

- Encouraging, supportive tone
- "Why this matters" explanations
- Success indicators and celebrations
- AI assistant for questions
- Clear disclaimers (not scary legalese)

### 4. Mobile-First for Monitoring, Desktop for Deep Work

**Reality:** 97% use mobile devices, but complex tasks need more screen space

**Solution:**

- Mobile: Check progress, quick updates, notifications, AI chat
- Desktop: Document generation, financial modeling, entity selection wizard
- Seamless sync between devices
- "Continue on desktop" prompts for complex tasks on mobile

### 5. Trust Through Transparency

**Problem:** AI can feel like a black box

**Solution:**

- Show AI reasoning ("I recommend LLC because...")
- Cite sources
- Allow users to override AI recommendations
- Clear disclaimers about AI limitations
- Human expert escalation path

---

## Visual Design System

### Brand Colors

**Primary Blue** (Action, Trust, Professional)

- Blue 50: `#EFF6FF`
- Blue 500: `#3B82F6` (Primary CTA)
- Blue 600: `#2563EB` (Hover)
- Blue 700: `#1D4ED8` (Active)

**Success Green** (Completed, Positive)

- Green 50: `#F0FDF4`
- Green 500: `#22C55E`
- Green 600: `#16A34A`

**Warning Orange** (Caution, Deadlines)

- Orange 50: `#FFF7ED`
- Orange 500: `#F97316`
- Orange 600: `#EA580C`

**Error Red** (Errors, Critical)

- Red 50: `#FEF2F2`
- Red 500: `#EF4444`
- Red 600: `#DC2626`

**Neutral Gray** (Text, Backgrounds)

- Gray 50: `#F9FAFB` (Page background)
- Gray 100: `#F3F4F6` (Card background)
- Gray 300: `#D1D5DB` (Borders)
- Gray 500: `#6B7280` (Secondary text)
- Gray 900: `#111827` (Primary text)

**Accent Purple** (AI features, Premium)

- Purple 50: `#FAF5FF`
- Purple 500: `#A855F7`
- Purple 600: `#9333EA`

### Typography

**Font Family:**

- **Primary:** Inter (clean, modern, excellent readability)
- **Monospace:** JetBrains Mono (for code, numbers)

**Scale:**

- Hero: 48px / 3rem (font-bold) - Landing page headlines
- H1: 32px / 2rem (font-bold) - Page titles
- H2: 24px / 1.5rem (font-semibold) - Section headers
- H3: 20px / 1.25rem (font-semibold) - Subsections
- Body: 16px / 1rem (font-normal) - Default text
- Small: 14px / 0.875rem (font-normal) - Helper text
- Tiny: 12px / 0.75rem (font-medium) - Labels, badges

**Line Height:**

- Headlines: 1.2
- Body text: 1.6 (better readability)
- Compact UI: 1.4

### Spacing System

Use 8px base unit (Tailwind defaults):

- xs: 4px (0.5)
- sm: 8px (1)
- md: 16px (2)
- lg: 24px (3)
- xl: 32px (4)
- 2xl: 48px (6)
- 3xl: 64px (8)

### Border Radius

- Small: 4px (buttons, badges)
- Medium: 8px (cards, inputs)
- Large: 12px (modals, large cards)
- Full: 9999px (pills, avatars)

### Shadows

- Small: `shadow-sm` (0 1px 2px 0 rgba(0, 0, 0, 0.05))
- Medium: `shadow-md` (0 4px 6px rgba(0, 0, 0, 0.1))
- Large: `shadow-lg` (0 10px 15px rgba(0, 0, 0, 0.1))

---

## Key Screens & Layouts

### 1. Landing Page

**Goal:** Convert visitors to signups

**Hero Section:**

- Headline: "Launch your business with confidence" (H1)
- Subheadline: "AI-powered guidance from idea to launch. Legal, funding, and planning—all in one place." (20px)
- Primary CTA: "Get started free" (Blue 500, large button)
- Secondary CTA: "See how it works" (Ghost button)
- Hero image/video: Dashboard mockup or short demo

**Social Proof:**

- "Trusted by 500+ aspiring entrepreneurs"
- Testimonials with photos (if available)
- Logos of affiliate partners ("Integrated with LegalZoom, Stripe, QuickBooks")

**Features Section:**

3-column grid (mobile: stacked)

- ✅ Personalized roadmap
- ⚖️ Legal guidance for your state
- 💰 Funding strategy tools
- 🤖 AI assistant (24/7)
- 📊 Real-time progress tracking
- 🎯 Launch confidence score

**Pricing Preview:**

- "Plans starting at $10/month"
- Link to full pricing page

**Footer:**

- Links (About, Pricing, Help, Privacy, Terms)
- Social media
- Email signup for updates

### 2. Onboarding Quiz (Multi-Step)

**Layout:**

- Progress bar at top ("Step 2 of 5")
- Question text (H2)
- Helper text below (gray 500, smaller)
- Answer options (large, card-based)
- Back + Next buttons
- "Save and continue later" link

**Step 1: Business Type**

```
What type of business are you starting?

[Card: Tech/SaaS]
  Icon: 💻
  "Software, apps, online platforms"

[Card: Service]
  Icon: 🤝
  "Consulting, freelancing, professional services"

[More coming soon badge] (Retail, F&B grayed out)
```

**Step 2: Stage**

```
Where are you in your journey?

○ I have an idea
○ I'm planning and researching
○ I'm ready to file paperwork
○ I've already launched (need structure)
```

**Step 3: Location**

```
Which state will your business be in?

[Dropdown with all 50 states]

ℹ️ Top 10 states get detailed guidance.
Others receive general guidance.
```

**Step 4: Timeline**

```
What's your timeline?

○ Side hustle (evenings and weekends)
○ Full-time focus (ready to quit job)
```

**Step 5: Funding**

```
How do you plan to fund your business?

○ Bootstrap (self-funded)
○ Seeking investment (VC, angels)
○ Applying for grants/loans
○ Not sure yet
```

**Final Screen:**

```
🚀 Creating your personalized plan...

[Loading animation]

"Analyzing your business type..."
"Checking California requirements..."
"Building your roadmap..."

[3-5 seconds, then redirect to dashboard]
```

### 3. Dashboard (Main Hub)

**Layout: 3-Column (Desktop) → Stacked (Mobile)**

**Left Sidebar (Desktop only):**

- Logo
- Navigation
  - 🏠 Dashboard
  - 💡 Ideation
  - ⚖️ Legal
  - 💰 Financial
  - 📋 Launch Checklist
  - 💬 AI Assistant
  - ⚙️ Settings
- User menu (bottom)
- Upgrade CTA (if free tier)

**Main Content Area:**

**Hero Card: Next Priority Task**

```
┌─────────────────────────────────────────┐
│ 🎯 Your next step                       │
│                                         │
│ Select your legal entity type           │
│                                         │
│ This determines your taxes, liability,  │
│ and paperwork. Takes ~15 minutes.       │
│                                         │
│ [Start now →]                           │
└─────────────────────────────────────────┘
```

**Confidence Score Widget**

```
┌─────────────────────────────────────────┐
│ Launch Confidence Score                 │
│                                         │
│         [45%]                           │
│      ●●●●●○○○○○                        │
│                                         │
│ You're 2 tasks away from 60%!          │
│                                         │
│ Category Breakdown:                     │
│ ✅ Ideation: 90%                        │
│ 🔶 Legal: 30%                           │
│ ⬜ Financial: 0%                        │
└─────────────────────────────────────────┘
```

**Progress Overview**

```
┌─────────────────────────────────────────┐
│ Your Progress                           │
│                                         │
│ Ideation & Validation                   │
│ ████████████████░░ 8 of 10              │
│                                         │
│ Legal Foundation                        │
│ ████░░░░░░░░░░░░ 2 of 12                │
│                                         │
│ Financial Infrastructure                │
│ ░░░░░░░░░░░░░░░░ 0 of 8                 │
└─────────────────────────────────────────┘
```

**Right Sidebar (Desktop) / Below Main (Mobile):**

**Upcoming Deadlines**

```
┌──────────────────────────────┐
│ ⏰ Upcoming Deadlines         │
│                              │
│ 🔴 Jan 15, 2026              │
│    Q4 Tax Estimate Due       │
│                              │
│ 🟠 Feb 1, 2026               │
│    CA Statement of Info      │
│                              │
│ 🟡 Mar 30, 2026              │
│    Review business plan      │
└──────────────────────────────┘
```

**Key Decisions**

```
┌──────────────────────────────┐
│ 📌 Key Decisions             │
│                              │
│ Legal Structure              │
│ Delaware C-Corp              │
│ [Change]                     │
│                              │
│ Funding Strategy             │
│ Bootstrapped                 │
│ [Change]                     │
└──────────────────────────────┘
```

### 4. Phase Detail View (e.g., Legal Foundation)

**Header:**

- Phase name (H1)
- Progress ("2 of 12 tasks completed")
- Estimated time remaining ("~3 hours left")

**Task List:**

Grouped by status: To Do, In Progress, Completed

```
┌─────────────────────────────────────────┐
│ ☐ Select legal entity type              │
│   15 min · High priority                │
│   [Start] [Learn more]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ☐ Check business name availability      │
│   10 min · Depends on entity selection  │
│   [Locked until entity selected]        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✓ Define your business concept          │
│   Completed Dec 20, 2025                │
│   [View] [Edit]                         │
└─────────────────────────────────────────┘
```

### 5. Entity Selection Wizard (Example Deep Task)

**Step 1: Learn**

- Explainer content
- Comparison table (LLC vs C-Corp vs S-Corp vs Sole Prop)
- Key factors: Taxes, Liability, Complexity, Cost

**Step 2: AI Recommendation**

```
🤖 Based on your Tech/SaaS business in California
with plans to seek investment, I recommend:

[Card: C-Corporation]

Why?
✓ Best for raising venture capital
✓ Unlimited shareholders
✓ Stock options for employees

⚠️ Trade-offs:
- More expensive to maintain (~$800/year in CA)
- More complex accounting (double taxation)
- Requires board meetings

[Select C-Corp] [Compare others]
```

**Step 3: Confirm**

- Review selection
- Show next steps
- Option to consult expert (affiliate link)

### 6. AI Assistant (Chat Interface)

**Floating Button:**

- Bottom right corner
- Purple gradient
- Pulse animation when idle
- Badge with "Ask me anything"

**Chat Panel (Slides in from right):**

```
┌────────────────────────────────────┐
│ 💬 AI Assistant              [×]   │
├────────────────────────────────────┤
│                                    │
│ [AI Avatar] Hi! I can help you     │
│ with any questions about           │
│ starting your business.            │
│                                    │
│ [User Avatar] What's the           │
│ difference between LLC             │
│ and C-Corp?                        │
│                                    │
│ [AI Avatar] Great question!        │
│ Here's the key difference...       │
│                                    │
│ [Suggested: Compare entity types]  │
│                                    │
├────────────────────────────────────┤
│ [Type your question...]      [→]   │
│                                    │
│ 💡 45 questions remaining (Growth) │
└────────────────────────────────────┘
```

**Context Awareness:**

- If user is on "Entity Selection" page, AI knows context
- Can reference their business type, state automatically
- Suggested questions based on current page

### 7. Pricing Page

**Layout: 3-Column Cards (Mobile: Stacked)**

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Free   │  │ Starter  │  │  Growth  │
│          │  │ [Popular]│  │          │
│   $0     │  │   $10    │  │   $19    │
│  /month  │  │  /month  │  │  /month  │
│          │  │          │  │          │
│ Features │  │ Features │  │ Features │
│ ✓ ...    │  │ ✓ ...    │  │ ✓ ...    │
│ ✓ ...    │  │ ✓ ...    │  │ ✓ ...    │
│          │  │          │  │          │
│ [Start]  │  │[Get Started]│[Get Started]│
└──────────┘  └──────────┘  └──────────┘

          ┌──────────┐
          │   Pro    │
          │          │
          │   $29    │
          │  /month  │
          │          │
          │ Features │
          │ ✓ ...    │
          │          │
          │[Get Started]│
          └──────────┘
```

**Comparison Table Below:**

- Detailed feature breakdown
- Toggle: Monthly / Annual (save 20%)

### 8. Mobile-Specific Considerations

**Navigation:**

- Bottom tab bar (5 tabs max)
  - 🏠 Home
  - ✓ Tasks
  - 💬 Assistant
  - 📊 Progress
  - ⚙️ More

**Cards:**

- Full-width on mobile
- Generous tap targets (min 44x44px)
- Swipe gestures (swipe task left to mark complete)

**Forms:**

- Large input fields
- Native date/time pickers
- Minimize typing (use selections when possible)

**Complex Tasks:**

- Show simplified mobile version
- "Open on desktop for full experience" prompt
- Save progress automatically

---

## Component Library

### Buttons

**Primary:**

- Background: Blue 500
- Text: White
- Hover: Blue 600
- Height: 44px (mobile-friendly)
- Padding: 16px 24px
- Border radius: 8px
- Font: 16px, medium weight

**Secondary:**

- Background: Gray 100
- Text: Gray 900
- Hover: Gray 200
- Same dimensions as primary

**Ghost:**

- Background: Transparent
- Text: Blue 600
- Hover: Blue 50 background
- Border: None

**Destructive:**

- Background: Red 500
- Text: White
- Hover: Red 600

**Sizes:**

- Small: 36px height, 12px 16px padding
- Medium: 44px height, 16px 24px padding (default)
- Large: 52px height, 20px 32px padding

### Cards

**Standard Card:**

- Background: White (or Gray 100 on gray backgrounds)
- Border: 1px Gray 200
- Border radius: 12px
- Padding: 24px
- Shadow: shadow-sm (subtle)
- Hover: shadow-md (lift effect)

**Interactive Card** (clickable):

- Cursor: pointer
- Hover: Border Blue 300, shadow-md
- Active: Border Blue 500

### Input Fields

**Text Input:**

- Height: 44px
- Padding: 12px 16px
- Border: 1px Gray 300
- Border radius: 8px
- Focus: Border Blue 500, ring Blue 200
- Error: Border Red 500, ring Red 200

**Label:**

- Above input
- Font: 14px, medium weight
- Color: Gray 700
- Margin bottom: 8px

**Helper Text:**

- Below input
- Font: 12px
- Color: Gray 500 (default) or Red 600 (error)

### Progress Bars

**Linear:**

- Height: 8px
- Background: Gray 200
- Fill: Blue 500 (default), Green 500 (completed), Orange 500 (warning)
- Border radius: 4px
- Animated fill (smooth transition)

**Circular (Confidence Score):**

- Use SVG circle
- Animated stroke
- Center text (large percentage)

### Badges

**Status Badge:**

- Height: 24px
- Padding: 4px 8px
- Border radius: 4px
- Font: 12px, medium weight
- Colors:
  - Success: Green 100 bg, Green 700 text
  - Warning: Orange 100 bg, Orange 700 text
  - Error: Red 100 bg, Red 700 text
  - Info: Blue 100 bg, Blue 700 text
  - Neutral: Gray 100 bg, Gray 700 text

### Tooltips

**Appearance:**

- Background: Gray 900 (90% opacity)
- Text: White, 12px
- Padding: 8px 12px
- Border radius: 6px
- Arrow pointing to trigger
- Max width: 200px

**Trigger:**

- ℹ️ icon or dotted underline
- Hover or tap to show
- Auto-hide after 5s or on click outside

### Modals

**Layout:**

- Overlay: Gray 900, 50% opacity
- Content: White card, centered
- Max width: 600px (desktop), 90% (mobile)
- Padding: 32px
- Border radius: 16px
- Close button: Top right

**Animation:**

- Fade in overlay
- Scale up modal (0.95 → 1.0)
- 200ms duration

### Empty States

**When no data:**

```
┌─────────────────────────────────┐
│                                 │
│         [Illustration]          │
│                                 │
│    No tasks completed yet       │
│                                 │
│   Complete your first task      │
│   to start tracking progress.   │
│                                 │
│      [View available tasks]     │
│                                 │
└─────────────────────────────────┘
```

**Style:**

- Friendly illustration (not generic icon)
- Headline: 18px, semibold
- Description: 14px, Gray 500
- CTA button to guide next action

### Loading States

**Skeleton Screens:**

- Use for initial page load
- Gray rectangles with shimmer animation
- Match layout of actual content

**Spinners:**

- Use for button actions
- Circular spinner, Blue 500
- Replace button text during loading

**Progress Indicators:**

- For multi-step processes (AI generation)
- Show current step and estimated time

---

## Interactions & Animations

### Micro-interactions

**Button Click:**

- Scale down to 0.98 on active
- 100ms duration

**Card Hover:**

- Lift with shadow transition
- 200ms ease-out

**Task Complete:**

- Checkbox fills with green
- Confetti animation (for milestone tasks)
- Haptic feedback on mobile

**Confidence Score Update:**

- Animate number count-up
- Progress bar fills smoothly
- Celebrate at 25%, 50%, 75%, 100%

### Page Transitions

**Route Changes:**

- Fade out old content
- Fade in new content
- 150ms duration
- No jarring movements

**Modal/Drawer:**

- Slide in from right (drawer)
- Scale + fade in (modal)
- Backdrop fade in

### Responsive Behavior

**Breakpoints:**

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Layout Shifts:**

- Sidebar → Bottom nav (mobile)
- 3-column → Stacked (mobile)
- Side panel → Full screen (mobile)

---

## Accessibility (A11y)

### Color Contrast

- Text on white: Must meet WCAG AA (4.5:1 minimum)
- Our Gray 900 on White: 16:1 ✓
- Our Blue 500 on White: 5.2:1 ✓

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Visible focus indicators (blue ring)
- Logical tab order
- ESC to close modals/drawers

### Screen Readers

- Semantic HTML (button, nav, main, article)
- ARIA labels where needed
- Alt text for all images
- Live regions for dynamic content (toast notifications)

### Motion

- Respect `prefers-reduced-motion`
- Disable animations for users who prefer reduced motion

---

## Design Deliverables

### Phase 1 (Weeks 1-2)

- [ ] Finalized color system and typography
- [ ] Component library in Figma (buttons, inputs, cards)
- [ ] Landing page design (desktop + mobile)
- [ ] Onboarding quiz flow (all 5 steps)

### Phase 2 (Weeks 3-4)

- [ ] Dashboard layouts (desktop + mobile)
- [ ] Phase detail views (Ideation, Legal, Financial)
- [ ] AI Assistant chat interface
- [ ] Empty states and loading states

### Phase 3 (Weeks 5-6)

- [ ] Entity selection wizard (full flow)
- [ ] Financial modeling tools
- [ ] Document generation preview
- [ ] Settings and profile pages

### Phase 4 (Weeks 7-8)

- [ ] Pricing page redesign (if needed)
- [ ] Upgrade prompts and paywalls
- [ ] Error states and edge cases
- [ ] Marketing website polish

---

## Tools & Workflow

**Design Tool:** Figma

- Shared workspace with developer
- Component library for consistency
- Auto-layout for responsive design
- Dev mode for handoff

**Prototyping:** Figma prototypes

- Interactive flows for key user journeys
- User testing before development

**Collaboration:**

- Weekly design reviews
- Figma comments for feedback
- Design system documentation in Figma

**Handoff:**

- Use Figma Dev Mode
- Inspect panel for measurements and code
- Export assets as SVG when possible
- Document any complex interactions

---

## Voice & Tone

**Brand Voice:**

- Encouraging, not condescending
- Expert, but not intimidating
- Supportive, like a knowledgeable friend

**Writing Guidelines:**

- Use "you" and "your" (conversational)
- Active voice, not passive
- Short sentences and paragraphs
- Break up text with headings and lists

**Examples:**

❌ **Too formal:** "To proceed with entity selection, the user must complete the prerequisite tasks."

✅ **Just right:** "First, complete these tasks to choose your business structure."

❌ **Too casual:** "Yo! Let's get this business rolling! 🎉"

✅ **Just right:** "Great! Let's start building your business."

❌ **Too scary:** "WARNING: Choosing the wrong entity type can result in significant tax penalties."

✅ **Just right:** "Your entity type affects your taxes and liability. We'll help you choose the right one."

---

## Testing & Iteration

**Usability Testing:**

- Test with 5 users per persona
- Task-based testing ("Sign up and complete onboarding")
- Think-aloud protocol
- Note pain points and confusion

**A/B Testing (Post-Launch):**

- CTA button text
- Pricing page layout
- Onboarding flow variations
- Dashboard hero task prominence

**Metrics to Track:**

- Signup conversion rate
- Onboarding completion rate
- Time to first task completion
- Feature discovery (% who use AI Assistant)
- Upgrade conversion by design variation

---

## Additional Resources

**Design Inspiration:**

- Linear (clean, modern SaaS)
- Stripe (clarity, trust)
- Notion (flexible, friendly)
- Loom (encouraging, accessible)

**Figma File:**

- [Link to shared Figma project - to be added]

**Design System:**

- [Link to component library - to be added]
