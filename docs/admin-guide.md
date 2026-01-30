# Business Navigator Admin Guide

**Document Type:** Administrator Reference
**Last Updated:** January 29, 2026
**Version:** 1.0

## Overview

This guide covers the administration and management of the Business Navigator credits system, AI models, subscription tiers, and user account settings. The admin dashboard provides comprehensive tools for system configuration, monitoring, and troubleshooting.

### What is the Credits System?

The Business Navigator credits system is a flexible, token-based consumption model that allows users to control their spending on AI model usage. Instead of fixed subscription fees, users purchase or earn credits that are consumed based on their chosen AI model and the complexity of their requests.

**Key Benefits:**

- **User Control:** Users select which AI model to use, understanding the credit cost upfront
- **Transparency:** Credit costs are clearly displayed before each AI interaction
- **Flexibility:** Users can switch between free and premium models without long-term commitments
- **Fair Pricing:** More powerful models cost more credits; efficient models cost fewer credits

### How Credits Work

**Credit Allocation:**

- Users receive an initial credit allocation based on their subscription tier
- Credits refresh monthly on the anniversary of account creation or subscription start date
- Unused credits expire after 30 days (free tier) or 90 days (paid tiers)
- Users can purchase additional credits at any time

**Credit Consumption:**

- Each AI model has an assigned credit cost per interaction
- Costs vary by model complexity: GPT-4 costs more than GPT-3.5, Claude 3.5 Sonnet costs more than Claude 3 Haiku
- Users are notified when credits are running low (80%, 50%, and 0%)
- Interactions are blocked when users have insufficient credits

**Monthly Reset:**

- Credits reset on the same day each month as the user's billing cycle
- Partial-month usage carries over to the next period if within expiration window
- Admins can manually adjust credits for customer support scenarios

### Subscription Tier Structure

Business Navigator offers four subscription tiers:

| Tier           | Monthly Credits | Price  | Use Case                            |
| -------------- | --------------- | ------ | ----------------------------------- |
| **Free**       | 5 credits       | $0/mo  | Trial, light usage, exploring       |
| **Basic**      | 25 credits      | $15/mo | Regular use, 1-2 questions per day  |
| **Pro**        | 100 credits     | $49/mo | Heavy use, multiple daily questions |
| **Enterprise** | Custom          | Custom | Organizations, custom integrations  |

---

## Accessing the Admin Dashboard

### Requirements

To access the admin dashboard, your user account must have the `is_admin` flag enabled in the database. Contact the platform administrator to request admin access.

**Admin Permissions Include:**

- View and manage all AI models and their credit costs
- Create and edit subscription tiers
- View platform-wide audit logs
- Manage API provider keys for system-wide model access
- Configure site-wide settings
- Access user account management (limited view)

### Navigation

**URL:** `https://app.businessnavigator.com/admin`

**Access Methods:**

1. **Direct URL:** Navigate to `/admin` if you have admin access
2. **Settings Menu:** Click your profile → Settings → Admin Dashboard (if enabled)
3. **Dashboard Link:** Admin dashboard link appears in main navigation for admins

**Browser Support:** Chrome, Firefox, Safari, Edge (latest versions)

---

## Managing AI Models

### Viewing the Model List

**Path:** Admin Dashboard → AI Models

The model list displays all available AI models with:

- Model name and provider (OpenAI, Anthropic, Google, etc.)
- Current credit cost per interaction
- Model status (enabled/disabled)
- Minimum tier requirement
- Last updated timestamp

**Filtering & Search:**

- Filter by provider (OpenAI, Anthropic, Google, etc.)
- Filter by status (active, inactive, archived)
- Search by model name
- Sort by cost, provider, or date added

### Adding a New Model

**Path:** Admin Dashboard → AI Models → [+ Add Model]

**Steps:**

1. Click the **+ Add Model** button
2. Fill in model details:
   - **Model Name:** Display name (e.g., "GPT-4 Turbo")
   - **Model ID:** Unique identifier used in API (e.g., "gpt-4-turbo")
   - **Provider:** Select from dropdown (OpenAI, Anthropic, Google, etc.)
   - **Description:** Brief description of model capabilities
