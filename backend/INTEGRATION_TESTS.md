# Phase 4: Integration & Testing Guide

## Prerequisites

- Backend server running on http://localhost:3000
- Frontend server running on http://localhost:5173
- PostgreSQL database with all migrations applied
- OpenRouter/OpenAI/Anthropic API key configured

## Test Flow 1: New User Registration → Onboarding → Dashboard

### Steps:

1. Navigate to http://localhost:5173/register
2. Fill in registration form:
   - Email: test@example.com
   - Password: TestPass123!
   - First Name: Test
   - Last Name: User
3. Click "Sign up"
4. **Expected**: Redirected to `/onboarding`

### Onboarding Wizard Testing:

5. **Step 1: Business Name**
   - Enter: "Acme Tech Solutions"
   - Click "Continue" or skip (name is optional)
6. **Step 2: Business Category**
   - Select "Tech/SaaS"
   - Select current stage: "Idea"
   - Click "Continue"
7. **Step 3: State Selection**
   - Search for "California"
   - Select "CA"
   - Click "Continue"
8. **Step 4: Primary Goals**
   - Check multiple goals (max 5)
   - Click "Continue"
9. **Step 5: Timeline & Team**
   - Select timeline: "Within 3 months"
   - Enter team size: 2
   - Click "Continue"
10. **Step 7: Final Details**
    - Funding: "Personal Savings"
    - Experience: "First Business"
    - Primary Concern: "Legal"
    - Click "Complete Onboarding"

### AI Plan Generation:

11. **Expected**: Loading animation with sparkles icon
12. **Expected**: After 3-5 seconds, completion screen appears
13. **Expected**: Success message with checkmarks
14. Click "Continue to Dashboard"

### Dashboard Verification:

15. **Expected**: Redirected to `/dashboard`
16. **Verify**: Greeting header displays "Welcome back, Test!"
17. **Verify**: Hero Task Card shows first high-priority task
18. **Verify**: Confidence Score widget shows initial score (5-15%)
19. **Verify**: Phase breakdown (Ideation, Legal, Financial, Launch Prep)
20. **Verify**: Quick Stats shows total/completed/in-progress tasks

### Auto-Save Testing:

21. Go back to `/onboarding` (should redirect to dashboard if completed)
22. Log out
23. Log back in
24. **Expected**: Should go directly to dashboard, not onboarding

## Test Flow 2: Login → Resume Incomplete Onboarding → Complete

### Steps:

1. Create new user (follow steps 1-3 from Flow 1)
2. In onboarding, complete only steps 1-3
3. Close browser/log out
4. Navigate to http://localhost:5173/login
5. Log in with same credentials
6. **Expected**: Redirected to `/onboarding`
7. **Expected**: Progress bar shows 3/7 steps completed
8. **Expected**: Current step is 4 (Primary Goals)
9. Complete remaining steps 4-7
10. **Expected**: AI plan generation and completion

## Test Flow 3: Dashboard Interactions

### Hero Task Completion:

1. On dashboard, click "Mark Complete" on hero task
2. **Expected**: Optimistic update (task disappears immediately)
3. **Expected**: Next hero task appears
4. **Expected**: Confidence score updates

### Hero Task Skip:

1. Click "Skip for Now" on hero task
2. **Expected**: Task is hidden for 24 hours
3. **Expected**: Next available task becomes hero

### Confidence Score:

1. Click "Show Details" on confidence score
2. **Expected**: Phase breakdown expands with progress bars
3. **Expected**: Each phase shows percentage (Ideation, Legal, Financial, Launch Prep)

## Test Flow 4: Security Testing

### Rate Limiting:

1. Make 15 rapid login attempts with wrong password
2. **Expected**: After 10 attempts, receive rate limit error
3. **Expected**: "Too many requests" message

### Password Strength:

1. On registration, try weak password: "123456"
2. **Expected**: Error: "Password must contain uppercase, lowercase, numbers"
3. **Expected**: Password strength meter shows "Weak" (red)
4. Try strong password: "MySecure123!Pass"
5. **Expected**: Strength meter shows "Strong" (green)

### OAuth Flow (if Google OAuth enabled):

1. Click "Continue with Google"
2. **Expected**: Redirected to Google consent screen
3. Approve access
4. **Expected**: Redirected back with state parameter
5. **Expected**: User created and logged in
6. **Expected**: Redirected to onboarding

