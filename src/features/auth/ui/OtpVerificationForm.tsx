"use client";

import { useVerifyOtp } from "../actions/useVerifyOtp";
import { useSendOtp } from "../actions/useSendOtp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OtpVerificationFormProps = {
  phone: string;
  onResend?: () => void;
};

export function OtpVerificationForm({
  phone,
  onResend,
}: OtpVerificationFormProps) {
  const { state, formAction, isPending } = useVerifyOtp();
  const { state: resendState, formAction: resendAction, isPending: isResending } = useSendOtp();

  const handleResendOtp = async () => {
    // Create a FormData with the phone number
    const formData = new FormData();
    formData.append("phone", phone);
    
    // Call the resend action
    resendAction(formData);
  };

  return (
    <form action={formAction} className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Hidden field to pass phone number */}
      <input type="hidden" name="phone" value={phone} />

      {/* OTP Input Section */}
      <div className="w-full mb-6 md:mb-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-baseline justify-center w-full">
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
              className="bg-transparent text-5xl md:text-7xl font-extralight tracking-tighter text-center focus:outline-none placeholder:text-[#E5E5E0] w-[240px] md:w-[320px] transition-all duration-300"
              aria-describedby={!state.success && state.error ? "otp-error" : undefined}
              autoFocus
            />
          </div>
          <div className="h-[1px] w-48 md:w-64 bg-[#E5E5E0] transition-all duration-500" />
        </div>
      </div>

      {/* Error Message */}
      {!state.success && state.error && (
        <div
          id="otp-error"
          className="text-sm text-red-500 font-light tracking-tight mb-6 md:mb-8"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {/* Buttons Section */}
      <div className="flex flex-col items-center gap-6 w-full mb-6 md:mb-8">
        <button 
          type="submit" 
          disabled={isPending} 
          className="group relative inline-flex items-center justify-center px-12 md:px-14 py-4 md:py-5 bg-[#1A1A1A] text-white rounded-full transition-all duration-300 hover:bg-black hover:shadow-2xl hover:shadow-black/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative text-sm md:text-base tracking-widest uppercase font-medium">
            {isPending ? "Verifying..." : "Verify OTP"}
          </span>
        </button>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isPending || isResending}
            className="text-[10px] uppercase tracking-[0.3em] text-[#999990] hover:text-[#1A1A1A] transition-colors duration-300 font-medium disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>

          {resendState.success && (
            <div className="text-xs text-green-600 font-light tracking-tight">
              OTP sent again! Check your phone.
            </div>
          )}

          {!resendState.success && resendState.error && (
            <div className="text-xs text-red-500 font-light tracking-tight">
              {resendState.error}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

