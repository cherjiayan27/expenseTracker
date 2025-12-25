"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/server/supabase/client.server";

export async function logout(): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();

    // Redirect to login page after logout
    redirect("/login");
  } catch (error) {
    // If the error is from redirect(), rethrow it
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("logout error:", error);
    // Even if signOut fails, redirect to login
    redirect("/login");
  }
}

