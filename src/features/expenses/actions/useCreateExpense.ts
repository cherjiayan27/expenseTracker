"use client";

import { useActionState } from "react";
import { createExpense } from "./createExpense";
import type { ExpenseResult, Expense } from "../domain/expense.types";

export function useCreateExpense() {
  const [state, formAction, isPending] = useActionState<
    ExpenseResult<Expense> | undefined,
    FormData
  >(createExpense, undefined);

  return { state, formAction, isPending };
}

