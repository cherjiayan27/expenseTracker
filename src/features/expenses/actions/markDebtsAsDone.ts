"use server";

import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { createServerClient } from "@/server/supabase/client.server";
import type { Database } from "@/shared/types/database.types";

type MarkDebtsResult =
  | { success: true }
  | { success: false; error: string };

const markDebtsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "No debts selected"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export async function markDebtsAsDone(
  ids: string[],
  date: string
): Promise<MarkDebtsResult> {
  try {
    const validation = markDebtsSchema.safeParse({ ids, date });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to update debts",
      };
    }

    const updateData: Database["public"]["Tables"]["expenses"]["Update"] = {
      owed_to: null,
      date,
    };

    const { error } = await supabase
      .from("expenses")
      .update(updateData as never)
      .in("id", validation.data.ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking debts as done:", error);
      return {
        success: false,
        error: "Failed to update debts",
      };
    }

    revalidateTag(`expenses:${user.id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("markDebtsAsDone error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
