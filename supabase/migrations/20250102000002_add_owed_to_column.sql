-- Add owed_to column to expenses table
-- This column stores the name of the person the user owes money to
-- NULL when the expense is not an owed amount

ALTER TABLE public.expenses
ADD COLUMN owed_to TEXT NULL;

-- Add a check constraint to ensure owed_to is not an empty string
ALTER TABLE public.expenses
ADD CONSTRAINT owed_to_not_empty CHECK (
  owed_to IS NULL OR char_length(trim(owed_to)) > 0
);

-- Add comment for documentation
COMMENT ON COLUMN public.expenses.owed_to IS 'Name of the person the user owes money to. NULL if this is not an owed expense.';

