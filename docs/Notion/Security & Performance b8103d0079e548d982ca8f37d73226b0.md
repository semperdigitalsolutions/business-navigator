# Security & Performance

Created by: Erick Nolasco
Created time: January 5, 2026 4:39 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 4:43 PM
Doc Type: Technical Spec
Key Info: Security requirements, performance benchmarks, load testing & compliance checklist
Phase: Foundation
Priority: Critical

Security and performance requirements for Business Navigator MVP.

---

## Security Requirements

### Authentication & Authorization

| **Requirement**       | **Implementation**                                  | **Status** |
| --------------------- | --------------------------------------------------- | ---------- |
| Secure authentication | Clerk handles all auth (OAuth, email/password, MFA) | ☐          |
| Session management    | JWT tokens with 7-day expiry, httpOnly cookies      | ☐          |
| Password requirements | Min 8 chars, enforced by Clerk                      | ☐          |
| OAuth providers       | Google (others post-MVP)                            | ☐          |
| Role-based access     | Admin vs User roles (admin dashboard protected)     | ☐          |

### Data Protection

| **Data Type**          | **Protection Method**                           | **Status** |
| ---------------------- | ----------------------------------------------- | ---------- |
| **EIN (Employer ID)**  | Encrypted at rest (AES-256), never logged       | ☐          |
| **SSN (if collected)** | Encrypted at rest, minimal retention            | ☐          |
| **Payment info**       | Never stored (Stripe handles), PCI compliant    | ☐          |
| **Business plans**     | User-owned data, encrypted in transit (TLS 1.3) | ☐          |
| **Email addresses**    | Hashed for lookup, encrypted at rest            | ☐          |
| **API keys**           | Environment variables only, never in code       | ☐          |

### OWASP Top 10 Checklist

| **Vulnerability**                         | **Mitigation**                                 | **Verified** |
| ----------------------------------------- | ---------------------------------------------- | ------------ |
| **SQL Injection**                         | Prisma ORM (parameterized queries)             | ☐            |
| **XSS (Cross-Site Scripting)**            | React auto-escapes, sanitize user input        | ☐            |
| **CSRF (Cross-Site Request Forgery)**     | CSRF tokens on all forms                       | ☐            |
| **Insecure Deserialization**              | Validate all JSON payloads, use schemas        | ☐            |
| **Broken Authentication**                 | Clerk handles, session timeout enforced        | ☐            |
| **Sensitive Data Exposure**               | TLS everywhere, encrypt PII at rest            | ☐            |
| **Broken Access Control**                 | Middleware checks user ID on all routes        | ☐            |
| **Security Misconfiguration**             | No default passwords, no debug in prod         | ☐            |
| **Insufficient Logging**                  | Log all auth attempts, errors, admin actions   | ☐            |
| **Components with Known Vulnerabilities** | Dependabot enabled, update dependencies weekly | ☐            |

### API Security

| **Control**        | **Implementation**                           | **Status** |
| ------------------ | -------------------------------------------- | ---------- |
| Rate limiting      | 100 req/min per user, 1000 req/min per IP    | ☐          |
| API authentication | Bearer token required for all endpoints      | ☐          |
| Input validation   | Zod schemas for all API inputs               | ☐          |
| Error handling     | Never expose stack traces or internal errors | ☐          |
| CORS               | Whitelist production domain only             | ☐          |

---

## Compliance Checklist

### GDPR (EU Users)

| **Requirement**     | **Implementation**                        | **Status** |
| ------------------- | ----------------------------------------- | ---------- |
| User consent        | Cookie banner with accept/reject          | ☐          |
| Right to access     | Export all user data (JSON/PDF)           | ☐          |
| Right to deletion   | Delete account button, 30-day retention   | ☐          |
| Data portability    | Export in machine-readable format (JSON)  | ☐          |
| Breach notification | Within 72 hours, email all affected users | ☐          |
| Privacy Policy      | Published, lawyer-reviewed                | ☐          |

### CCPA (California Users)

