"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Expense } from "@/features/expenses/domain/expense.types";

/**
 * Manages date selection and expense filtering
 * Provides current selected date from URL and filters expenses accordingly
 */
export function useDateFilter(expenses: Expense[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current selected date from URL, default to today
  const selectedDate = useMemo(
    () => searchParams.get("date") || new Date().toISOString().split("T")[0],
    [searchParams]
  );

  // Filter expenses for the selected date
  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => expense.date === selectedDate),
    [expenses, selectedDate]
  );

  // Calculate total spending for the selected date
  const totalSpending = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const handleDateSelect = (date: string) => {
    router.push(`/dashboard?date=${date}`);
  };

  return {
    selectedDate,
    filteredExpenses,
    totalSpending,
    onDateSelect: handleDateSelect,
  };
}