3. Configure costs:
   - **Cost per Interaction:** Number of credits consumed (e.g., "15 credits")
   - **Cost Type:** Select how costs are calculated:
     - `Per Request` - Fixed cost regardless of complexity
     - `Per 1K Tokens` - Scaled cost based on input/output tokens
4. Set availability:
   - **Minimum Tier:** Select lowest tier that can access this model
   - **Status:** Toggle to enable/disable immediately
5. Add model documentation:
   - **Link to Provider Docs:** URL to official model documentation
   - **Max Context Window:** Recommended context size (for UX hints)
6. Click **Save Model**

**Example: Adding Claude 3.5 Sonnet**

```
Model Name: Claude 3.5 Sonnet
Model ID: claude-3-5-sonnet-20250610
Provider: Anthropic
Description: Advanced reasoning and analysis model, excellent for complex business questions
Cost per Interaction: 12 credits
Cost Type: Per Request
Minimum Tier: Basic
Status: Enabled
Docs Link: https://docs.anthropic.com/claude/reference/
Max Context: 200,000 tokens
```

### Editing Model Properties

**Path:** Admin Dashboard → AI Models → [Model Name] → Edit

**Editable Properties:**

- Display name and description
- Credit cost per interaction
- Minimum tier requirement
- Provider documentation link
- Status (enabled/disabled)

**Non-Editable Properties:**

- Model ID (must disable and create new if wrong)
- Provider (contact support if incorrect)

**Steps to Edit:**

1. Click the model in the list
2. Click **Edit** button
3. Update desired fields
4. Click **Save Changes**
5. Confirm in the dialog that appears

**Version History:** Changes are tracked; you can revert to previous settings within 30 days.

### Setting Credit Costs

Credit costs are the primary way to balance model availability and user experience.

**Cost Calculation Strategy:**

- **Simple Models** (GPT-3.5, Claude 3 Haiku): 3-5 credits per request
- **Intermediate Models** (GPT-4, Claude 3 Sonnet): 8-15 credits per request
- **Advanced Models** (GPT-4 Turbo, Claude 3.5 Sonnet): 12-20 credits per request
- **Specialized Models** (Code, Vision-enabled): 15-25 credits per request

**Token-Based Pricing:**

For token-based models, set cost per 1,000 tokens:

- Input tokens cost 20-30% less than output tokens
- Example: Claude costs $3/$15 per 1M input/output tokens
- Convert to credits: $15 monthly budget / $3 per 1M output tokens = 5M token capacity
- For 5 credits monthly / 5M tokens = 0.001 credits per 1,000 tokens input

**Updating Costs:**

1. Go to AI Models → [Model]
2. Click **Edit Cost**
3. Adjust the credit value
4. Review impact: "This change affects X free users, Y basic users"
5. Choose activation date (immediate or scheduled)
6. Click **Update Cost**

### Enabling & Disabling Models

**Disabling a Model:**

1. Go to AI Models → [Model Name]
2. Click **Status** toggle to disable
3. In confirmation dialog, select reason:
   - Deprecated
   - Maintenance
   - Cost reduction
   - Quality issues
4. Optional: Set a re-enable date
5. Click **Confirm**

**Effect of Disabling:**

- Model disappears from user selection
- Active chats using that model continue (with warning)
- Users are prompted to switch to alternative model
- Admin audit log records the change

**Re-enabling a Model:**

1. Go to AI Models → [Model Name]
2. Click **Status** toggle to enable
3. Click **Confirm**
4. Model becomes immediately available to users

### Setting Tier Requirements

**What are Tier Requirements?**

Tier requirements limit which subscription tiers can access specific models. This allows you to:

- Reserve premium models for paid users
- Gradually roll out new models to Pro/Enterprise first
- Manage computational resources by limiting free-tier access

**Setting Requirements:**

1. Go to AI Models → [Model Name]
2. Under "Availability Settings," find "Minimum Tier Required"
3. Select tier:
   - `Free` - All users can access
   - `Basic` - Basic, Pro, Enterprise only
   - `Pro` - Pro and Enterprise only
   - `Enterprise` - Enterprise only
