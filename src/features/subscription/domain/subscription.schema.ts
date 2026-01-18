// Subscription validation schemas using Zod
// Domain-level validation rules

import { z } from "zod";

// Helper to check if date is not in the past
const notPastDate = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= today; // Can be today or future
};

// Create subscription schema
export const createSubscriptionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .max(9999999.99, "Amount is too large"),
  period: z.enum(["Yearly", "Quarterly", "Monthly"], {
    required_error: "Billing cycle is required",
  }),
  nextPaymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(notPastDate, "Payment date cannot be in the past"),
  isExpiring: z.boolean().default(false),
});

// Update subscription schema (all fields optional)
export const updateSubscriptionSchema = createSubscriptionSchema.partial();
