# Step 3: Phone OTP Authentication

This step implements phone-based OTP authentication with rate limiting, following Vertical Slice Architecture.

---

## Instructions (What To Do)

### Prerequisites

- Steps 1 and 2 completed
- Supabase running with test OTP configured
- Test phone number configured in `supabase/config.toml`

### 1. Create Domain Types

Create `src/features/auth/domain/auth.types.ts`:

```typescript
// Auth domain types
// Pure TypeScript types for authentication

export type AuthResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type SendOtpInput = {
  phone: string;
};

export type VerifyOtpInput = {
  phone: string;
  token: string;
};

export type RateLimitInfo = {
  allowed: boolean;
  remaining: number;
  resetAt?: number;
};
```

### 2. Create Validation Schemas

Create `src/features/auth/domain/auth.schema.ts`:

```typescript
// Auth domain Zod schemas
// Validation schemas for authentication inputs

import { z } from "zod";

// Phone number schema: Must start with +65 and have 8 digits after
export const phoneSchema = z
  .string()
  .regex(/^\+65\d{8}$/, "Phone must be +65 followed by 8 digits");

// OTP schema: Exactly 6 digits
export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP must be exactly 6 digits");

// Schema for sending OTP
export const sendOtpInputSchema = z.object({
  phone: phoneSchema,
});

// Schema for verifying OTP
export const verifyOtpInputSchema = z.object({
  phone: phoneSchema,
  token: otpSchema,
});
```

### 3. Create Validation Functions

Create `src/features/auth/domain/auth.validation.ts`:

```typescript
// Auth domain validation functions
// Pure functions for validation (no side effects)

/**
 * Check if a phone number is valid Singapore format (+65 followed by 8 digits)
 */
export function isValidPhone(phone: string): boolean {
  return /^\+65\d{8}$/.test(phone);
}

/**
 * Check if an OTP is valid (exactly 6 digits)
 */
export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}
```

### 4. Create Rate Limiter

Create `src/server/ratelimit/limiter.ts`:

```typescript
// In-memory rate limiter
// For MVP/local development - suitable for single-instance deployments
// For production with multiple instances, consider Upstash Redis or similar

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const LIMITS = {
  send_otp: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  verify_otp: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
} as const;

export type RateLimitResult =
  | { success: true; remaining: number }
  | { success: false; error: string; retryAfter?: number; remaining: number };

/**
 * Check if a request is allowed under rate limiting rules
 */
export async function checkRateLimit(
  identifier: string,
  action: "send_otp" | "verify_otp"
): Promise<RateLimitResult> {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  const config = LIMITS[action];

  // Clean up expired entries periodically
  cleanupExpiredEntries(now);

  const entry = rateLimitStore.get(key);

  // No entry exists - first attempt
  if (!entry) {
    return {
      success: true,
      remaining: config.maxAttempts - 1,
    };
  }

  // Entry exists but expired - reset
  if (now >= entry.resetAt) {
    rateLimitStore.delete(key);
    return {
      success: true,
      remaining: config.maxAttempts - 1,
    };
  }

  // Entry exists and not expired - check limit
  if (entry.count >= config.maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return {
      success: false,
      error: `Too many attempts. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfter: entry.resetAt,
      remaining: 0,
    };
  }

  // Under limit
  return {
    success: true,
    remaining: config.maxAttempts - entry.count - 1,
  };
}

/**
 * Increment the rate limit counter for an identifier and action
 */
export async function incrementRateLimit(
  identifier: string,
  action: "send_otp" | "verify_otp"
): Promise<void> {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  const config = LIMITS[action];

  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
  } else {
    // Increment existing entry
    entry.count += 1;
    rateLimitStore.set(key, entry);
  }
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(now: number): void {
  if (rateLimitStore.size < 1000) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Reset rate limiter - FOR TESTING ONLY
 */
export function resetRateLimiter(): void {
  rateLimitStore.clear();
}
```

### 5. Create Server Actions

**Send OTP** - `src/features/auth/actions/sendOtp.ts`:

```typescript
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
```

**Verify OTP** - `src/features/auth/actions/verifyOtp.ts`:

```typescript
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
```

**Logout** - `src/features/auth/actions/logout.ts`:

```typescript
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
    redirect("/login");
  }
}
```

### 6. Create Client Hooks

**useSendOtp** - `src/features/auth/actions/useSendOtp.ts`:

```typescript
"use client";

import { useActionState } from "react";
import { sendOtp } from "./sendOtp";
import type { AuthResult } from "../domain/auth.types";

const initialState: AuthResult<{ message: string }> = {
  success: false,
  error: "",
};