4. Click **Update**

**Example: Restricting GPT-4 Turbo to Pro Users**

```
Model: GPT-4 Turbo
Current Minimum Tier: Free
Change to: Pro
Effect: 150 free users + 45 basic users lose access
        80 pro users + 12 enterprise users retain access
Action: Free/basic users see "Upgrade to Pro" message when selecting this model
```

---

## Managing Subscription Tiers

### Viewing Tiers

**Path:** Admin Dashboard → Subscription Tiers

The tiers page displays:

- Tier name and monthly price
- Number of active users per tier
- Monthly credit allocation
- Feature list
- Status (active/archived)
- Revenue impact

**Metrics Displayed:**

- Total Monthly Recurring Revenue (MRR) per tier
- Conversion rate (upgrades from free to this tier)
- Churn rate (downgrades from this tier)

### Creating New Tiers

**Path:** Admin Dashboard → Subscription Tiers → [+ Create Tier]

**When to Create New Tiers:**

- To offer tiered pricing for different use cases
- To support new market segments
- To implement annual vs. monthly billing variations

**Steps:**

1. Click **+ Create Tier**
2. Enter tier details:
   - **Tier Name:** Unique, user-facing name (e.g., "Growth")
   - **Slug:** URL-safe identifier (e.g., "growth")
   - **Description:** Marketing description shown to users
   - **Monthly Price:** USD price per month (leave blank for custom)
   - **Annual Price (Optional):** USD per year with discount
3. Set credit allocation:
   - **Monthly Credits:** Base credits per month
   - **Credit Rollover Policy:**
     - None (expires each month)
     - Partial (carry forward unused)
     - Full (keep all credits)
4. Configure features:
   - Check/uncheck features available to this tier
5. Set as default tier:
   - Toggle if this should be the default for new signups
   - Only one tier can be default at a time
6. Click **Create Tier**

### Editing Tier Properties

**Path:** Admin Dashboard → Subscription Tiers → [Tier Name] → Edit

**Editable Properties:**

- Display name and description
- Monthly and annual pricing
- Monthly credit allocation
- Feature list
- Default tier status

**Steps:**

1. Click the tier in the list
2. Click **Edit** button
3. Update desired fields
4. Review affected users before confirming
5. Choose when to apply changes
6. Click **Save Changes**

### Setting Monthly Credits

Credits allocation is the primary lever for controlling user value and system economics.

**Credit Allocation Strategy:**

- **Free Tier:** 5 credits = 1-2 advanced AI queries
- **Basic:** 25 credits = 2-3 queries per day
- **Pro:** 100 credits = 10+ queries per day
- **Enterprise:** Unlimited or custom pool

**Updating Credit Allocation:**

1. Go to Subscription Tiers → [Tier Name]
2. Find "Monthly Credits"
3. Enter new amount
4. Review impact before saving
5. Choose application method (immediate, next cycle, or retroactive)
6. Click **Update**

### Managing Features List

**Path:** Admin Dashboard → Subscription Tiers → [Tier] → Features

Features are the non-credit differentiators between tiers.

**Available Features:**

- Basic Chat Access
- Advanced Models
- Email Support
- API Access
- Custom Integrations
- Dedicated Account Manager
- Team Members
- Advanced Analytics
- Export Formats

**Adding Features to a Tier:**

1. Go to Subscription Tiers → [Tier]
2. Click **Edit Features**
3. Check boxes for features to enable
4. For features with limits, enter the limit
5. Drag to reorder display priority
6. Click **Save Features**

### Setting Default Tier

The default tier is assigned to new users who complete onboarding without selecting a plan.

**Changing Default Tier:**

1. Go to Subscription Tiers → [Tier]
2. Check **Set as Default**
3. Confirm the action
4. Click **Update**

---

## API Key Management

### Adding Provider API Keys

The system uses provider API keys (OpenAI, Anthropic, Google) to access AI models. Admins add keys for system-wide use; users can add their own keys for personal use.

