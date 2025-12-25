// Pure calculation functions for expenses
// No external dependencies, just pure functions

import type { Expense } from "./expense.types";

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
 * Format amount as Singapore Dollar currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

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
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]!;
}

// Predefined expense categories (exported for use in UI)
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Other",
] as const;

