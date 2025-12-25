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

