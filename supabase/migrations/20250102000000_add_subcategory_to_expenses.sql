-- Add sub_category column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN sub_category TEXT;

-- Add an index for querying by sub_category
CREATE INDEX idx_expenses_subcategory ON public.expenses(sub_category);

-- Optional: Add comment to document the column
COMMENT ON COLUMN public.expenses.sub_category IS 'Optional sub-category for more detailed expense classification';

