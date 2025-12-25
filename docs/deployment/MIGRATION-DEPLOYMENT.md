# Database Migration Deployment Guide

Step-by-step guide for deploying database migrations to production Supabase.

## Overview

This guide covers pushing your local database schema (migrations) to the production Supabase instance using the Supabase CLI.

**What you'll deploy:**
- `expenses` table with full schema
- Row Level Security (RLS) policies
- Database indexes for performance
- Triggers for auto-updating timestamps

---

## Prerequisites

Before pushing migrations, ensure:

- [x] Local Supabase CLI installed
- [x] Project linked to production: `npx supabase link`
- [x] Migrations exist in `supabase/migrations/`
- [ ] Migrations tested locally
- [ ] Ready to apply to production

---

## Step 1: Verify Project Link

Confirm you're linked to the correct production project.

```bash
npx supabase projects list
```

**Expected output:**
```
├─────────────────────┬──────────────────────────────┬───────────────────┐
│       PROJECT ID    │         PROJECT NAME         │   ORGANIZATION    │
├─────────────────────┼──────────────────────────────┼───────────────────┤
│ * zuosvgwkggpcmeofxokm │ expense-tracker-prod         │ Personal          │
└─────────────────────┴──────────────────────────────┴───────────────────┘
```

Look for the **asterisk (*)** next to `zuosvgwkggpcmeofxokm` - this indicates the active linked project.

> **If not linked:** Run `npx supabase link --project-ref zuosvgwkggpcmeofxokm`

---

## Step 2: Review Local Migrations

Check what migrations will be applied.

```bash
ls -la supabase/migrations/
```

**You should see:**
```
20250101000000_create_expenses.sql
```

**View migration content:**

```bash
cat supabase/migrations/20250101000000_create_expenses.sql
```

This migration creates:
- `expenses` table
- RLS policies (4 total)
- Indexes (2 total)
- Triggers (updated_at auto-update)

---

## Step 3: Check Migration Diff

Preview what SQL will be executed on production.

```bash
npx supabase db diff
```

**Expected output:**