### Input Sanitization:

1. Try entering XSS in business name: `<script>alert('xss')</script>`
2. **Expected**: Sanitized on display (no script execution)
3. Try SQL injection in email: `test'; DROP TABLE users;--`
4. **Expected**: Validation error or safe handling

## Test Flow 5: Navigation

### Desktop Navigation:

1. On desktop (> 768px), verify sidebar appears
2. Click each nav item: Home, Tasks, Assistant, Progress, Settings
3. **Expected**: Active tab highlighted
4. Click collapse button
5. **Expected**: Sidebar collapses to icon-only view

### Mobile Navigation:

1. On mobile (< 768px), verify bottom nav appears
2. **Expected**: 5 tabs visible: Home, Tasks, Assistant, Progress, More
3. Tap each tab
4. **Expected**: Active tab highlighted with accent color
5. **Expected**: Badge counts display if present

## Test Flow 6: Error Handling

### API Errors:

1. Stop backend server
2. Try to complete onboarding
3. **Expected**: Error message displayed
4. **Expected**: "Failed to complete onboarding" or network error
5. Start backend server
6. **Expected**: Can retry successfully

### LangGraph Timeout:

1. Set LLM API key to invalid value
2. Complete onboarding
3. **Expected**: Falls back to template-based plan generation
4. **Expected**: Dashboard still loads with basic plan

### Database Connection Loss:

1. Stop PostgreSQL
2. Try to save onboarding progress
3. **Expected**: Error displayed
4. **Expected**: localStorage still has data
5. Restart PostgreSQL
6. **Expected**: Next save succeeds

## Test Flow 7: Cross-Device Resume

### Setup:

1. On Device A (e.g., laptop), start onboarding
2. Complete steps 1-4
3. Note the email/password

### Resume on Device B:

1. On Device B (e.g., mobile), navigate to app
2. Log in with same credentials
3. **Expected**: Redirected to onboarding
4. **Expected**: Progress shows 4/7 completed
5. **Expected**: Current step is 5
6. Complete remaining steps
7. **Expected**: Dashboard loads

## Success Criteria

### Functional:

- [ ] Registration → Onboarding → Dashboard flow works end-to-end
- [ ] Onboarding auto-saves every 2 seconds
- [ ] Cross-device resume works correctly
- [ ] AI plan generation completes in < 5 seconds (P95)
- [ ] Hero task completion updates confidence score
- [ ] Navigation works on mobile and desktop

### Security:

- [ ] Rate limiting enforced (10 auth requests/min)
- [ ] Password strength validated
- [ ] OAuth state parameter validated (if enabled)
- [ ] XSS attempts sanitized
- [ ] SQL injection attempts handled safely

### Performance:

- [ ] Dashboard loads in < 2 seconds
- [ ] Onboarding step transitions instant (< 100ms)
- [ ] Auto-save debounce works (2s delay)
- [ ] No jank or lag on mobile

### UI/UX:

- [ ] Loading states shown during async operations
- [ ] Error messages clear and actionable
- [ ] Success feedback immediate
- [ ] Responsive on all screen sizes (320px - 2560px)
- [ ] Dark mode works correctly

## Known Issues & Limitations

1. **TypeScript Errors**: Supabase type inference issues in backend (non-blocking)
2. **OAuth**: Google OAuth requires additional setup (client ID, secret)
3. **Email Verification**: Supabase email confirmation disabled for testing
4. **AI Models**: Requires OpenRouter API key or user-provided keys

## Next Steps After Testing

1. Fix any critical bugs discovered
2. Add error boundaries for graceful failure handling
3. Implement loading skeletons for better perceived performance
4. Add analytics tracking for user flows
5. Write automated E2E tests with Playwright/Cypress

## Testing Checklist

Copy this checklist and mark items as you test:

```
[ ] Test Flow 1: Registration → Onboarding → Dashboard
[ ] Test Flow 2: Resume incomplete onboarding
[ ] Test Flow 3: Dashboard interactions (hero task, confidence)
[ ] Test Flow 4: Security (rate limiting, passwords, OAuth)
[ ] Test Flow 5: Navigation (desktop sidebar, mobile bottom nav)
[ ] Test Flow 6: Error handling (API, LangGraph, DB)
[ ] Test Flow 7: Cross-device resume
[ ] Verify all success criteria met
```