export function useSendOtp() {
  const [state, formAction, isPending] = useActionState(
    sendOtp,
    initialState
  );

  return {
    state,
    formAction,
    isPending,
  };
}
```

**useVerifyOtp** - `src/features/auth/actions/useVerifyOtp.ts`:

```typescript
"use client";

import { useActionState } from "react";
import { verifyOtp } from "./verifyOtp";
import type { AuthResult } from "../domain/auth.types";

const initialState: AuthResult<{ message: string }> = {
  success: false,
  error: "",
};

export function useVerifyOtp() {
  const [state, formAction, isPending] = useActionState(
    verifyOtp,
    initialState
  );

  return {
    state,
    formAction,
    isPending,
  };
}
```

**useLogout** - `src/features/auth/actions/useLogout.ts`:

```typescript
"use client";

import { useTransition } from "react";
import { logout } from "./logout";

export function useLogout() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return {
    logout: handleLogout,
    isPending,
  };
}
```

### 7. Create UI Components

**PhoneLoginForm** - `src/features/auth/ui/PhoneLoginForm.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSendOtp } from "../actions/useSendOtp";

type PhoneLoginFormProps = {
  onSuccess: (phone: string) => void;
};

export function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const { state, formAction, isPending } = useSendOtp();
  const phoneNumberRef = useRef("");
  const [phoneDigits, setPhoneDigits] = useState("");

  // When OTP is sent successfully, call onSuccess callback
  useEffect(() => {
    if (state.success && phoneNumberRef.current) {
      onSuccess(phoneNumberRef.current);
    }
  }, [state.success, onSuccess]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\s/g, '');
    setPhoneDigits(digits);
    const fullPhone = `+65${digits}`;
    phoneNumberRef.current = fullPhone;

    const fullPhoneInput = document.getElementById("fullPhone") as HTMLInputElement;
    if (fullPhoneInput) {
      fullPhoneInput.value = fullPhone;
    }
  };

  const handleSubmit = () => {
    const fullPhone = `+65${phoneDigits}`;
    phoneNumberRef.current = fullPhone;

    const hiddenInput = document.getElementById("fullPhone") as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = fullPhone;
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-full max-w-md mx-auto"
    >
      <div className="w-full mb-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-baseline justify-center w-full gap-2">
            <span className="text-3xl font-extralight text-gray-400 select-none">
              +65
            </span>
            <input
              type="tel"
              id="phoneDigits"
              name="phoneDigits"
              placeholder="0000 0000"
              pattern="[0-9]{8}"
              maxLength={8}
              required
              disabled={isPending}
              value={phoneDigits}
              onChange={handlePhoneChange}
              className="bg-transparent text-5xl font-extralight tracking-tighter text-center focus:outline-none placeholder:text-gray-200 w-[240px]"
              autoFocus
            />
          </div>
        </div>
      </div>

      {!state.success && state.error && (
        <div className="text-sm text-red-500 mb-6" role="alert">
          {state.error}
        </div>
      )}

      {/* Hidden field to pass full phone number */}
      <input type="hidden" name="phone" id="fullPhone" />

      <button
        type="submit"
        disabled={isPending}
        className="px-12 py-4 bg-black text-white rounded-full disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Login with OTP"}
      </button>
    </form>
  );
}
```

**OtpVerificationForm** - `src/features/auth/ui/OtpVerificationForm.tsx`:

```tsx
"use client";

import { useVerifyOtp } from "../actions/useVerifyOtp";
import { useSendOtp } from "../actions/useSendOtp";

type OtpVerificationFormProps = {
  phone: string;
  onResend?: () => void;
};

