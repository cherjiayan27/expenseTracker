-- Make description column optional (nullable)
-- This allows users to create expenses without a description

-- First, drop the check constraint
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS expenses_description_check;

-- Then, make the column nullable
ALTER TABLE public.expenses 
ALTER COLUMN description DROP NOT NULL;

-- Re-add the check constraint, but only check length when description is provided
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_description_check 
CHECK (description IS NULL OR (char_length(description) > 0 AND char_length(description) <= 200));

