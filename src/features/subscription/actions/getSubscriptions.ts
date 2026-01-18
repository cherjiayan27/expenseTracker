"use server";

import { createServerClient } from "@/server/supabase/client.server";
import { getUserSubscriptions } from "../data/subscription.repository";
import type { Subscription } from "../domain/subscription.types";

/**
 * Get all subscriptions for the current user
 * Server-side data fetching with automatic caching via React.cache() in repository
 */
export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // The repository function is already wrapped with React.cache()
  // for per-request deduplication, and Next.js will handle caching
  // via revalidateTag/revalidatePath in our mutations
  return getUserSubscriptions(user.id);
}
