// Expense domain types
// Pure TypeScript types with no external dependencies

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export type CreateExpenseInput = {
  amount: number;
  description: string;
  category?: string | null;
  date?: string; // Optional, defaults to today
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

// Discriminated union for Server Action results
export type ExpenseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

