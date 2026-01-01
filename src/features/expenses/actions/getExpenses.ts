"use server";

import { cache } from "react";
import { createServerClient } from "@/server/supabase/client.server";
import { getUserExpenses as getUserExpensesRepo } from "../data/expense.repository";
import type { Expense } from "../domain/expense.types";

// Server Action with React cache for request-level deduplication
export const getExpenses = cache(async (): Promise<Expense[]> => {
  // Get authenticated user
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Don't redirect here - let middleware handle authentication
  // This prevents redirect loops between middleware and Server Components
  if (authError || !user) {
    return []; // Return empty array, graceful degradation
  }

  // Fetch expenses from repository
  // React cache() provides request-level deduplication
  // revalidatePath() in mutations will refresh the page data
  const expenses = await getUserExpensesRepo(user.id);

  return expenses;
});

