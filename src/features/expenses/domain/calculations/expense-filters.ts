/**
 * Expense filtering and grouping utilities
 * Pure functions for filtering and organizing expenses
 */

import type { Expense } from "../expense.types";

/**
 * Group expenses by date
 */
export function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const grouped = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const dateKey = expense.date;
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, expense]);
  }

  return grouped;
}

/**
 * Get expenses for a specific date
 */
export function getExpensesForDate(expenses: Expense[], date: string): Expense[] {
  return expenses.filter((expense) => expense.date === date);
}

/**
 * Get expenses within a date range (inclusive)
 */
export function getExpensesInRange(
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] {
  return expenses.filter((expense) => {
    return expense.date >= startDate && expense.date <= endDate;
  });
}
