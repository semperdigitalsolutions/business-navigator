# Database Seed Scripts

This directory contains seed data scripts for the Business Navigator database.
Part of Epic 9: Data-Driven Credits & Tier System (#186).

## Overview

These seeds populate the database with initial configuration data for:

- **Subscription Tiers** - User subscription plans with credit allocations
- **AI Models** - Available AI models with credit costs
- **Site Settings** - Platform configuration key-value pairs
- **Feature Flags** - Gradual rollout controls

## Prerequisites

The following migrations must be run before seeds:

1. `011_subscription_tiers.sql` - Creates `subscription_tiers` table
2. `012_ai_models.sql` - Creates `ai_models` table
3. `013_site_settings.sql` - Creates `site_settings` table
4. `014_feature_flags.sql` - Creates `feature_flags` table

## Running Seeds

### Option 1: Run All Seeds at Once (Recommended)

```sql
-- In Supabase SQL Editor or psql
\i scripts/database/seeds/run_all_seeds.sql
```

Or copy the contents of `run_all_seeds.sql` into the Supabase SQL Editor.

### Option 2: Run Individual Seeds

Run in this order:

1. `seed_tiers.sql` - Subscription tiers (5 tiers)
2. `seed_models.sql` - AI models (9 models)
3. `seed_settings.sql` - Site settings (25 settings)
4. `seed_feature_flags.sql` - Feature flags (21 flags)

## Seed Files

### seed_tiers.sql

Creates 5 subscription tiers:

| Tier       | Monthly Credits | Price  | Model Access        |
| ---------- | --------------- | ------ | ------------------- |
| Free       | 50              | $0     | Standard only       |
| Starter    | 200             | $9     | Standard + Advanced |
| Pro        | 500             | $29    | All models          |
| Business   | 2,000           | $99    | All models          |
| Enterprise | Unlimited       | Custom | All models          |

### seed_models.sql

Creates 9 AI models across 3 tiers:

**Standard Tier (Free access):**

- GPT-4o Mini (1 credit)
- Claude 3 Haiku (1 credit)

**Advanced Tier (Starter+ access):**

- GPT-4o (3 credits)
- Claude 3.5 Sonnet (3 credits)
- Gemini 1.5 Pro (3 credits)
- o1 Mini (5 credits)

**Premium Tier (Pro+ access):**

- Claude 3 Opus (10 credits)
- GPT-4 Turbo (5 credits)
- o1 Preview (15 credits)

### seed_settings.sql

Creates 25 default settings across categories:

- **ai** - AI model configuration
- **billing** - Credits and pricing
- **general** - Platform settings
- **security** - Rate limits and auth

### seed_feature_flags.sql

Creates 21 feature flags, all disabled by default except:

- `enhanced_onboarding` - Enabled (100%)
- `chat_streaming` - Enabled (100%)
- `task_recommendations` - Enabled (100%)

## Idempotency

All seeds use `ON CONFLICT DO UPDATE` to ensure:

- Safe to run multiple times
- Existing data is updated, not duplicated
- Manual changes to `enabled`/`rollout_percentage` on feature flags are preserved

## Verification

After running seeds, verify with:

```sql
SELECT 'subscription_tiers' as table_name, count(*) as row_count
FROM public.subscription_tiers
UNION ALL
SELECT 'ai_models', count(*) FROM public.ai_models
UNION ALL
SELECT 'site_settings', count(*) FROM public.site_settings
UNION ALL
SELECT 'feature_flags', count(*) FROM public.feature_flags;
```

Expected results:

- subscription_tiers: 5
- ai_models: 9
- site_settings: 25
- feature_flags: 21

## Development vs Production

The same seeds work for both environments. To customize:

1. **Development**: Run seeds as-is
2. **Production**:
   - Update `stripe_price_id` in tiers after Stripe setup
   - Enable feature flags gradually via admin panel
   - Update sensitive settings as needed

## Rollback

To remove seeded data (use with caution):

```sql
-- WARNING: This will delete all seeded configuration data!
TRUNCATE public.feature_flags CASCADE;
TRUNCATE public.site_settings CASCADE;
TRUNCATE public.ai_models CASCADE;
TRUNCATE public.subscription_tiers CASCADE;
```

## Related Issues

- Epic: #186 - Data-Driven Credits & Tier System
- Issue: #218 - Create Seed Data for Tiers and Models
- Table Migrations: #187, #188, #191, #194
