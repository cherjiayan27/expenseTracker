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

