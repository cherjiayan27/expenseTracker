"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import { updateExpenseSchema } from "../domain/expense.schema";
import { updateExpense as updateExpenseRepo } from "../data/expense.repository";
import type { ExpenseResult, Expense } from "../domain/expense.types";

export async function updateExpense(
  expenseId: string,
  _prevState: unknown,
  formData: FormData
): Promise<ExpenseResult<Expense>> {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to update an expense",
      };
    }

    // Parse and validate form data (all fields optional for updates)
    const rawAmount = formData.get("amount");
    const amount = rawAmount ? parseFloat(rawAmount as string) : undefined;

    // If amount was provided but is invalid, fail fast
    if (rawAmount && (amount === undefined || isNaN(amount))) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    // Validate with Zod (partial schema)
    const validation = updateExpenseSchema.safeParse({
      amount,
      description: formData.get("description") || undefined,
      category: formData.get("category") || undefined,
      subCategory: formData.get("subCategory") || undefined,
      owedTo: formData.get("owedTo") || undefined,
      date: formData.get("date") || undefined,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    // Update expense in database
    const expense = await updateExpenseRepo(expenseId, user.id, validation.data);

    // Revalidate cache by tag and path
    revalidateTag(`expenses:${user.id}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    console.error("updateExpense error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
