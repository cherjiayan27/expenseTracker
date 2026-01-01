/**
 * Currency formatting utilities
 * Pure functions for formatting monetary amounts
 */

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
