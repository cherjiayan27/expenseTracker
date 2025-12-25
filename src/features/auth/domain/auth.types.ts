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

