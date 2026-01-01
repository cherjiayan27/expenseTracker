/**
 * Expense calculation utilities
 * Pure functions for calculating expense totals
 */

import type { Expense } from "../expense.types";
import { getExpensesForDate, getExpensesInRange } from "./expense-filters";

/**
 * Calculate total of all expenses
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate month-to-date total (current month only)
 */
export function calculateMonthToDate(expenses: Expense[]): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  return calculateTotal(monthExpenses);
}

/**
 * Calculate total for a specific date
 */
export function calculateDateTotal(expenses: Expense[], date: string): number {
  const dateExpenses = getExpensesForDate(expenses, date);
  return calculateTotal(dateExpenses);
}

/**
 * Calculate total for a date range
 */
export function calculateRangeTotal(
  expenses: Expense[],
  startDate: string,
  endDate: string
): number {
  const rangeExpenses = getExpensesInRange(expenses, startDate, endDate);
  return calculateTotal(rangeExpenses);
}
