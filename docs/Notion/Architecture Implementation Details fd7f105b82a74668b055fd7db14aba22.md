# Architecture Implementation Details

Created by: Erick Nolasco
Created time: January 8, 2026 5:40 PM
Last edited by: Erick Nolasco
Last updated time: January 8, 2026 7:28 PM
Doc Type: Technical Spec
Key Info: Middleware, caching, file uploads, API structure - implementation clarifications
Phase: Foundation
Priority: High

Implementation clarifications based on dev partner's architecture diagrams.

---

## Purpose

This doc clarifies technical implementation details shown in the dev's architecture diagrams that weren't fully specified in our original Tech Stack doc.[[1]](https://www.notion.so/Tech-Stack-8fbbfa3e0f6e47e781bb6ab70df89c5c?pvs=21)

---

## Middleware Layer

### What It Does

Sits between the frontend and API routes to handle cross-cutting concerns.

### Implementation

**File:** `middleware.ts` (Next.js 14 App Router)

```tsx
import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default authMiddleware({
  // Public routes (no auth required)
  publicRoutes: [
    '/',
    '/login',
    '/signup',
    '/api/webhooks/(.*)' // Stripe, Clerk webhooks
  ],

  // Protected routes (require auth)
  protectedRoutes: [
    '/dashboard',
    '/tasks',
    '/chat',
    '/more',
    '/api/(?!webhooks)(.*)' // All API routes except webhooks
  ],

  afterAuth(auth, req) {
    // Handle authenticated requests
    if (auth.userId && !auth.isPublicRoute) {
      // Add rate limiting
      return applyRateLimit(auth.userId, req);
    }

    // Redirect unauthenticated users to login
    if (!auth.userId && !auth.isPublicRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', req.url);
      return NextResponse.redirect(loginUrl);
    }

    return [NextResponse.next](http://NextResponse.next)();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Key Functions

**1. Authentication (Clerk)**

- Validates session tokens on every request
- Redirects unauthenticated users to login
- Attaches `userId` to request context

**2. Rate Limiting**

- Prevents abuse of API routes
- Different limits per user tier (Free, Starter, Growth)
- Uses Vercel KV (Redis) for counters

**3. Request Logging**

- Logs all API requests (method, path, userId, timestamp)
- Used for debugging and analytics
- Sent to PostHog for monitoring

---

## Rate Limiting

### Strategy

**Use Vercel KV (Redis)** for distributed rate limiting across serverless functions.

### Limits by Tier

| **Tier** | **API Requests** | **AI Messages** | **Exports** |
| -------- | ---------------- | --------------- | ----------- |
| Free     | 100/hour         | 10/day          | 1/day       |
| Starter  | 500/hour         | 50/day          | 5/day       |
| Growth   | 2000/hour        | Unlimited       | 20/day      |
| Pro      | 5000/hour        | Unlimited       | Unlimited   |

### Implementation

```tsx
import { kv } from '@vercel/kv';

async function applyRateLimit(userId: string, req: NextRequest) {
  const tier = await getUserTier(userId);
  const limits = RATE_LIMITS[tier];

  // Check API rate limit
  const apiKey = `rate-limit:api:${userId}:${getHour()}`;
  const apiCount = await kv.incr(apiKey);
  await kv.expire(apiKey, 3600); // 1 hour

  if (apiCount > limits.api) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  // Check AI message limit (if chat endpoint)
  if (req.url.includes('/api/chat')) {
    const aiKey = `rate-limit:ai:${userId}:${getDay()}`;
    const aiCount = await kv.incr(aiKey);
    await kv.expire(aiKey, 86400); // 1 day

    if (aiCount > [limits.ai](http://limits.ai) && [limits.ai](http://limits.ai) !== -1) {
      return new NextResponse(
        JSON.stringify({
          error: 'Daily AI message limit reached',
          limit: [limits.ai](http://limits.ai),
          resetAt: getNextDayTimestamp()
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return [NextResponse.next](http://NextResponse.next)();
}
```

---

## Caching Strategy

### What to Cache

**1. User Session Data (Vercel KV)**

- User ID, email, tier
- TTL: 1 hour
- Reduces calls to Clerk API

**2. Task Metadata (Vercel KV)**

- Task definitions (title, description, phase)
- TTL: 24 hours (static content)
- Reduces database queries

**3. AI Context Payload (Vercel KV)**

- Frequently accessed user context
- TTL: 5 minutes
- Reduces database queries for chat

**4. API Responses (Next.js Cache)**

- Dashboard data (confidence score, progress)
- TTL: 1 minute
- Uses Next.js `unstable_cache`

### Implementation

```tsx
import { unstable_cache } from 'next/cache'
import { kv } from '@vercel/kv'

// Cache dashboard data
export const getDashboardData = unstable_cache(
  async (userId: string) => {
    return await fetchDashboardFromDB(userId)
  },
  ['dashboard'],
  { revalidate: 60, tags: [`dashboard-${userId}`] }
)

// Cache AI context
export async function getAIContext(userId: string) {
  const cached = await kv.get(`ai-context:${userId}`)
  if (cached) return cached

  const context = await buildContextFromDB(userId)
  await kv.set(`ai-context:${userId}`, context, { ex: 300 }) // 5 min
  return context
}

// Invalidate cache on task completion
export async function invalidateUserCache(userId: string) {
  await kv.del(`ai-context:${userId}`)
  revalidateTag(`dashboard-${userId}`)
}
```

---

## File Upload Flow

### Architecture

**Direct Upload to Vercel Blob** (not through API routes)

```
User uploads file
    ↓
1. Request signed upload URL from API
    ↓
2. API generates signed URL (Vercel Blob)
    ↓
3. Frontend uploads directly to Vercel Blob
    ↓
4. Frontend notifies API of upload completion
    ↓
5. API saves metadata to database
```

### Why Direct Upload?

✅ **Pros:**

- Faster (no API proxy)
- Cheaper (no serverless bandwidth costs)
- Scalable (doesn't hit API route limits)

❌ **Cons:**

- Slightly more complex client code
- Requires CORS configuration

### Implementation

**Step 1: Request Upload URL**

```tsx
// API Route: /api/documents/upload-url
export async function POST(req: Request) {
  const { userId } = auth()
  const { filename, contentType } = await req.json()

  // Validate file type
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  // Generate signed URL
  const { url, token } = await put(filename, '', {
    access: 'public',
    token: true,
    addRandomSuffix: true,
  })

  return NextResponse.json({ uploadUrl: url, token })
}
```

**Step 2: Upload from Client**

```tsx
// Frontend
async function uploadFile(file: File) {
  // Get upload URL
  const { uploadUrl, token } = await fetch('/api/documents/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      filename: [file.name](http://file.name),
      contentType: file.type
    })
  }).then(r => r.json());

  // Upload directly to Vercel Blob
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'Authorization': `Bearer ${token}`
    }
  });

  // Notify API of completion
  await fetch('/api/documents', {
    method: 'POST',
    body: JSON.stringify({
      url: uploadUrl,
      filename: [file.name](http://file.name),
      size: file.size,
      type: file.type
    })
  });
}
```

**Step 3: Save Metadata**

```tsx
// API Route: /api/documents
export async function POST(req: Request) {
  const { userId } = auth()
  const { url, filename, size, type } = await req.json()

  // Save to database
  await prisma.document.create({
    data: {
      userId,
      storageUrl: url,
      fileName: filename,
      fileSize: size,
      mimeType: type,
      documentType: inferDocumentType(filename),
    },
  })

  return NextResponse.json({ success: true })
}
```

---

## API Route Structure

### Organization

```
app/api/
├── auth/
│   └── webhooks/
│       └── clerk/route.ts        # Clerk webhook handler
├── chat/
│   └── route.ts                  # POST: Send AI message
├── dashboard/
│   └── route.ts                  # GET: Dashboard data
├── tasks/
│   ├── route.ts                  # GET: List all tasks
│   └── [id]/
│       ├── route.ts              # GET/PATCH: Task detail/update
│       └── complete/route.ts     # POST: Mark complete
├── documents/
│   ├── route.ts                  # POST: Save metadata
│   ├── upload-url/route.ts       # POST: Get signed upload URL
│   └── [id]/route.ts             # GET/DELETE: Document detail
├── export/
│   ├── pdf/route.ts              # POST: Generate PDF
│   └── excel/route.ts            # POST: Generate Excel
├── payments/
│   ├── checkout/route.ts         # POST: Create Stripe session
│   ├── portal/route.ts           # POST: Customer portal link
│   └── webhooks/
│       └── stripe/route.ts       # POST: Stripe webhook handler
└── onboarding/
    └── route.ts                  # POST: Submit quiz
```

### Standard Response Format

```tsx
// Success
{
  "success": true,
  "data": { /* payload */ }
}

// Error
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You've reached your daily AI message limit",
    "details": {
      "limit": 10,
      "resetAt": "2026-01-06T00:00:00Z"
    }
  }
}
```

### Error Handling

```tsx
// Centralized error handler
function handleAPIError(error: unknown) {
  console.error(error)

  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: error.message } },
      { status: 429 }
    )
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: error.message } },
      { status: 400 }
    )
  }

  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  // Generic error
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
    { status: 500 }
  )
}
```

---

## Database Connection Pooling

### Issue

Serverless functions can exhaust database connections if not managed properly.

### Solution

**Prisma Connection Pooling** + **Supabase Pooler Mode**

```tsx
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1',
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Connection Limits:**