**Path:** Admin Dashboard → API Keys → [+ Add Key]

**Steps:**

1. Click **+ Add Key**
2. Select provider:
   - OpenAI
   - Anthropic
   - Google
   - OpenRouter
3. Paste API key
4. Set as primary key if desired
5. Add optional notes
6. Click **Save Key**

**Security Note:** API keys are encrypted with AES-256 and not displayed after creation. Only the last 4 characters are visible.

### Security Considerations

**Best Practices:**

1. **Rotation Schedule:** Rotate keys every 90 days
2. **Access Logs:** Monitor API key usage via audit log
3. **Cost Monitoring:** Set monthly usage alerts
4. **Multiple Keys:** Maintain 2-3 keys per provider
5. **Environment Separation:** Use different keys for production vs. staging

**Warning Signs:**

- Key usage suddenly increases (potential abuse)
- Key usage drops to zero (potential outage)
- Failed authentication attempts (key may be expired)

**Disabling Keys:**

If a key is compromised:

1. Go to API Keys → [Key]
2. Click **Disable**
3. System switches to next available key
4. Notify provider to revoke the key
5. Generate new key and add it

### Rotating Keys

**Scheduled Rotation:**

1. Go to API Keys → [Key]
2. Click **Schedule Rotation**
3. Select date (minimum 7 days in future)
4. System will remind you 48 hours before
5. Create new key with provider
6. Add new key to system
7. Verify both keys work
8. Disable old key

**Manual Rotation (Emergency):**

1. Generate new key with provider immediately
2. Go to API Keys → [Key] → Add New Key
3. Paste new key and set as primary
4. Monitor for failures for 1 hour
5. If stable, disable old key

### Viewing Key Status

**Key Status Indicators:**

- Active: Key is enabled and functioning
- Active (Backup): Backup key in use while primary rotates
- Disabled: Key is disabled
- Expiring Soon: Key expires in less than 30 days

**Usage Metrics:**

- Total API calls this month
- Cost used ($ and %)
- Last used timestamp
- Error rate (%)

---

## Site Settings

### Available Settings

Site-wide settings control system behavior, user communication, and feature toggles.

**Path:** Admin Dashboard → Settings

**Settings Categories:**

#### General Settings

- **Platform Name:** Display name
- **Support Email:** Contact email for user support
- **Support URL:** Link to help documentation
- **Privacy Policy URL:** Link to privacy policy
- **Terms of Service URL:** Link to terms

#### Feature Toggles

- **Enable Free Tier:** Allow free accounts
- **Enable Stripe Payments:** Allow upgrades via credit card
- **Enable Email Verification:** Require email verification on signup
- **Enable OAuth:** Allow Google/GitHub login
- **Enable AI Chat:** Allow access to AI chat feature
- **Enable Export Feature:** Allow PDF/CSV exports
- **Maintenance Mode:** Disable all user access (admins only)

#### Email Settings

- **SMTP Server:** Email service configuration
- **Email From Address:** Sender address for transactional emails
- **Welcome Email Enabled:** Send welcome email on signup
- **Low Credit Alert:** Send notification at 20% of monthly credits
- **Weekly Digest:** Send weekly progress summary

#### Rate Limiting

- **Global Rate Limit:** Requests per minute (all users)
- **Per-User Rate Limit:** Requests per minute (per user)
- **File Upload Limit:** Maximum file size in MB
- **Concurrent Sessions:** Max sessions per user

#### Analytics & Monitoring

- **Sentry Error Tracking:** Enable error monitoring
- **Analytics Collection:** Enable usage analytics
- **Data Retention:** Days to keep logs (30-365)
- **Export Interval:** Backup frequency (daily/weekly)

### Updating Settings

**Path:** Admin Dashboard → Settings → [Category]

**Steps:**

1. Find the setting to update
2. Modify the value
3. Click **Save Changes**
4. Confirm in the dialog
5. Change is applied immediately

---

## Audit Log

### Viewing Admin Actions

**Path:** Admin Dashboard → Audit Log

The audit log tracks all administrative actions for compliance, troubleshooting, and security.

