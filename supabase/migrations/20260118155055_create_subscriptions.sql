-- Create subscriptions table
-- Tracks user's recurring payments with support for different billing periods
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL CHECK (period IN ('Yearly', 'Quarterly', 'Monthly')),
  next_payment_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_expiring BOOLEAN NOT NULL DEFAULT false,
  expire_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
-- Primary index on user_id for filtering user's subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Composite index for active subscriptions by user
CREATE INDEX idx_subscriptions_user_active ON public.subscriptions(user_id, is_active);

-- Partial index for date-based queries on active subscriptions
CREATE INDEX idx_subscriptions_user_next_payment 
  ON public.subscriptions(user_id, next_payment_date) 
  WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (optimized with SELECT-wrapped auth.uid())
-- Reference: https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.subscriptions IS 'User subscription tracking with support for multiple billing periods';
COMMENT ON COLUMN public.subscriptions.next_payment_date IS 'Next payment date or final payment date if is_expiring is true';
COMMENT ON COLUMN public.subscriptions.is_expiring IS 'Whether the subscription will expire after next_payment_date';
COMMENT ON COLUMN public.subscriptions.expire_date IS 'Date when subscription actually expired (set when transitioning to inactive)';
COMMENT ON POLICY "Users can view own subscriptions" ON public.subscriptions IS 'Optimized RLS policy using SELECT-wrapped auth.uid() for performance';
