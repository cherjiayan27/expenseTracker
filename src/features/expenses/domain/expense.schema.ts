// Expense validation schemas using Zod
// Domain-level validation rules

import { z } from "zod";

// Helper to check if date is not in the future
const notFutureDate = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate <= today;
};

// Create expense schema
export const createExpenseSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .max(9999999.99, "Amount is too large"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less")
    .trim(),
  category: z
    .string()
    .max(50, "Category must be 50 characters or less")
    .nullable()
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(notFutureDate, "Date cannot be in the future")
    .optional(),
});

// Update expense schema (all fields optional)
export const updateExpenseSchema = createExpenseSchema.partial();

// For form data parsing
export const createExpenseFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  date: z.string().optional(),
});

