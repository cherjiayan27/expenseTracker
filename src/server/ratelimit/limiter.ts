// In-memory rate limiter
// For MVP/local development - suitable for single-instance deployments
// For production with multiple instances, consider Upstash Redis or similar

// Rate limit policy:
// - Send OTP: max 3 attempts per 15 minutes
// - Verify OTP: max 5 attempts per 15 minutes

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory storage: Map<key, entry>
// Key format: "{identifier}:{action}"
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
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
  // Only cleanup if store is getting large
  if (rateLimitStore.size < 1000) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Reset rate limiter - FOR TESTING ONLY
 * This should only be used in test environments to clear rate limit state
 */
export function resetRateLimiter(): void {
  rateLimitStore.clear();
}

