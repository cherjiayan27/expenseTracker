// Expense repository - data access layer
// Handles all Supabase database operations for expenses

import { createServerClient } from "@/server/supabase/client.server";
import type { Database } from "@/shared/types/database.types";
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from "../domain/expense.types";

type DbExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type DbExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];

/**
 * Map database row to domain Expense type
 */
export function dbRowToExpense(row: DbExpenseRow): Expense {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    description: row.description,
    category: row.category,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all expenses for a user, ordered by date descending
 */
export async function getUserExpenses(userId: string): Promise<Expense[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    throw new Error("Failed to fetch expenses");
  }

  return (data || []).map(dbRowToExpense);
}

/**
 * Create a new expense
 */
export async function createExpense(
  userId: string,
  input: CreateExpenseInput
): Promise<Expense> {
  const supabase = await createServerClient();

  const insertData: DbExpenseInsert = {
    user_id: userId,
    amount: input.amount,
    description: input.description,
    category: input.category ?? null,
    date: input.date || new Date().toISOString().split("T")[0]!,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error("Error creating expense:", error);
    throw new Error("Failed to create expense");
  }

  return dbRowToExpense(data);
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: string,
  userId: string,
  input: UpdateExpenseInput
): Promise<Expense> {
  const supabase = await createServerClient();

  const updateData: Partial<DbExpenseInsert> = {};
  
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.date !== undefined) updateData.date = input.date;

  const { data, error } = await supabase
    .from("expenses")
    .update(updateData as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating expense:", error);
    throw new Error("Failed to update expense");
  }

  if (!data) {
    throw new Error("Expense not found");
  }

  return dbRowToExpense(data);
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string, userId: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting expense:", error);
    throw new Error("Failed to delete expense");
  }
}