- Development: 1 connection per function instance
- Production: 1 connection per function instance (via PgBouncer)
- Max total: 100 connections (Supabase free tier)

---

## Environment Variables (Updated)

Based on dev's architecture, we need these additional env vars:

```bash
# Existing (from Tech Stack doc)
DATABASE_URL=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
POSTHOG_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# NEW: Additional for architecture
KV_URL=                              # Vercel KV (Redis) for caching
KV_REST_API_URL=                      # Vercel KV REST API
KV_REST_API_TOKEN=                    # Vercel KV token
BLOB_READ_WRITE_TOKEN=                # Vercel Blob storage token
NEXT_PUBLIC_BLOB_URL=                 # Vercel Blob public URL
SENTRY_DSN=                           # Error tracking (optional)
NEXT_PUBLIC_APP_URL=                  # Your app URL (for redirects)
```

---

## Monitoring & Observability

### What to Monitor

**1. API Performance**

- Response times (p50, p95, p99)
- Error rates by endpoint
- Rate limit hits

**2. Database**

- Query times
- Connection pool usage
- Slow queries (>1s)

**3. External Services**

- OpenAI API latency & errors
- Stripe webhook failures
- Clerk auth failures

**4. Business Metrics**

- AI messages used (by tier)
- Task completion rates
- Export generation success rate

