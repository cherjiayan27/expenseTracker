"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import { deleteExpense as deleteExpenseRepo } from "../data/expense.repository";
import type { ExpenseResult } from "../domain/expense.types";

export async function deleteExpense(
  expenseId: string
): Promise<ExpenseResult<null>> {
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
        error: "You must be logged in to delete an expense",
      };
    }

    // Delete expense from database
    await deleteExpenseRepo(expenseId, user.id);

    // Revalidate cache by tag and path
    revalidateTag(`expenses:${user.id}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("deleteExpense error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
