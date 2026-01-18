// Subscription repository - data access layer
// Handles all Supabase database operations for subscriptions

import { cache } from "react";
import { createServerClient } from "@/server/supabase/client.server";
import type { Database } from "@/shared/types/database.types";
import type { 
  Subscription, 
  CreateSubscriptionInput, 
  UpdateSubscriptionInput 
} from "../domain/subscription.types";

type DbSubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type DbSubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];

/**
 * Map database row to domain Subscription type
 */
export function dbRowToSubscription(row: DbSubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    amount: Number(row.amount),
    period: row.period as "Yearly" | "Quarterly" | "Monthly",
    nextPaymentDate: row.next_payment_date,
    isActive: row.is_active,
    isExpiring: row.is_expiring,
    expireDate: row.expire_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all subscriptions for a user, ordered by next payment date
 * Wrapped with React.cache() for per-request deduplication
 */
export const getUserSubscriptions = cache(async (userId: string): Promise<Subscription[]> => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("next_payment_date", { ascending: true });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("Failed to fetch subscriptions");
  }

  return (data || []).map(dbRowToSubscription);
});

/**
 * Create a new subscription
 */
export async function createSubscription(
  userId: string,
  input: CreateSubscriptionInput
): Promise<Subscription> {
  const supabase = await createServerClient();

  const insertData: DbSubscriptionInsert = {
    user_id: userId,
    name: input.name,
    amount: input.amount,
    period: input.period,
    next_payment_date: input.nextPaymentDate,
    is_expiring: input.isExpiring,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }

  return dbRowToSubscription(data);
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  id: string,
  userId: string,
  input: UpdateSubscriptionInput
): Promise<Subscription> {
  const supabase = await createServerClient();

  const updateData: Partial<DbSubscriptionInsert> = {};
  
  if (input.name !== undefined) updateData.name = input.name;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.period !== undefined) updateData.period = input.period;
  if (input.nextPaymentDate !== undefined) updateData.next_payment_date = input.nextPaymentDate;
  if (input.isExpiring !== undefined) updateData.is_expiring = input.isExpiring;

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updateData as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }

  if (!data) {
    throw new Error("Subscription not found");
  }

  return dbRowToSubscription(data);
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string, userId: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting subscription:", error);
    throw new Error("Failed to delete subscription");
  }
}
