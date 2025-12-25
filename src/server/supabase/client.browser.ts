// Browser Supabase client
// For use in Client Components
// Uses @supabase/ssr createBrowserClient

import { createBrowserClient as createClient } from "@supabase/ssr";
import { env } from "@/shared/config/env";
import type { Database } from "@/shared/types/database.types";

export function createBrowserClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

