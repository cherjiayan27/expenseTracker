"use client";

import { useVerifyOtp } from "../actions/useVerifyOtp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OtpVerificationFormProps = {
  phone: string;
  onResend: () => void;
};

export function OtpVerificationForm({
  phone,
  onResend,
}: OtpVerificationFormProps) {
  const { state, formAction, isPending } = useVerifyOtp();

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <p>OTP sent to {phone}</p>
        <p className="mt-1 text-xs">
          For testing: use OTP <strong>123456</strong>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Hidden field to pass phone number */}
        <input type="hidden" name="phone" value={phone} />

        <div className="space-y-2">
          <Label htmlFor="token">Enter OTP</Label>
          <Input
            type="text"
            id="token"
            name="token"
            placeholder="123456"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            disabled={isPending}
            autoComplete="one-time-code"
            inputMode="numeric"
            aria-describedby={!state.success && state.error ? "otp-error" : undefined}
          />
          <p className="text-xs text-gray-500">Enter the 6-digit code</p>
        </div>

        {!state.success && state.error && (
          <div
            id="otp-error"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {state.error}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResend}
          disabled={isPending}
        >
          Resend OTP
        </Button>
      </div>
    </div>
  );
}

