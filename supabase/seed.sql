-- Seed data for development and testing
-- Insert sample expenses for test users

DO $$
DECLARE
  test_user_id UUID;
  phone_number TEXT;
BEGIN
  -- Loop through all test phone numbers and insert sample data for each
  FOR phone_number IN 
    SELECT unnest(ARRAY['+6512345678', '+6587654321', '+6588888888', '+6599999999'])
  LOOP
    -- Get user ID for this phone number
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE phone = phone_number
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
  END LOOP;
END $$;
