# Operations Guide

Created by: Erick Nolasco
Created time: January 5, 2026 4:39 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 4:43 PM
Doc Type: Planning Doc
Key Info: Support playbook, analytics tracking, monitoring & incident response procedures
Phase: Polish & Launch
Priority: Critical

Operational procedures for running Business Navigator post-launch.

---

## Customer Support Playbook

### Support Channels

| **Channel**              | **Use Case**                | **Response Time**   | **Owner** |
| ------------------------ | --------------------------- | ------------------- | --------- |
| **In-app bug reporting** | Technical issues, bugs      | 24 hours            | [Dev]     |
| **Email** (support@)     | General questions, billing  | 24 hours            | [Support] |
| **AI Chat**              | Product questions, guidance | Instant (automated) | [AI]      |
| **Help docs**            | Self-service                | N/A                 | [Content] |

**Beta SLA:** 24-hour response time, 7 days/week

**Post-beta:** 24 hours weekdays, 48 hours weekends

---

## Common Issues & Solutions

### Tier 1 (Can Answer Immediately)

| **Issue**                             | **Solution**                | **Response Template**                                                                                                                                                                                         |
| ------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "I didn't receive verification email" | Check spam, resend email    | Hi [Name], check your spam folder for "AI Business Navigator". If still not there, I can resend: [Resend button]. The email comes from [noreply@businessnavigator.com](mailto:noreply@businessnavigator.com). |
| "How do I change my business name?"   | Go to Task 1.8, edit answer | You can update your business name in Task 1.8 ("Choose Your Business Name"). Click "Edit answer" and save. This won't affect tasks you've already completed.                                                  |
| "What's my AI question limit?"        | Explain plan limits         | Your [Plan] includes [X] AI questions per week. You've used [Y] so far. Limit resets every Monday. Upgrade to Growth for unlimited: [Link]                                                                    |
| "How do I cancel my subscription?"    | Link to billing page        | Go to Settings → Billing → Manage Subscription → Cancel. You'll keep access until [end date] and your data is safe. Need help with anything? I'm here.                                                        |
| "Can I pause my subscription?"        | Not available yet           | We don't have a pause option yet (coming soon!). For now, you can cancel and reactivate anytime without losing data. Want me to help you cancel?                                                              |

### Tier 2 (Needs Investigation)

| **Issue**                  | **Steps to Investigate**            | **Escalation** |
| -------------------------- | ----------------------------------- | -------------- |
| "Payment isn't processing" | 1. Check Stripe dashboard for error |

2. Verify card not expired
3. Try different card | If still fails → Dev team |
   | "My data disappeared" | 1. Check user_tasks table
4. Check browser (cleared cache?)
5. Check error logs | Immediate → Dev team |
   | "AI is giving wrong advice" | 1. Screenshot the response
6. Document user context
7. Test same prompt | Flag for AI prompt review |
   | "Task won't unlock" | 1. Check dependencies
8. Verify previous task complete
9. Check business plan status | If still broken → Dev team |

### Tier 3 (Escalate to Expert)

**Legal/tax questions:**

"I recommend consulting with a [lawyer/CPA] for your specific situation. Our AI provides general guidance but can't replace professional advice. Here are some resources: [Links]"

**State-specific complexity:**

If question is beyond our docs: "That's a great question about [State] requirements. Let me research and get back to you within 24 hours."

**Feature requests:**

"Thanks for the suggestion! I've added it to our roadmap. Want to upvote other requests? [Link to roadmap]"

---

## Canned Responses

### Welcome Message

**Trigger:** First support ticket from user

"Hi [Name]! 👋 Thanks for reaching out. I'm [Your Name], and I'm here to help. What can I assist you with today?"

### Resolved

**Trigger:** Issue fixed

"Glad I could help! Let me know if you need anything else. 🎉"

### Escalated

**Trigger:** Sending to dev team

"I'm escalating this to our dev team. You should hear back within 24 hours. I'll keep you updated!"

### Beta Feedback Request

**Trigger:** 1 week after signup

"Hey [Name]! You've been using Business Navigator for a week. How's it going? Any feedback? Brutal honesty welcome! 😊"

---

## Analytics & Event Tracking

### PostHog Events to Track

| **Category**     | **Event Name**              | **Properties**                     |
| ---------------- | --------------------------- | ---------------------------------- |
| **Acquisition**  | `user_signed_up`            | source, plan, device               |
|                  | `onboarding_started`        | user_id                            |
|                  | `onboarding_step_completed` | user_id, step_number, time_spent   |
|                  | `onboarding_completed`      | user_id, total_time, business_type |
| **Activation**   | `first_task_viewed`         | user_id, task_id                   |
|                  | `first_task_completed`      | user_id, task_id, time_to_complete |
|                  | `phase_completed`           | user_id, phase_number              |
| **Engagement**   | `task_started`              | user_id, task_id, phase            |
|                  | `task_completed`            | user_id, task_id, time_spent       |
|                  | `ai_question_asked`         | user_id, question_length, context  |
|                  | `ai_question_limit_reached` | user_id, plan                      |
|                  | `export_generated`          | user_id, export_type (PDF/Excel)   |
| **Monetization** | `upgrade_viewed`            | user_id, from_plan, to_plan        |
|                  | `upgrade_clicked`           | user_id, plan                      |
|                  | `payment_completed`         | user_id, plan, amount              |
|                  | `subscription_canceled`     | user_id, plan, reason              |
| **Retention**    | `user_logged_in`            | user_id, days_since_signup         |
|                  | `user_inactive_7d`          | user_id (automated flag)           |

