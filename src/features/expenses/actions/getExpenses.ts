"use server";

import { cache } from "react";
import { createServerClient } from "@/server/supabase/client.server";
import { getUserExpenses as getUserExpensesRepo } from "../data/expense.repository";
import type { Expense } from "../domain/expense.types";

// Cache for request-level deduplication
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
  // Note: Next.js fetch caching doesn't apply to Supabase queries
  // We rely on React cache() for request-level deduplication
  // and revalidateTag() for cache invalidation
  const expenses = await getUserExpensesRepo(user.id);

  return expenses;
});

// For cache tagging, we export a helper to get the user's cache tag
export async function getExpensesCacheTag(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? `expenses:${user.id}` : "";
}

