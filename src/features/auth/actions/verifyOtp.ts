"use server";

import { redirect } from "next/navigation";
import { verifyOtpInputSchema } from "../domain/auth.schema";
import type { AuthResult } from "../domain/auth.types";
import { createServerClient } from "@/server/supabase/client.server";
import {
  checkRateLimit,
  incrementRateLimit,
} from "@/server/ratelimit/limiter";

export async function verifyOtp(
  _prevState: unknown,
  formData: FormData
): Promise<AuthResult<{ message: string }>> {
  try {
    // Extract and validate input
    const phone = formData.get("phone");
    const token = formData.get("token");
    const validation = verifyOtpInputSchema.safeParse({ phone, token });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { phone: validPhone, token: validToken } = validation.data;

    // Check rate limit
    const rateLimitResult = await checkRateLimit(validPhone, "verify_otp");
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: rateLimitResult.error,
      };
    }

    // Verify OTP via Supabase
    const supabase = await createServerClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: validPhone,
      token: validToken,
      type: "sms",
    });

    if (error) {
      // Increment rate limit on failed attempts
      await incrementRateLimit(validPhone, "verify_otp");
      return {
        success: false,
        error: error.message || "Invalid OTP. Please try again.",
      };
    }

    // Increment rate limit on success too (to prevent abuse)
    await incrementRateLimit(validPhone, "verify_otp");

    // On success, redirect to dashboard
    // This will throw, so the return below is technically unreachable
    // but TypeScript requires it for type safety
    redirect("/dashboard");
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

    console.error("verifyOtp error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

