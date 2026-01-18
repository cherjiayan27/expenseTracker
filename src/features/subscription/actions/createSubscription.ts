"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import { createSubscriptionSchema } from "../domain/subscription.schema";
import { createSubscription as createSubscriptionRepo } from "../data/subscription.repository";
import type { SubscriptionResult, Subscription } from "../domain/subscription.types";

/**
 * Create a new subscription
 * Server Action for form submission
 */
export async function createSubscription(
  formData: FormData
): Promise<SubscriptionResult<Subscription>> {
  try {
    // 1. Authentication check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to create a subscription" };
    }

    // 2. Parse and validate form data
    const rawData = {
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount") as string),
      period: formData.get("period"),
      nextPaymentDate: formData.get("nextPaymentDate"),
      isExpiring: formData.get("isExpiring") === "true",
    };

    const validation = createSubscriptionSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    // 3. Create subscription in database
    const subscription = await createSubscriptionRepo(user.id, validation.data);

    // 4. Revalidate cache
    revalidateTag(`subscriptions:${user.id}`);
    revalidatePath("/subscription");

    return { success: true, data: subscription };
  } catch (error) {
    console.error("createSubscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