Shows the SQL statements that will be applied:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL CHECK (char_length(description) > 0 AND char_length(description) <= 200),
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE CHECK (date <= CURRENT_DATE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [... policies, indexes, triggers ...]
```

> **Review carefully:** This shows exactly what will be executed on production.

---

## Step 4: Push Migrations to Production

Apply migrations to the production database.

```bash
npx supabase db push
```

**Expected output:**
```
Applying migration 20250101000000_create_expenses.sql...
Applying migration...
Finished supabase db push.
```

**This command:**
1. Connects to your production Supabase instance
2. Checks which migrations haven't been applied yet
3. Executes them in order
4. Records them in the migration history

> **Important:** This modifies your production database. There's no undo button - always test locally first!

---

## Step 5: Verify in Supabase Dashboard

Confirm the migration was successful by checking the Supabase Dashboard.

### Verify Table Created

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Table Editor** (left sidebar)
3. Look for **`expenses`** table in the list

**Expected columns:**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `uuid_generate_v4()` |
| `user_id` | uuid | No | - |
| `amount` | numeric(10,2) | No | - |
| `description` | text | No | - |
| `category` | text | Yes | `NULL` |
| `date` | date | No | `CURRENT_DATE` |
| `created_at` | timestamptz | No | `NOW()` |
| `updated_at` | timestamptz | No | `NOW()` |

### Verify RLS Enabled

1. In **Table Editor**, click on the `expenses` table
2. Look for a **shield icon** 🛡️ next to the table name
3. This indicates RLS is enabled

### Verify RLS Policies

1. Navigate to **Authentication → Policies** (left sidebar)
2. Click on the **`expenses`** table
3. Verify **4 policies** exist:

**Expected policies:**

| Policy Name | Command | Check |
|------------|---------|-------|
| `Users can view own expenses` | SELECT | `auth.uid() = user_id` |
| `Users can insert own expenses` | INSERT | `auth.uid() = user_id` |
| `Users can update own expenses` | UPDATE | `auth.uid() = user_id` |
| `Users can delete own expenses` | DELETE | `auth.uid() = user_id` |

Each policy ensures users can only access their own expense data.

### Verify Indexes

1. Navigate to **Database → Indexes** (left sidebar)
2. Look for indexes on the `expenses` table:

**Expected indexes:**

| Index Name | Columns | Type |
|-----------|---------|------|
| `expenses_pkey` | `id` | Primary Key |
| `idx_expenses_user_id` | `user_id` | B-tree |
| `idx_expenses_user_date` | `user_id, date DESC` | B-tree |

These indexes optimize query performance for fetching user expenses.

### Verify Trigger

1. Navigate to **Database → Functions** (left sidebar)
2. Look for `update_updated_at_column` function
3. This trigger automatically updates `updated_at` on row updates

---

## Step 6: Test with SQL Editor

Manually test the schema with a test query.

1. Navigate to **SQL Editor** (left sidebar)
2. Create a new query
3. Run this test:

```sql
-- Test: Check table exists and RLS works
SELECT * FROM expenses WHERE user_id = auth.uid() LIMIT 1;
```

**Expected result:**
- If you have no data yet: "0 rows returned"
- If you have test data: Your expense rows

**This confirms:**
- ✅ Table exists
- ✅ RLS policies are active
- ✅ `auth.uid()` function works

### Insert Test Row (Optional)

To verify insert permissions:

```sql
-- Test: Insert a test expense
INSERT INTO expenses (user_id, amount, description, category, date)
VALUES (
  auth.uid(),
  10.50,
  'Test expense',
  'Food',
  CURRENT_DATE
)
RETURNING *;
```

**Expected result:**
- Returns the inserted row with generated `id`, `created_at`, `updated_at`

**Clean up:**
```sql
-- Delete test row
DELETE FROM expenses WHERE description = 'Test expense';
```

---

## What Gets Created

### expenses Table

Full schema of the `expenses` table:

```sql
CREATE TABLE public.expenses (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Expense data
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL CHECK (char_length(description) > 0 AND char_length(description) <= 200),
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE CHECK (date <= CURRENT_DATE),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Constraints:**
- `amount > 0`: Expenses must be positive
- `description` length: 1-200 characters
- `date <= CURRENT_DATE`: No future dates
- `user_id` CASCADE: Delete expenses when user is deleted

### RLS Policies (4 total)

**1. SELECT Policy:**
```sql
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);
```

**2. INSERT Policy:**
```sql
CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**3. UPDATE Policy:**
```sql
CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);
```

**4. DELETE Policy:**
```sql
CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);
```

**What RLS does:**
- Isolates each user's data
- Prevents users from seeing/modifying others' expenses
- Enforces security at the database level (even if app logic fails)

### Indexes (2 total)

**1. User ID Index:**
```sql
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
```
- Speeds up filtering by user
- Used in all RLS policy checks

**2. User + Date Index:**
```sql
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);
```
- Speeds up sorting by date (descending)
- Used for dashboard "recent expenses" query
- Composite index (user_id + date) for optimal performance

### Triggers (1 total)

**updated_at Auto-Update:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**What this does:**
- Automatically sets `updated_at` to current time on every UPDATE
- Ensures `updated_at` is always accurate
- No need to manually set it in application code

---

## Verification Checklist

After running `npx supabase db push`, verify:

- [ ] `expenses` table exists in Table Editor
- [ ] All 8 columns present with correct types
- [ ] RLS enabled (shield icon visible)
- [ ] 4 RLS policies exist (SELECT, INSERT, UPDATE, DELETE)
- [ ] Primary key constraint on `id`
- [ ] Foreign key to `auth.users(id)` on `user_id`
- [ ] Check constraint on `amount > 0`
- [ ] Check constraint on `description` length
- [ ] Check constraint on `date <= CURRENT_DATE`
- [ ] Index `idx_expenses_user_id` exists
- [ ] Index `idx_expenses_user_date` exists
- [ ] Trigger `update_expenses_updated_at` exists
- [ ] Function `update_updated_at_column` exists
- [ ] Can run test SELECT query successfully
- [ ] Can insert test row successfully

**✅ If all checked:** Migration deployment successful!

---

## Common Issues

### "Migration already applied"

**Message:**
```
Migration 20250101000000_create_expenses.sql already applied
```

**Meaning:** This migration was already run on production.

**Action:** No action needed. Your database is already up to date.

---

### "Permission denied for schema public"

**Cause:** Database user lacks permissions.

**Solution:**
1. Check you're connected to the right project
2. Run `npx supabase link --project-ref zuosvgwkggpcmeofxokm`
3. Verify your Supabase access token has permissions

---

### "Table expenses already exists"

**Cause:** Table was created manually or by previous migration.

**Solution:**
1. If you want to recreate: Drop table first (⚠️ data loss!)
   ```sql
   DROP TABLE IF EXISTS expenses CASCADE;
   ```
2. If you want to keep: Skip this migration or create a new one with changes

---

### RLS Policies Not Working

**Symptom:** Can't query expenses, "row level security policy violated"

**Cause:** Policies not applied or incorrect.

**Solution:**
1. Check policies exist in Supabase Dashboard
2. Verify `auth.uid()` matches `user_id`
3. Ensure RLS is enabled (shield icon)
4. Test in SQL Editor with `auth.uid()` function

---

## Rolling Back Migrations

If you need to undo a migration:

### Option 1: Create a Rollback Migration

```bash
npx supabase migration new rollback_expenses
```

Then edit the new migration file:
```sql
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

Push the rollback:
```bash
npx supabase db push
```

### Option 2: Manual Cleanup (SQL Editor)

1. Go to SQL Editor in Supabase Dashboard
2. Run:
   ```sql
   DROP TABLE IF EXISTS public.expenses CASCADE;
   DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
   ```

> **⚠️ Warning:** Dropping tables deletes all data. Backup first if needed!

---

## Next Steps

After successful migration deployment:

1. **Deploy application to Vercel** - See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)
2. **Test production environment** - See [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)
3. **Monitor database usage** - Supabase Dashboard → Reports

---

## Related Documentation

- [Complete Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENV-PRODUCTION.md)
- [Vercel Setup](./VERCEL-DEPLOYMENT.md)
- [Testing Checklist](./TESTING-CHECKLIST.md)

---

**Migration Status:** Ready for Production ✅

**Last Updated:** December 25, 2025

