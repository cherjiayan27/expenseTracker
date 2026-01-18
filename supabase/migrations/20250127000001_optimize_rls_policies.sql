-- Optimize RLS policies by wrapping auth.uid() in SELECT statements
-- This allows PostgreSQL to cache the function result per query instead of calling it for every row
-- Reference: https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security

-- ============================================================================
-- EXPENSES TABLE - Optimize RLS Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- Recreate policies with SELECT-wrapped auth.uid() for better performance
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

-- ============================================================================
-- USER_PREFERENCES TABLE - Optimize RLS Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;

-- Recreate policies with SELECT-wrapped auth.uid() for better performance
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

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own expenses" ON public.expenses IS 
  'Optimized RLS policy using SELECT-wrapped auth.uid() for performance';

COMMENT ON POLICY "Users can view own preferences" ON public.user_preferences IS 
  'Optimized RLS policy using SELECT-wrapped auth.uid() for performance';
