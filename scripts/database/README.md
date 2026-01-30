# Database Migration Scripts

This directory contains SQL migration scripts for the Business Navigator database.

## Setup Instructions

### Prerequisites

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Note your project URL and anon/service role keys
3. Open the SQL Editor in your Supabase dashboard

### Running Migrations

Execute the SQL scripts in numerical order:

#### 1. Initial Schema Setup

File: `001_initial_schema.sql`

This script creates:

- Custom PostgreSQL types (`business_type`, `business_status`)
- Core tables (`users`, `businesses`, `business_formation_sessions`)
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic `updated_at` triggers
- User profile creation trigger

**To run:**

1. Open Supabase SQL Editor
2. Copy the contents of `001_initial_schema.sql`
3. Paste and run the script
4. Verify success (you should see "Success. No rows returned" for most statements)

#### 2. Verify Setup

After running the migration, verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return:
-- users
-- businesses
-- business_formation_sessions

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- All tables should show 't' (true) for rowsecurity
```

### Database Schema

#### Users Table

Stores user profile information (extends Supabase auth.users).

| Column     | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| id         | UUID        | Primary key (references auth.users) |
| email      | TEXT        | User email address                  |
| first_name | TEXT        | User first name                     |
| last_name  | TEXT        | User last name                      |
| created_at | TIMESTAMPTZ | Account creation timestamp          |
| updated_at | TIMESTAMPTZ | Last update timestamp               |

#### Businesses Table

Stores business entities created by users.

| Column     | Type            | Description                                           |
| ---------- | --------------- | ----------------------------------------------------- |
| id         | UUID            | Primary key                                           |
| name       | TEXT            | Business name                                         |
| type       | business_type   | LLC, CORPORATION, SOLE_PROPRIETORSHIP, or PARTNERSHIP |
| state      | TEXT            | Two-letter state code (e.g., 'CA', 'NY')              |
| status     | business_status | DRAFT, IN_PROGRESS, SUBMITTED, APPROVED, or REJECTED  |
| owner_id   | UUID            | References users(id)                                  |
| created_at | TIMESTAMPTZ     | Creation timestamp                                    |
| updated_at | TIMESTAMPTZ     | Last update timestamp                                 |

#### Business Formation Sessions Table

Tracks AI agent interactions and formation progress.

| Column          | Type        | Description                   |
| --------------- | ----------- | ----------------------------- |
| id              | UUID        | Primary key                   |
| business_id     | UUID        | References businesses(id)     |
| user_id         | UUID        | References users(id)          |
| agent_responses | JSONB       | Array of AI agent responses   |
| current_step    | TEXT        | Current formation step        |
| completed       | BOOLEAN     | Whether formation is complete |
| created_at      | TIMESTAMPTZ | Session creation timestamp    |
| updated_at      | TIMESTAMPTZ | Last update timestamp         |

### Security

#### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:

- Users can only access their own data
- No cross-user data access
- Authenticated users required for all operations

#### Policies Summary

- **Users**: Users can view/update their own profile
- **Businesses**: Users can CRUD their own businesses
- **Formation Sessions**: Users can CRUD their own sessions

### Triggers

#### Automatic Timestamps

All tables have triggers that automatically update the `updated_at` column on any UPDATE operation.

#### User Profile Creation

When a new user signs up via Supabase Auth, a trigger automatically creates a corresponding profile in the `users` table using metadata from the signup.

### Indexes

Performance indexes are created on:

- User email addresses
- Business owner IDs and statuses
- Formation session relationships
- Creation timestamps for sorting

### Testing the Database

After setup, you can test with these queries:

```sql
-- Test user access (replace YOUR_USER_ID with actual auth user ID)
SELECT * FROM users WHERE id = 'YOUR_USER_ID';

-- Test business access
SELECT * FROM businesses WHERE owner_id = 'YOUR_USER_ID';

-- Test formations
SELECT * FROM business_formation_sessions WHERE user_id = 'YOUR_USER_ID';
```

### Rollback

If you need to remove all tables and start over:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS public.business_formation_sessions CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TYPE IF EXISTS business_status;
DROP TYPE IF EXISTS business_type;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

### Environment Variables

After setting up the database, update your backend `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find these values in:

- Supabase Dashboard → Settings → API

### Troubleshooting

**Issue: RLS policies preventing access**

Solution: Ensure you're using the correct JWT token from Supabase Auth. The backend automatically handles this.

**Issue: User profile not created on signup**

Solution: Check that the `handle_new_user()` trigger is active:

```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

**Issue: Unique constraint violations**

Solution: This usually means a user is trying to signup with an existing email. Handle this gracefully in your frontend.

### Next Steps

After database setup:

1. ✅ Update backend `.env` file with Supabase credentials
2. ✅ Start the backend server: `cd backend && bun run dev`
3. ✅ Test API endpoints using the health check: `curl http://localhost:3000/health`
4. ✅ Register a test user via `/api/auth/register`
5. ✅ Test creating a business via `/api/businesses`

---

## Epic 9: Data-Driven Credits & Tier System

Epic 9 adds a comprehensive credit-based usage system (migrations 011-020).

### New Tables

| Migration | Table                 | Description                                                 |
| --------- | --------------------- | ----------------------------------------------------------- |
| 011       | `subscription_tiers`  | Tier definitions (Free, Starter, Pro, Business, Enterprise) |
| 012       | `ai_models`           | AI model catalog with credit costs per message              |
| 013       | `user_credits`        | User credit balances and refill tracking                    |
| 014       | `credit_transactions` | Immutable transaction ledger                                |
| 015       | `site_settings`       | Application configuration key-value store                   |
| 016       | `admin_api_keys`      | Encrypted platform API keys for AI providers                |
| 017       | `admin_audit_log`     | Audit trail for admin actions                               |
| 018       | `feature_flags`       | Feature toggles with tier-based access                      |
| 019       | `users.is_admin`      | Admin column added to users table                           |
| 020       | Credit functions      | PL/pgSQL functions for credit operations                    |

### Running Epic 9 Migrations

**Option 1: Supabase SQL Editor (Recommended)**

Copy and run the consolidated script:

```
scripts/database/run_epic9_migrations_supabase.sql
```

**Option 2: psql Command Line**

```bash
cd scripts/database
psql $DATABASE_URL -f run_epic9_migrations.sql
```

### Key Functions

| Function                                       | Description                           |
| ---------------------------------------------- | ------------------------------------- |
| `spend_credits(user_id, model_id, message_id)` | Deduct credits for AI message         |
| `add_credits(user_id, amount, type, ...)`      | Add credits (purchase, bonus, refill) |
| `can_use_model(user_id, model_id)`             | Check if user can use a model         |
| `get_credit_summary(user_id)`                  | Get user's credit balance and stats   |
| `is_feature_enabled(key, user_id, tier)`       | Check if feature is enabled for user  |
| `log_admin_action(...)`                        | Log admin action to audit trail       |

### Rollback

In case of emergency, run the rollback script:

```bash
psql $DATABASE_URL -f rollback_epic9.sql
```

**WARNING:** This will permanently delete all Epic 9 data!

---

### Support

For Supabase-specific issues, refer to:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
