# Step 4: Supabase Database Migrations

This step covers database schema management using Supabase migrations, including creating tables, RLS policies, indexes, and deploying to production.

---

## Instructions (What To Do)

### Prerequisites

- Steps 1-3 completed
- Supabase running locally
- Understanding of SQL and PostgreSQL

### 1. Understanding Migration Workflow

Migrations in Supabase follow a sequential pattern using timestamped SQL files:

```
supabase/migrations/
├── 20250101000000_create_expenses.sql
├── 20250102000000_add_subcategory.sql
└── 20250103000000_optimize_rls.sql
```

**Key Principles:**
- Migrations are **immutable** - never modify existing migration files
- Migrations are **sequential** - always create new files for changes
- Timestamps ensure **deterministic ordering** across environments

### 2. Create Your First Migration

```bash
supabase migration new create_expenses
```

This creates a file like `supabase/migrations/YYYYMMDDHHMMSS_create_expenses.sql`.

**Example Migration:**

```sql
-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL CHECK (char_length(description) <= 200),
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (MUST wrap auth.uid() in SELECT for performance!)
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Trigger to auto-update updated_at
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

### 3. Apply Migrations Locally

**First time or to reset:**
```bash
supabase db reset
```

This will:
1. Drop all tables
2. Run all migrations in order
3. Apply seed data from `supabase/seed.sql`

**To see pending changes:**
```bash
supabase db diff
```

### 4. Row Level Security (RLS) Best Practices

#### ✅ CRITICAL: Always Wrap auth.uid() in SELECT

This is **the most important RLS performance optimization**:

```sql
-- ❌ BAD: Slow (function called for EVERY row)
CREATE POLICY "user_access" ON expenses
  USING (auth.uid() = user_id);

-- ✅ GOOD: Fast (function result cached per query)
CREATE POLICY "user_access" ON expenses
  USING ((SELECT auth.uid()) = user_id);
```

**Why?** Without `SELECT`, PostgreSQL calls `auth.uid()` for every single row being scanned. With `SELECT`, PostgreSQL creates an "initPlan" and caches the result for the entire query.

#### Always Add Indexes on RLS Columns

```sql
-- Create RLS policy
CREATE POLICY "user_access" ON expenses
  USING ((SELECT auth.uid()) = user_id);

-- Add index for performance (CRITICAL!)
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
```

#### Common RLS Patterns

**User-specific access:**
```sql
-- Read own records
CREATE POLICY "select_own" ON expenses FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Insert own records
CREATE POLICY "insert_own" ON expenses FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Update own records
CREATE POLICY "update_own" ON expenses FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Delete own records
CREATE POLICY "delete_own" ON expenses FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
```

**Public read, authenticated write:**
```sql
CREATE POLICY "public_read" ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "author_write" ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = author_id);
```

**Role-based access using JWT claims:**
```sql
CREATE POLICY "admin_only" ON admin_logs FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'user_role') = 'admin');
```

### 5. Index Strategy

#### Essential Indexes

```sql
-- Primary keys (automatic)
-- Foreign keys (ALWAYS index these!)
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);

-- Frequently filtered columns
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);

-- Partial indexes for specific conditions
CREATE INDEX idx_expenses_pending 
  ON expenses(user_id) 
  WHERE status = 'pending';
```

#### Check Query Performance

```sql
-- Use EXPLAIN ANALYZE to check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM expenses 
WHERE user_id = 'some-uuid' 
  AND date >= '2024-01-01';
```

Look for:
- ✅ "Index Scan" or "Bitmap Index Scan" (good)
- ❌ "Seq Scan" (bad - means full table scan)

### 6. Making Schema Changes

#### Adding a Column

```bash
supabase migration new add_subcategory_to_expenses
```

```sql
-- Add new column
ALTER TABLE public.expenses 
ADD COLUMN subcategory TEXT;

-- Add index if frequently queried
CREATE INDEX idx_expenses_subcategory 
ON public.expenses(subcategory);
```

#### Making a Column Optional

```bash
supabase migration new make_description_optional
```

```sql
-- Remove NOT NULL constraint
ALTER TABLE public.expenses 
ALTER COLUMN description DROP NOT NULL;

