"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/server/supabase/client.server";

export async function logout(): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();

    // Explicitly clear the auth cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Remove all Supabase auth cookies
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.delete(cookie.name);
      }
    });

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