export function OtpVerificationForm({ phone }: OtpVerificationFormProps) {
  const { state, formAction, isPending } = useVerifyOtp();
  const { state: resendState, formAction: resendAction, isPending: isResending } = useSendOtp();

  const handleResendOtp = async () => {
    const formData = new FormData();
    formData.append("phone", phone);
    resendAction(formData);
  };

  return (
    <form action={formAction} className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Hidden field to pass phone number */}
      <input type="hidden" name="phone" value={phone} />

      <div className="w-full mb-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <input
            type="text"
            id="token"
            name="token"
            placeholder="000000"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            disabled={isPending}
            autoComplete="one-time-code"
            inputMode="numeric"
            className="bg-transparent text-5xl font-extralight tracking-tighter text-center focus:outline-none placeholder:text-gray-200 w-[240px]"
            autoFocus
          />
        </div>
      </div>

      {!state.success && state.error && (
        <div className="text-sm text-red-500 mb-6" role="alert">
          {state.error}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 w-full mb-6">
        <button
          type="submit"
          disabled={isPending}
          className="px-12 py-4 bg-black text-white rounded-full disabled:opacity-50"
        >
          {isPending ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isPending || isResending}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>

          {resendState.success && (
            <div className="text-xs text-green-600">
              OTP sent again! Check your phone.
            </div>
          )}

          {!resendState.success && resendState.error && (
            <div className="text-xs text-red-500">
              {resendState.error}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
```

**LogoutButton** - `src/features/auth/ui/LogoutButton.tsx`:

```tsx
"use client";

import { useLogout } from "../actions/useLogout";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { logout, isPending } = useLogout();

  return (
    <Button
      onClick={logout}
      disabled={isPending}
      variant="ghost"
      size="sm"
    >
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}
```

### 8. Create Feature Public API

Create `src/features/auth/index.ts`:

```typescript
// Auth feature public API
// Only exports from this file should be imported by other features or app routes

// Domain types
export type { AuthResult, SendOtpInput, VerifyOtpInput } from "./domain/auth.types";

// Hooks
export { useSendOtp } from "./actions/useSendOtp";
export { useVerifyOtp } from "./actions/useVerifyOtp";
export { useLogout } from "./actions/useLogout";

// UI Components
export { PhoneLoginForm } from "./ui/PhoneLoginForm";
export { OtpVerificationForm } from "./ui/OtpVerificationForm";
export { LogoutButton } from "./ui/LogoutButton";
```

### 9. Create Login Page

Update `src/app/(public)/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { PhoneLoginForm, OtpVerificationForm } from "@/features/auth";

type Step = "phone" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");

  const handlePhoneSuccess = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setStep("otp");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {step === "phone" && (
        <PhoneLoginForm onSuccess={handlePhoneSuccess} />
      )}

      {step === "otp" && (
        <OtpVerificationForm phone={phone} />
      )}
    </div>
  );
}
```

### 10. Add LogoutButton to App Layout

Update `src/app/(app)/layout.tsx` to include the logout button:

```tsx
import { LogoutButton } from "@/features/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="flex justify-between items-center p-4 border-b">
        <span className="font-semibold">My App</span>
        <LogoutButton />
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

### Verification

1. **Type check:**
   ```bash
   npm run typecheck
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Manual test:**
   - Start dev server: `npm run dev`
   - Go to http://localhost:3000/login
   - Enter phone: `12345678`
   - Enter OTP: `123456`
   - Should redirect to dashboard

---

## Reference (What Was Done in This Project)

### File Structure Created

```
src/features/auth/
├── domain/
│   ├── auth.types.ts
│   ├── auth.schema.ts
│   └── auth.validation.ts
├── actions/
│   ├── sendOtp.ts
│   ├── verifyOtp.ts
│   ├── logout.ts
│   ├── useSendOtp.ts
│   ├── useVerifyOtp.ts
│   └── useLogout.ts
├── ui/
│   ├── PhoneLoginForm.tsx
│   ├── OtpVerificationForm.tsx
│   └── LogoutButton.tsx
└── index.ts

src/server/ratelimit/
└── limiter.ts
```

Note: No separate `index.ts` files in subdirectories - all exports are centralized in `auth/index.ts`.

### Rate Limiting Configuration

| Action | Max Attempts | Window |
|--------|--------------|--------|
| send_otp | 3 | 15 minutes |
| verify_otp | 5 | 15 minutes |

### Authentication Flow

1. User enters phone number (8 digits, without +65 prefix)
2. Form prepends +65 and calls `sendOtp` server action
3. Supabase sends OTP (or uses test OTP locally)
4. User enters 6-digit OTP in `token` field
5. `verifyOtp` validates and creates session
6. User redirected to `/dashboard`
7. Session managed via cookies by Supabase

### Test Credentials

- **Phone**: `+6512345678` (enter `12345678` in form)
- **OTP**: `123456`

### Key Architecture Points

1. **Domain Layer**: Pure TypeScript, no React/Next/Supabase imports
2. **Server Actions**: Use `(_prevState, formData)` signature for `useActionState`
3. **Client Hooks**: Pass server action directly to `useActionState` (no wrapper function)
4. **Rate Limiting**: Separate `checkRateLimit` and `incrementRateLimit` functions
5. **Error Handling**: All errors returned as `AuthResult`, displayed inline
6. **Redirect Handling**: Server actions catch and rethrow Next.js redirect errors

### Security Features

- Server-side validation of all inputs
- Rate limiting prevents OTP abuse
- Session cookies managed by Supabase
- Middleware protects authenticated routes
- Explicit cookie cleanup on logout

### Naming Conventions

- Schema names: `sendOtpInputSchema`, `verifyOtpInputSchema`
- OTP field: `token` (not `otp`)
- Rate limit actions: `send_otp`, `verify_otp` (underscore format)
- Hook return: `logout` function (not `handleLogout`)