-- Update check constraint
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS expenses_description_check;

ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_description_check 
CHECK (description IS NULL OR (char_length(description) > 0 AND char_length(description) <= 200));
```

#### Optimizing Existing RLS Policies

```bash
supabase migration new optimize_rls_policies
```

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- Recreate with SELECT-wrapped auth.uid()
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Add helpful comments
COMMENT ON POLICY "Users can view own expenses" ON public.expenses IS 
  'Optimized RLS policy using SELECT-wrapped auth.uid() for performance';
```

### 7. Creating New Tables

```bash
supabase migration new add_user_preferences
```

```sql
-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique preference keys per user
  UNIQUE(user_id, preference_key)
);

-- Indexes (CRITICAL for RLS performance!)
CREATE INDEX idx_user_preferences_user_id 
  ON public.user_preferences(user_id);

CREATE INDEX idx_user_preferences_user_key 
  ON public.user_preferences(user_id, preference_key);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies (with SELECT-wrapped auth.uid()!)
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Auto-update updated_at trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Documentation
COMMENT ON TABLE public.user_preferences IS 
  'Stores user-specific preferences like mascot selections';
COMMENT ON COLUMN public.user_preferences.preference_key IS 
  'Key identifying the preference type (e.g., "category_mascots")';
COMMENT ON COLUMN public.user_preferences.preference_value IS 
  'JSON value containing the preference data';
```

### 8. Generate TypeScript Types

After creating or modifying tables, regenerate TypeScript types:

```bash
supabase gen types typescript --local > src/shared/types/database.types.ts
```

This creates type-safe definitions for your database schema.

### 9. Seed Data

Create `supabase/seed.sql` for initial data:

```sql
-- Seed data for development/testing
-- This runs after all migrations

-- Example: Insert default categories
-- INSERT INTO public.categories (name, icon) VALUES
--   ('Food', '🍔'),
--   ('Transport', '🚗'),
--   ('Entertainment', '🎬');
```

**Note:** Seed data is optional and only for development. Production data should come from the application.

### 10. Deploy to Production

#### Step 1: Login to Supabase

Get your access token from https://app.supabase.com/account/tokens

```bash
supabase login --token <your-access-token>
```

#### Step 2: Link to Remote Project

```bash
supabase link --project-ref <your-project-ref>
```

Find your project ref in your Supabase dashboard URL or Project Settings.

#### Step 3: Push Migrations

```bash
supabase db push
```

This will:
1. Compare local migrations with remote database
2. Show you what will be applied
3. Prompt for confirmation
4. Apply migrations to production

**⚠️ Important:** Always test migrations locally first!

### 11. Rollback Strategy

If you need to undo a migration in production:

```bash
# Create a new migration that reverses the changes
supabase migration new rollback_feature_x
```

```sql
-- Reverse the changes manually
-- Example: If you added a column, remove it
ALTER TABLE public.expenses DROP COLUMN IF EXISTS subcategory;
```

**Never:** Delete or modify existing migration files!

### Verification

1. **Migrations applied:**
   ```bash
   supabase status
   ```

2. **No pending changes:**
   ```bash
   supabase db diff
   # Should show: No schema changes detected
   ```

3. **RLS enabled:**
   Check Supabase Studio → Database → Policies

4. **Performance check:**
   Go to Supabase Dashboard → Advisors → Performance Advisor
   - Should have no RLS warnings
   - Indexes should be in place

5. **Build succeeds:**
   ```bash
   npm run typecheck
   npm run build
   ```

---

## Reference (What Was Done in This Project)

### Migration Timeline

```
supabase/migrations/
├── 20250101000000_create_expenses.sql
├── 20250102000000_add_subcategory_to_expenses.sql
├── 20250102000001_make_description_optional.sql
├── 20250102000002_add_owed_to_column.sql
├── 20250127000000_add_user_preferences.sql
└── 20250127000001_optimize_rls_policies.sql
```

### Tables Created

#### expenses
- **Purpose:** Store user expenses
- **RLS:** User can only access their own records
- **Indexes:** 
  - `idx_expenses_user_id` (for RLS performance)
  - `idx_expenses_user_date` (for date-filtered queries)

