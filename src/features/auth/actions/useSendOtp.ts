"use client";

import { useActionState } from "react";
import { sendOtp } from "./sendOtp";
import type { AuthResult } from "../domain/auth.types";

const initialState: AuthResult<{ message: string }> = {
  success: false,
  error: "",
};

export function useSendOtp() {
  const [state, formAction, isPending] = useActionState(
    sendOtp,
    initialState
  );

  return {
    state,
    formAction,
    isPending,
  };
}

