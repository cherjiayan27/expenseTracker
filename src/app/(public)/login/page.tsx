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

  const handleBackToPhone = () => {
    setStep("phone");
    setPhone("");
  };

  const handleResendOtp = () => {
    // Go back to phone step to resend
    setStep("phone");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === "phone"
              ? "Enter your phone number to receive an OTP"
              : "Enter the OTP sent to your phone"}
          </p>
        </div>

        {step === "phone" && <PhoneLoginForm onSuccess={handlePhoneSuccess} />}

        {step === "otp" && (
          <div className="space-y-4">
            <OtpVerificationForm phone={phone} onResend={handleResendOtp} />
            <button
              type="button"
              onClick={handleBackToPhone}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ← Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


