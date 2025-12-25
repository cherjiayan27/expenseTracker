import { z } from "zod";

// Client-side env schema (NEXT_PUBLIC_* only)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// Server-side env schema (includes secrets)
const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
});

// Parse and export
export const env = {
  // Always available (client + server)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  // Server-only
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
};

// Validate on import (will throw if invalid)
// Only validate if env vars are expected to be set (not during build without .env.local)
const shouldValidate = env.NEXT_PUBLIC_SUPABASE_URL !== undefined;

if (shouldValidate) {
  if (typeof window === "undefined") {
    // Server-side: validate all env vars
    const result = serverEnvSchema.safeParse(env);
    if (!result.success) {
      console.error(
        "❌ Invalid environment variables:",
        result.error.flatten().fieldErrors
      );
      throw new Error("Invalid environment variables");
    }
  } else {
    // Client-side: validate only public env vars
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    });
    if (!result.success) {
      console.error(
        "❌ Invalid environment variables:",
        result.error.flatten().fieldErrors
      );
      throw new Error("Invalid environment variables");
    }
  }
}

