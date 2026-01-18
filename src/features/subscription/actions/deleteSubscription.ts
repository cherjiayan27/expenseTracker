"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import { deleteSubscription as deleteSubscriptionRepo } from "../data/subscription.repository";
import type { SubscriptionResult } from "../domain/subscription.types";

/**
 * Delete a subscription
 * Server Action
 */
export async function deleteSubscription(
  id: string
): Promise<SubscriptionResult<void>> {
  try {
    // 1. Authentication check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to delete a subscription" };
    }

    // 2. Delete subscription from database
    await deleteSubscriptionRepo(id, user.id);

    // 3. Revalidate cache
    revalidateTag(`subscriptions:${user.id}`);
    revalidatePath("/subscription");

    return { success: true };
  } catch (error) {
    console.error("deleteSubscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
