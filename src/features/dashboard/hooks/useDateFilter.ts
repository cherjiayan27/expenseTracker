"use client";

import { useEffect, useMemo, useState } from "react";
import type { Expense } from "@/features/expenses/domain/expense.types";
import { calculateDateTotal, calculateMonthTotal, getExpensesForDate } from "@/features/expenses";
import { getTodayDate } from "@/app/(app)/dashboard/lib/date-utils";

/**
 * Manages date selection and expense filtering without URL-driven navigation
 */
export function useDateFilter(expenses: Expense[]) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  // On load/refresh, force today's date into state and URL (non-navigating)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = getTodayDate();
      const url = new URL(window.location.href);
      url.searchParams.set("date", today);
      window.history.replaceState(null, "", url.toString());
      setSelectedDate(today);
    }
  }, []);

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
    setSelectedDate(date);

    // Keep the URL in sync for sharing/bookmarking without triggering navigation
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("date", date);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return {
    selectedDate,
    filteredExpenses,
    totalSpending,
    monthlySpending,
    onDateSelect: handleDateSelect,
  };
}
