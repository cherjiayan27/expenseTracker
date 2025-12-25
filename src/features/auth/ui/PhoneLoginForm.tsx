"use client";

import { useEffect, useRef } from "react";
import { useSendOtp } from "../actions/useSendOtp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PhoneLoginFormProps = {
  onSuccess: (phone: string) => void;
};

export function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const { state, formAction, isPending } = useSendOtp();
  const phoneNumberRef = useRef("");

  // Custom form action wrapper to construct full phone number
  const handleSubmit = (formData: FormData) => {
    const phoneDigits = formData.get("phoneDigits") as string;
    const fullPhone = `+65${phoneDigits}`;
    phoneNumberRef.current = fullPhone;
    
    // Replace the phoneDigits with full phone in formData
    formData.delete("phoneDigits");
    formData.set("phone", fullPhone);
    
    formAction(formData);
  };

  // When OTP is sent successfully, call onSuccess callback
  useEffect(() => {
    if (state.success && phoneNumberRef.current) {
      onSuccess(phoneNumberRef.current);
    }
  }, [state.success, onSuccess]);

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneDigits">Phone Number</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value="+65"
            disabled
            className="w-16 bg-gray-50"
            aria-label="Country code"
          />
          <Input
            type="tel"
            id="phoneDigits"
            name="phoneDigits"
            placeholder="12345678"
            pattern="[0-9]{8}"
            maxLength={8}
            required
            disabled={isPending}
            className="flex-1"
            aria-describedby={!state.success && state.error ? "phone-error" : undefined}
          />
        </div>
        <p className="text-xs text-gray-500">
          Enter your Singapore phone number (8 digits)
        </p>
      </div>

      {!state.success && state.error && (
        <div
          id="phone-error"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
          role="status"
        >
          {state.data.message}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending..." : "Send OTP"}
      </Button>
    </form>
  );
}

