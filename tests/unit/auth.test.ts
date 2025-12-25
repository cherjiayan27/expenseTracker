import { describe, it, expect } from "vitest";
import { phoneSchema, otpSchema } from "@/features/auth/domain/auth.schema";
import { isValidPhone, isValidOtp } from "@/features/auth/domain/auth.validation";

describe("Phone Validation", () => {
  describe("phoneSchema", () => {
    it("accepts valid Singapore phone numbers", () => {
      expect(phoneSchema.safeParse("+6512345678").success).toBe(true);
      expect(phoneSchema.safeParse("+6598765432").success).toBe(true);
      expect(phoneSchema.safeParse("+6561234567").success).toBe(true);
    });

    it("rejects phone numbers without +65 prefix", () => {
      expect(phoneSchema.safeParse("12345678").success).toBe(false);
      expect(phoneSchema.safeParse("98765432").success).toBe(false);
    });

    it("rejects phone numbers with wrong country code", () => {
      expect(phoneSchema.safeParse("+1234567890").success).toBe(false);
      expect(phoneSchema.safeParse("+4412345678").success).toBe(false);
    });

    it("rejects phone numbers with wrong length", () => {
      expect(phoneSchema.safeParse("+6512").success).toBe(false);
      expect(phoneSchema.safeParse("+65123").success).toBe(false);
      expect(phoneSchema.safeParse("+651234567").success).toBe(false);
      expect(phoneSchema.safeParse("+65123456789").success).toBe(false);
    });

    it("rejects non-numeric characters", () => {
      expect(phoneSchema.safeParse("+65abcd1234").success).toBe(false);
      expect(phoneSchema.safeParse("+65-1234-5678").success).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("returns true for valid Singapore phone numbers", () => {
      expect(isValidPhone("+6512345678")).toBe(true);
      expect(isValidPhone("+6598765432")).toBe(true);
    });

    it("returns false for invalid phone numbers", () => {
      expect(isValidPhone("12345678")).toBe(false);
      expect(isValidPhone("+6512")).toBe(false);
      expect(isValidPhone("+1234567890")).toBe(false);
    });
  });
});

describe("OTP Validation", () => {
  describe("otpSchema", () => {
    it("accepts valid 6-digit OTPs", () => {
      expect(otpSchema.safeParse("123456").success).toBe(true);
      expect(otpSchema.safeParse("000000").success).toBe(true);
      expect(otpSchema.safeParse("999999").success).toBe(true);
    });

    it("rejects OTPs with wrong length", () => {
      expect(otpSchema.safeParse("12345").success).toBe(false);
      expect(otpSchema.safeParse("1234567").success).toBe(false);
      expect(otpSchema.safeParse("1").success).toBe(false);
    });

    it("rejects non-numeric OTPs", () => {
      expect(otpSchema.safeParse("abcdef").success).toBe(false);
      expect(otpSchema.safeParse("12345a").success).toBe(false);
      expect(otpSchema.safeParse("12-345").success).toBe(false);
    });
  });

  describe("isValidOtp", () => {
    it("returns true for valid OTPs", () => {
      expect(isValidOtp("123456")).toBe(true);
      expect(isValidOtp("000000")).toBe(true);
    });

    it("returns false for invalid OTPs", () => {
      expect(isValidOtp("12345")).toBe(false);
      expect(isValidOtp("1234567")).toBe(false);
      expect(isValidOtp("abcdef")).toBe(false);
    });
  });
});