| **Requirement**       | **Implementation**                              | **Status** |
| --------------------- | ----------------------------------------------- | ---------- |
| "Do Not Sell My Info" | We don't sell data (disclose in Privacy Policy) | ☐          |
| Right to know         | Disclose what data we collect (Privacy Policy)  | ☐          |
| Right to delete       | Same as GDPR (delete account)                   | ☐          |
| Opt-out of sale       | N/A (we don't sell data)                        | ☐          |

### SOC 2 (Future - Enterprise Customers)

**Not required for MVP, but plan for:**

- Audit logs (all data access, changes)
- Encryption at rest and in transit
- Access control reviews (quarterly)
- Incident response documentation
- Vendor security assessments (Stripe, Clerk, etc.)

---

## Performance Requirements

### Page Load Benchmarks

| **Page**     | **First Contentful Paint (FCP)** | **Time to Interactive (TTI)** | **Target** |
| ------------ | -------------------------------- | ----------------------------- | ---------- |
| Landing page | <1.5s                            | <3s                           | ☐          |
| Dashboard    | <2s                              | <3.5s                         | ☐          |
| Task detail  | <1.5s                            | <3s                           | ☐          |
| AI Chat      | <1s                              | <2s (excluding AI response)   | ☐          |

**Test on:** 3G connection (Slow 3G in Chrome DevTools)

**Measure with:** Lighthouse, WebPageTest

### API Response Times

| **Endpoint**              | **p50** | **p95** | **p99** |
| ------------------------- | ------- | ------- | ------- |
| `GET /api/user`           | <100ms  | <300ms  | <500ms  |
| `GET /api/tasks`          | <150ms  | <400ms  | <800ms  |
| `POST /api/task/complete` | <200ms  | <500ms  | <1s     |
| `POST /api/chat` (AI)     | <2s     | <5s     | <10s    |
| `POST /api/export/pdf`    | <3s     | <8s     | <15s    |

### Database Query Performance

| **Query Type**             | **Target Time** | **Index Required**                  |
| -------------------------- | --------------- | ----------------------------------- |
| User lookup by ID          | <10ms           | Primary key (auto)                  |
| Business plan by user      | <20ms           | user_id                             |
| All tasks for user         | <50ms           | user_id, composite (user_id, phase) |
| Chat history               | <100ms          | user_id, created_at                 |
| Admin dashboard aggregates | <500ms          | Various (created_at, plan_tier)     |

---

## Load Testing

### Test Scenarios

| **Scenario**    | **Concurrent Users** | **Duration** | **Success Criteria**                          |
| --------------- | -------------------- | ------------ | --------------------------------------------- |
| **Smoke Test**  | 10                   | 5 min        | 0 errors, <3s response times                  |
| **Load Test**   | 100                  | 15 min       | <1% error rate, <5s response times            |
| **Stress Test** | 500                  | 10 min       | Identify breaking point, graceful degradation |
| **Spike Test**  | 0→200→0              | 5 min        | System recovers, no crashes                   |

**Tools:** k6, Artillery, or Locust

### User Flow to Test

1. **Signup → Onboarding (5 min)**
   - Create account
   - Complete 7-step quiz
   - View dashboard
2. **Task Completion (10 min)**
   - View Phase 1 task list
   - Complete task (submit form)
   - Verify auto-save
   - Check confidence score update
3. **AI Assistant (5 min)**
   - Open chat
   - Ask question
   - Wait for response
   - Close chat
4. **Payment (3 min)**
   - Click upgrade
   - Complete Stripe checkout
   - Verify plan upgrade

**Total test duration:** 23 minutes per virtual user

---

## Monitoring & Observability

### Key Metrics to Track

| **Category**    | **Metric**                | **Tool**           | **Alert Threshold** |
| --------------- | ------------------------- | ------------------ | ------------------- |
| **Uptime**      | Availability              | Vercel             | <99% uptime         |
| **Performance** | API response time (p95)   | PostHog            | >3s                 |
|                 | Page load time (FCP)      | Vercel Analytics   | >3s                 |
| **Errors**      | Error rate                | Sentry or Vercel   | >5%                 |
|                 | 500 errors                | Logs               | >10/hour            |
| **Database**    | Query time (slow queries) | Database logs      | >2s                 |
|                 | Connection pool usage     | Database dashboard | >80%                |
| **Costs**       | OpenAI API daily cost     | OpenAI dashboard   | >$50/day            |
|                 | Vercel bandwidth          | Vercel dashboard   | >80% of limit       |

### Logging Strategy

**What to log:**

- ✅ All API requests (endpoint, user, response time, status)
- ✅ Authentication events (login, logout, failed attempts)
- ✅ Payment events (initiated, succeeded, failed)
- ✅ Errors (stack trace, user context, request data)
- ✅ Admin actions (database changes, user modifications)

**What NOT to log:**

- ❌ Passwords (even hashed)
- ❌ Payment card numbers
- ❌ Full EIN/SSN (last 4 digits only)
- ❌ API keys

**Log retention:**

- 30 days (free tier)
- 90 days (paid tier, consider after beta)

---

## Security Testing Plan

### Pre-Launch Security Audit

| **Test**              | **How**                                      | **Status** |
| --------------------- | -------------------------------------------- | ---------- |
| Penetration testing   | Use OWASP ZAP or hire contractor             | ☐          |
| Dependency audit      | `npm audit` + Dependabot                     | ☐          |
| Secret scanning       | Check for exposed keys in code/logs          | ☐          |
| SQL injection test    | Test all form inputs with ' and "            | ☐          |
| XSS test              | Test all inputs with <script> tags           | ☐          |
| CSRF test             | Verify tokens on all state-changing requests | ☐          |
| Authentication bypass | Try accessing protected routes without auth  | ☐          |
| Authorization bypass  | Try accessing other users' data              | ☐          |

### Ongoing Security Practices

- **Weekly:** Review Dependabot alerts, update vulnerable packages
- **Monthly:** Review access logs for suspicious activity
- **Quarterly:** Full security audit, penetration testing
- **Post-incident:** Immediate security review if breach/vulnerability discovered

---

## Performance Optimization Checklist

### Frontend

- [ ] Code splitting (Next.js automatic)
- [ ] Image optimization (Next.js Image component)
- [ ] Lazy load images below the fold
- [ ] Minify CSS/JS (build step)
- [ ] Tree shaking (remove unused code)
- [ ] Font optimization (subset fonts, preload)
- [ ] Service worker for offline (PWA)
- [ ] Cache static assets (1 year expiry)

### Backend

- [ ] Database indexes on foreign keys
- [ ] Connection pooling configured
- [ ] API response caching (Redis if needed)
- [ ] Compress API responses (gzip)
- [ ] Paginate large result sets
- [ ] Batch database queries where possible
- [ ] Optimize N+1 queries

### Third-Party

- [ ] CDN configured (Vercel Edge Network)
- [ ] DNS prefetch for external domains
- [ ] Lazy load third-party scripts (analytics)
- [ ] Defer non-critical JavaScript

---

## Disaster Recovery

### Backup Strategy

| **Data**      | **Frequency**             | **Retention** | **Location**                      |
| ------------- | ------------------------- | ------------- | --------------------------------- |
| Database      | Daily (automated)         | 30 days       | Database provider (Supabase/Neon) |
| User uploads  | Real-time (S3 versioning) | 90 days       | AWS S3 or Vercel Blob             |
| Configuration | On change (Git)           | Forever       | GitHub                            |

### Recovery Time Objectives (RTO)

- **Database failure:** 1 hour (restore from backup)
- **Server failure:** 15 minutes (Vercel auto-scales, redeploy if needed)
- **Data corruption:** 4 hours (identify issue, restore from backup)

### Recovery Point Objectives (RPO)

- **Acceptable data loss:** <24 hours (daily backups)
- **Critical data:** <1 hour (transaction logs, real-time backups)

---

## Compliance & Legal

### Required Legal Documents

- [ ] Terms of Service (lawyer-reviewed)
- [ ] Privacy Policy (GDPR/CCPA compliant)
- [ ] Cookie Policy (if using tracking cookies)
- [ ] Acceptable Use Policy
- [ ] Disclaimer ("Not legal/tax advice")

### Data Processing Agreements

**Third-party processors:** Stripe, Clerk, OpenAI, Resend, Vercel

- [ ] Review each vendor's DPA
- [ ] Ensure GDPR-compliant subprocessors
- [ ] Document data flows (where does data go?)
- [ ] Maintain vendor security assessment records
