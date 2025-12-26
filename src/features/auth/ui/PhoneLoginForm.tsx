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

  // When OTP is sent successfully, call onSuccess callback
  useEffect(() => {
    if (state.success && phoneNumberRef.current) {
      onSuccess(phoneNumberRef.current);
    }
  }, [state.success, onSuccess]);

  // Handle form submission - ensure phone number is captured before server action
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Read the phone input value directly from DOM
    const phoneInput = document.getElementById("phoneDigits") as HTMLInputElement;
    if (phoneInput) {
      const digits = phoneInput.value.replace(/\s/g, '');
      const fullPhone = `+65${digits}`;
      
      // Update ref for later use in useEffect
      phoneNumberRef.current = fullPhone;
      
      // Update hidden field for server action
      const hiddenInput = document.getElementById("fullPhone") as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = fullPhone;
      }
    }
    
    // Don't prevent default - let the form action proceed
  };

  return (
    <form 
      action={formAction} 
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-full max-w-md mx-auto"
    >
      {/* Phone Input Section */}
      <div className="w-full mb-6 md:mb-8">
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Country Code & Phone Input Area */}
          <div className="flex items-baseline justify-center w-full gap-2">
            <span className="text-3xl md:text-4xl font-extralight text-[#999990] select-none">
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
              onChange={(e) => {
                const digits = e.target.value.replace(/\s/g, '');
                const fullPhone = `+65${digits}`;
                
                // Store in ref for later use
                phoneNumberRef.current = fullPhone;
                
                // Update hidden field
                const fullPhoneInput = document.getElementById("fullPhone") as HTMLInputElement;
                if (fullPhoneInput) {
                  fullPhoneInput.value = fullPhone;
                }
              }}
              className="bg-transparent text-5xl md:text-7xl font-extralight tracking-tighter text-center focus:outline-none placeholder:text-[#E5E5E0] w-[240px] md:w-[320px] transition-all duration-300"
              aria-describedby={!state.success && state.error ? "phone-error" : undefined}
              autoFocus
            />
          </div>
          <div className="h-[1px] w-48 md:w-64 bg-[#E5E5E0] transition-all duration-500 group-focus-within:w-full" />
        </div>
      </div>

      {/* Error Message */}
      {!state.success && state.error && (
        <div
          id="phone-error"
          className="text-sm text-red-500 font-light tracking-tight mb-6 md:mb-8"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {/* Success Message */}
      {state.success && (
        <div
          className="text-sm text-green-600 font-light tracking-tight mb-6 md:mb-8"
          role="status"
        >
          {state.data.message}
        </div>
      )}

      {/* Hidden field to pass full phone number - placed at bottom */}
      <input type="hidden" name="phone" id="fullPhone" />

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isPending} 
        className="group relative inline-flex items-center justify-center px-12 md:px-14 py-4 md:py-5 bg-[#1A1A1A] text-white rounded-full transition-all duration-300 hover:bg-black hover:shadow-2xl hover:shadow-black/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-6 md:mb-8"
      >
        <span className="relative text-sm md:text-base tracking-widest uppercase font-medium">
          {isPending ? "Sending..." : "Login with OTP"}
        </span>
      </button>
    </form>
  );
}

