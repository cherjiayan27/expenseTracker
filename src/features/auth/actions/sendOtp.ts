"use server";

import { sendOtpInputSchema } from "../domain/auth.schema";
import type { AuthResult } from "../domain/auth.types";
import { createServerClient } from "@/server/supabase/client.server";
import {
  checkRateLimit,
  incrementRateLimit,
} from "@/server/ratelimit/limiter";

export async function sendOtp(
  _prevState: unknown,
  formData: FormData
): Promise<AuthResult<{ message: string }>> {
  try {
    // Extract and validate input
    const phone = formData.get("phone");
    const validation = sendOtpInputSchema.safeParse({ phone });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid phone number",
      };
    }

    const { phone: validPhone } = validation.data;

    // Check rate limit
    const rateLimitResult = await checkRateLimit(validPhone, "send_otp");
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: rateLimitResult.error,
      };
    }

    // Send OTP via Supabase
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: validPhone,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to send OTP. Please try again.",
      };
    }

    // Increment rate limit counter
    await incrementRateLimit(validPhone, "send_otp");

    return {
      success: true,
      data: {
        message: "OTP sent successfully. Please check your phone.",
      },
    };
  } catch (error) {
    console.error("sendOtp error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

