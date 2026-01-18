"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import { updateSubscriptionSchema } from "../domain/subscription.schema";
import { updateSubscription as updateSubscriptionRepo } from "../data/subscription.repository";
import type { SubscriptionResult, Subscription } from "../domain/subscription.types";

/**
 * Update an existing subscription
 * Server Action for form submission
 */
export async function updateSubscription(
  id: string,
  formData: FormData
): Promise<SubscriptionResult<Subscription>> {
  try {
    // 1. Authentication check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to update a subscription" };
    }

    // 2. Parse and validate form data
    const rawData: Record<string, unknown> = {};
    
    const name = formData.get("name");
    const amount = formData.get("amount");
    const period = formData.get("period");
    const nextPaymentDate = formData.get("nextPaymentDate");
    const isExpiring = formData.get("isExpiring");

    if (name !== null) rawData.name = name;
    if (amount !== null) rawData.amount = parseFloat(amount as string);
    if (period !== null) rawData.period = period;
    if (nextPaymentDate !== null) rawData.nextPaymentDate = nextPaymentDate;
    if (isExpiring !== null) rawData.isExpiring = isExpiring === "true";

    const validation = updateSubscriptionSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    // 3. Update subscription in database
    const subscription = await updateSubscriptionRepo(id, user.id, validation.data);

    // 4. Revalidate cache
    revalidateTag(`subscriptions:${user.id}`);
    revalidatePath("/subscription");

    return { success: true, data: subscription };
  } catch (error) {
    console.error("updateSubscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