### Tools

**PostHog:** User analytics + performance monitoring

**Sentry:** Error tracking & alerting

**Vercel Analytics:** Core Web Vitals

**Prisma Studio:** Database inspection

---

## Security Considerations

### API Route Security

**1. Authentication (All Routes Except Webhooks)**

```tsx
import { auth } from '@clerk/nextjs'

export async function GET(req: Request) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  // ... rest of handler
}
```

**2. Authorization (User Can Only Access Their Data)**

```tsx
const plan = await prisma.businessPlan.findUnique({
  where: { id: planId, userId }, // Ensures user owns this plan
})

if (!plan) {
  return new NextResponse('Not found', { status: 404 })
}
```

**3. Input Validation**

```tsx
import { z } from 'zod'

const taskUpdateSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'complete', 'skipped']),
  completionData: z.record(z.unknown()).optional(),
})

const body = taskUpdateSchema.parse(await req.json())
```

**4. Webhook Verification**

```tsx
// Stripe webhook
import { headers } from 'next/headers'
import Stripe from 'stripe'

const sig = headers().get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  await req.text(),
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

---

## Summary of Changes

### What We're Adding to Documentation:

✅ **Middleware layer** - Auth, rate limiting, logging

✅ **Caching strategy** - Vercel KV for session/context data

✅ **Direct file uploads** - Signed URLs to Vercel Blob

✅ **Rate limiting** - Per-tier limits with Vercel KV

✅ **API structure** - Route organization & error handling

✅ **Connection pooling** - Prisma + PgBouncer config

✅ **Additional env vars** - KV, Blob, Sentry

✅ **Security patterns** - Auth, validation, webhook verification

### What Stays the Same:

✅ Core tech stack (Next.js, PostgreSQL, Clerk, Stripe, OpenAI)

✅ Database schema (9 tables)

✅ External services

✅ Overall architecture

---

## Next Steps

**For Dev:**

1. Review this doc alongside your architecture diagrams
2. Confirm Vercel KV vs alternative for caching
3. Confirm Vercel Blob vs S3 for file storage
4. Set up all environment variables

**For Erick:**

1. Review and approve these technical decisions
2. Decide on monitoring tools (PostHog + Sentry recommended)
3. Approve rate limits per tier

Questions? Let's discuss! 🚀
