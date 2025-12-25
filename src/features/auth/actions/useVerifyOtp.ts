"use client";

import { useActionState } from "react";
import { verifyOtp } from "./verifyOtp";
import type { AuthResult } from "../domain/auth.types";

const initialState: AuthResult<{ message: string }> = {
  success: false,
  error: "",
};

export function useVerifyOtp() {
  const [state, formAction, isPending] = useActionState(
    verifyOtp,
    initialState
  );

  return {
    state,
    formAction,
    isPending,
  };
}

