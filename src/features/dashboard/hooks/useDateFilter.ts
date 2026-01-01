"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Expense } from "@/features/expenses/domain/expense.types";
import { calculateDateTotal, calculateMonthTotal, getExpensesForDate } from "@/features/expenses";

/**
 * Manages date selection and expense filtering
 * Provides current selected date from URL and filters expenses accordingly
 */
export function useDateFilter(expenses: Expense[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current selected date from URL, default to today
  const selectedDate = useMemo(() => {
    return (searchParams.get("date") ?? new Date().toISOString().split("T")[0]) as string;
  }, [searchParams]);

  // Filter expenses for the selected date using domain function
  const filteredExpenses = useMemo(
    () => getExpensesForDate(expenses, selectedDate),
    [expenses, selectedDate]
  );

  // Calculate total spending for the selected date using domain function
  const totalSpending = useMemo(
    () => calculateDateTotal(expenses, selectedDate),
    [expenses, selectedDate]
  );

  // Calculate total spending for the selected month using domain function
  const monthlySpending = useMemo(
    () => calculateMonthTotal(expenses, selectedDate),
    [expenses, selectedDate]
  );

  const handleDateSelect = (date: string) => {
    router.push(`/dashboard?date=${date}`);
  };

  return {
    selectedDate,
    filteredExpenses,
    totalSpending,
    monthlySpending,
    onDateSelect: handleDateSelect,
  };
}