**Logged Actions:**

- Model price changes
- Model enable/disable
- Tier creation/modification
- API key additions/removals
- Setting changes
- User tier upgrades/downgrades
- Credit adjustments
- Access to sensitive data

**Information Recorded:**

- Timestamp: When the action occurred
- Admin User: Who performed the action
- Action Type: What was done
- Resource: Which object was affected
- Before/After: Values before and after change
- Reason: Why the change was made

### Filtering Logs

**Available Filters:**

- Date Range
- Action Type
- Admin User
- Resource
- Status

### Exporting Data

**Path:** Audit Log → [Export Button]

**Export Formats:**

- CSV - Open in Excel, Google Sheets
- JSON - For automated processing
- PDF - Print-friendly report

**Retention Policy:**

- Logs retained for 90 days in live audit log
- After 90 days, archived to cold storage
- Permanent export recommended for compliance

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Users Cannot Access a Model

**Solutions:**

1. Go to AI Models → [Model]
2. Verify Status toggle is ON
3. Check Tier Requirements meet user's tier
4. Verify API Key is enabled and not expired
5. Check provider status pages for outages

#### Issue: Users Cannot Purchase Credits

**Solutions:**

1. Check Stripe Configuration in Settings
2. Verify Tier Pricing is set correctly (not $0)
3. Ask users to clear browser cache
4. Try different browser or device

#### Issue: Credit Consumption is Incorrect

**Solutions:**

1. Verify Model Cost Setting
2. Check for retries or errors
3. Use manual credit adjustment for corrections
4. Monitor model cost settings monthly

#### Issue: Admin Dashboard is Slow

**Solutions:**

1. Check Network Connection speed
2. Clear Browser Cache
3. Check Database Performance
4. Disable Browser Extensions

#### Issue: Audit Logs Missing

**Solutions:**

1. Verify Filter Settings
2. Check Date Range (90-day limit)
3. Verify Admin Permissions
4. Run Database Integrity Check

---

## Support & Contact

### Getting Help

**In-App Help:**

- Click the help icon in dashboard header
- Browse help articles
- Search documentation

**Contact Support:**

- Email: admin-support@businessnavigator.com
- Response Time: Less than 4 hours for critical issues

### Escalation Process

**Level 1: Self-Service**

- Read this documentation
- Search help articles
- Check community forums

**Level 2: Email Support**

- Contact admin-support@businessnavigator.com
- Include description, steps, and screenshots
- Expected response: 2 hours

**Level 3: Priority Support**

- Contact engineering-support@businessnavigator.com
- Include server logs
- Expected response: 30 minutes

**Level 4: Critical Incident**

- For critical issues affecting users
- Contact cto@businessnavigator.com
- Incident commander assigned

---

## Best Practices

### Model Management

1. Review model costs monthly
2. Deprecate old models gradually
3. Test new models with Enterprise tier first
4. Track adoption and user feedback

### Tier Management

1. Change pricing only at cycle start
2. Announce changes 30 days in advance
3. Grandfather existing users
4. Test in staging before production

### API Keys

1. Maintain 2+ backup keys per provider
2. Rotate every 90 days
3. Set budget alerts at 75% and 90%
4. Check audit logs daily

### Settings

1. Limit who can change settings
2. Test changes in staging first
3. Document why settings change
4. Roll out features 10% → 50% → 100%

---

## Glossary

**Credits:** Tokens consumed during AI interactions; monthly allocation based on tier

**Tier:** Subscription level with associated credits and features

**Model:** Specific AI model with assigned credit cost

**Provider:** Company offering AI models

**Admin:** User account with elevated permissions

**Audit Log:** Record of administrative actions

**RLS:** Row-level security in database

**MRR:** Monthly Recurring Revenue

**Churn:** Rate of user downgrades/cancellations

---

## Document History

| Version | Date       | Changes               | Author |
| ------- | ---------- | --------------------- | ------ |
| 1.0     | 2026-01-29 | Initial documentation | Claude |

---

**Last Updated:** January 29, 2026
**Next Review Date:** May 29, 2026 (quarterly)
