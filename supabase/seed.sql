-- Seed data for development and testing
-- Insert sample expenses for test user

-- Get first test user
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE phone = '+6512345678'
  LIMIT 1;

  -- Only insert if user exists
  IF test_user_id IS NOT NULL THEN
    -- Insert sample expenses
    INSERT INTO public.expenses (user_id, amount, description, category, date) VALUES
      (test_user_id, 15.50, 'Lunch at hawker centre', 'Food', CURRENT_DATE),
      (test_user_id, 45.00, 'Grab to office', 'Transport', CURRENT_DATE - 1),
      (test_user_id, 120.00, 'Groceries', 'Shopping', CURRENT_DATE - 2),
      (test_user_id, 25.00, 'Movie tickets', 'Entertainment', CURRENT_DATE - 3),
      (test_user_id, 8.50, 'Coffee', 'Food', CURRENT_DATE - 4);
  END IF;
END $$;
