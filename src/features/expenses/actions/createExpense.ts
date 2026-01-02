"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import { createExpenseSchema } from "../domain/expense.schema";
import { createExpense as createExpenseRepo } from "../data/expense.repository";
import type { ExpenseResult, Expense } from "../domain/expense.types";

export async function createExpense(
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

    // Return error instead of redirecting - middleware handles auth redirects
    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to create an expense",
      };
    }

    // Parse and validate form data
    const rawData = {
      amount: formData.get("amount"),
      description: formData.get("description"),
      category: formData.get("category"),
      subCategory: formData.get("subCategory"),
      owedTo: formData.get("owedTo"),
      date: formData.get("date"),
    };

    // Convert amount to number
    const amount = rawData.amount ? parseFloat(rawData.amount as string) : undefined;
    
    if (amount === undefined || isNaN(amount)) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    // Validate with Zod
    const validation = createExpenseSchema.safeParse({
      amount,
      description: rawData.description || undefined,
      category: rawData.category as string,
      subCategory: rawData.subCategory || null,
      owedTo: rawData.owedTo || null,
      date: rawData.date || undefined,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    // Create expense in database
    const expense = await createExpenseRepo(user.id, validation.data);

    // Revalidate cache by tag and path
    revalidateTag(`expenses:${user.id}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    console.error("createExpense error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