#### user_preferences
- **Purpose:** Store user-specific settings (e.g., mascot selections)
- **RLS:** User can only access their own preferences
- **Indexes:**
  - `idx_user_preferences_user_id` (for RLS performance)
  - `idx_user_preferences_user_key` (for key lookups)

### RLS Optimization Migration

The `optimize_rls_policies.sql` migration fixed **8 RLS performance issues** by wrapping all `auth.uid()` calls in `SELECT` statements:

**Before:**
```sql
USING (auth.uid() = user_id)  -- Called for every row!
```

**After:**
```sql
USING ((SELECT auth.uid()) = user_id)  -- Cached per query!
```

This change was identified by Supabase's Performance Advisor and resulted in significant query performance improvements.

### Common Patterns Used

#### Table Creation Template

```sql
CREATE TABLE public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- other columns --
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (especially for foreign keys!)
CREATE INDEX idx_table_user_id ON public.table_name(user_id);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- RLS Policies (with SELECT-wrapped auth functions!)
CREATE POLICY "Users can view own records"
  ON public.table_name FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Auto-update trigger
CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Migration Checklist

When creating a new table, always include:

- [ ] Primary key (usually `id UUID`)
- [ ] Foreign key to `auth.users` (for user-specific tables)
- [ ] `created_at` and `updated_at` timestamps
- [ ] `CHECK` constraints for validation
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] RLS enabled: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] RLS policies with `SELECT`-wrapped `auth.uid()`
- [ ] Comments for documentation
- [ ] Auto-update trigger for `updated_at`

### Performance Best Practices Applied

1. ✅ **All `auth.uid()` calls wrapped in `SELECT`** (critical!)
2. ✅ **Indexes on all foreign keys** (especially `user_id`)
3. ✅ **Composite indexes for common query patterns** (e.g., `user_id, date DESC`)
4. ✅ **UNIQUE constraints** where appropriate
5. ✅ **CHECK constraints** for data validation
6. ✅ **ON DELETE CASCADE** for automatic cleanup

### Common Commands Reference

```bash
# Local Development
supabase start                    # Start Supabase
supabase stop                     # Stop Supabase
supabase status                   # Check status
supabase db reset                 # Drop, migrate, seed
supabase db diff                  # Show schema changes
supabase migration new <name>     # Create new migration
supabase gen types typescript --local > src/shared/types/database.types.ts

# Production Deployment
supabase login --token <token>    # Login
supabase projects list            # List projects
supabase link --project-ref <ref> # Link to project
supabase db push                  # Push migrations
supabase db pull                  # Pull remote schema

# Debugging
supabase logs                     # View logs
psql <connection-string>          # Direct DB access
```

### Troubleshooting

#### "Permission denied" or "operation not permitted"

**Solution:** Check Docker Desktop is running.

#### Migration failed during `db reset`

**Cause:** Migration depends on table that doesn't exist yet.

**Solution:** Check migration timestamps - they must be in the correct order.

Example: If migration `20250118000000_optimize_rls.sql` tries to modify `user_preferences` table, but that table is created in `20250127000000_add_user_preferences.sql`, rename the optimization migration to `20250127000001_optimize_rls.sql`.

#### Supabase Dashboard still shows warnings after migration

**Cause:** Migration applied locally but not to hosted database.

**Solution:** Push migrations to production using `supabase db push`.

#### Types not updating after schema changes

**Solution:** Regenerate types:
```bash
supabase gen types typescript --local > src/shared/types/database.types.ts
```

### Key Lessons Learned

1. **Never modify existing migrations** - Always create new ones
2. **Always wrap `auth.uid()` in SELECT** - Huge performance impact
3. **Index all foreign keys** - Essential for RLS performance
4. **Test migrations locally first** - Use `supabase db reset` liberally
5. **Use descriptive migration names** - Future you will thank you
6. **Document complex policies** - Use SQL comments
7. **Check Performance Advisor** - Supabase Dashboard catches common issues
8. **Migration ordering matters** - Use timestamps carefully

---

## Additional Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security Deep Dive](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/postgres/performance)

---

**Next Steps:** After completing migrations, proceed to implementing features using the data layer (repositories) that interact with these tables.