### Dashboards to Build

**1. Acquisition Dashboard**

- Daily signups (line chart)
- Signups by source (pie chart)
- Free vs paid breakdown (stacked bar)
- Landing page conversion rate

**2. Activation Dashboard**

- Onboarding funnel (steps 1-7 completion %)
- Time to first task (histogram)
- Phase 1 completion rate
- Drop-off points (heatmap)

**3. Engagement Dashboard**

- DAU / WAU / MAU (line chart)
- Tasks completed per user (histogram)
- AI assistant usage (questions per user)
- Confidence score distribution

**4. Revenue Dashboard**

- MRR (line chart)
- Free → Paid conversion rate
- Churn rate
- LTV:CAC ratio

**5. Product Health Dashboard**

- API response times (p50, p95, p99)
- Error rate by endpoint
- OpenAI API costs (daily)
- Database query performance

---

## Weekly Reporting Template

**Send every Monday to team**

### Week [X] Metrics (Date - Date)

**Acquisition:**

- Signups: [X] (↑/↓ [Y]% vs last week)
- Top source: [Source] ([X] signups)
- Conversion rate: [X]%

**Activation:**

- Onboarding completion: [X]%
- Time to first task: [X] min (avg)
- Phase 1 completion: [X]%

**Engagement:**

- Active users: [X] DAU, [X] WAU
- Tasks completed: [X] total
- AI questions: [X] total, [X] avg/user

**Revenue:**

- MRR: $[X] (↑/↓ $[Y] vs last week)
- New paying customers: [X]
- Churn: [X]%

**Issues:**

- P0 bugs: [X] (list if any)
- Support tickets: [X] ([X] resolved)
- Top complaint: [Issue]

**Next Week Focus:**

- [Priority 1]
- [Priority 2]
- [Priority 3]

---

## Monitoring & Alerts

### Server Monitoring (Vercel)

| **Metric**        | **Threshold**   | **Alert Channel** | **Action**                   |
| ----------------- | --------------- | ----------------- | ---------------------------- |
| Error rate        | >5% of requests | Slack #alerts     | Investigate logs immediately |
| API response time | >3s (p95)       | Slack #alerts     | Check database queries       |
| CPU usage         | >80%            | Slack #alerts     | Scale up                     |
| Memory usage      | >80%            | Slack #alerts     | Check for memory leaks       |

### Database Monitoring (Supabase/Neon)

| **Metric**      | **Threshold**      | **Alert Channel**   | **Action**         |
| --------------- | ------------------ | ------------------- | ------------------ |
| Connection pool | >90% used          | Slack #alerts       | Increase pool size |
| Query time      | >2s (slow queries) | Email weekly report | Add indexes        |
| Storage         | >80% capacity      | Email               | Archive old data   |

### Third-Party Service Monitoring

| **Service** | **What to Monitor**  | **Alert If**                  |
| ----------- | -------------------- | ----------------------------- |
| **Stripe**  | Payment success rate | <95% success rate             |
| **OpenAI**  | API cost, error rate | Daily cost >$50 OR >5% errors |
| **Clerk**   | Auth success rate    | <98% success rate             |
| **Resend**  | Email delivery rate  | <95% delivered                |

---

## Incident Response

### Severity Levels

**SEV-1 (Critical):**

- App completely down
- Data breach
- Cannot process payments

**Response:** Immediate all-hands, fix within 1 hour

**SEV-2 (High):**

- Core feature broken
- Affects >25% of users
- Security vulnerability

**Response:** Assign lead dev, fix within 4 hours

**SEV-3 (Medium):**

- Minor feature broken
- Affects <25% of users
- Performance degradation

**Response:** Fix in next business day

### Incident Response Checklist

| **Step** | **Action**                                     | **Owner**         |
| -------- | ---------------------------------------------- | ----------------- |
| 1        | Acknowledge incident in Slack #incidents       | [First responder] |
| 2        | Assess severity (SEV-1/2/3)                    | [Lead Dev]        |
| 3        | Create incident channel (#incident-YYYY-MM-DD) | [Lead Dev]        |
| 4        | Post status update (status page or email)      | [Product]         |
| 5        | Investigate root cause                         | [Dev team]        |
| 6        | Implement fix (or rollback)                    | [Dev team]        |
| 7        | Verify fix in production                       | [QA]              |
| 8        | Post resolution update                         | [Product]         |
| 9        | Schedule post-mortem (within 48 hours)         | [Lead Dev]        |

### Post-Mortem Template

**Incident:** [Description]

**Date:** [Date]

**Severity:** SEV-[X]

**Duration:** [X] minutes

**Affected users:** [X] or [X]%

**Timeline:**

- [Time]: Incident detected
- [Time]: Investigation started
- [Time]: Root cause identified
- [Time]: Fix deployed
- [Time]: Incident resolved

**Root Cause:**

[What caused the issue?]

**Resolution:**

[How was it fixed?]

**Lessons Learned:**

- What went well?
- What went poorly?
- What could we improve?

**Action Items:**

- [ ] [Action] - [Owner] - [Due date]
- [ ] [Action] - [Owner] - [Due date]

---

## On-Call Rotation

**Beta (Weeks 1-4):** All hands on deck, no formal rotation

**Post-Beta:** 1-week rotations

**On-call responsibilities:**

- Monitor Slack #alerts
- Respond to SEV-1/2 incidents
- Triage support tickets
- Check dashboards daily

**On-call schedule:**

- Week 1: [Name]
- Week 2: [Name]
- Week 3: [Name]
- Week 4: [Name]
