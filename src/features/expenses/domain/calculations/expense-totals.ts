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
 * Calculate total for a specific month (based on a date in that month)
 */
export function calculateMonthTotal(expenses: Expense[], date: string): number {
  const targetDate = new Date(date);
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const monthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === targetMonth &&
      expenseDate.getFullYear() === targetYear
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
