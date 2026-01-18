// Subscription calculation utilities
// Pure functions for financial calculations

import type { Subscription, SubscriptionPeriod } from "../subscription.types";

/**
 * Normalize subscription amount to monthly equivalent
 */
export function normalizeToMonthly(
  amount: number,
  period: SubscriptionPeriod
): number {
  switch (period) {
    case "Yearly":
      return amount / 12;
    case "Quarterly":
      return amount / 3;
    case "Monthly":
      return amount;
  }
}

/**
 * Calculate total monthly commitment from all active subscriptions
 */
export function calculateMonthlyCommitment(
  subscriptions: Subscription[]
): number {
  return subscriptions.reduce((total, sub) => {
    if (!sub.isActive) return total;
    return total + normalizeToMonthly(sub.amount, sub.period);
  }, 0);
}

/**
 * Calculate yearly total from monthly commitment
 */
export function calculateYearlyTotal(monthlyCommitment: number): number {
  return monthlyCommitment * 12;
}

/**
 * Group subscriptions by period
 */
export function groupSubscriptionsByPeriod(subscriptions: Subscription[]) {
  return {
    yearly: subscriptions.filter((s) => s.period === "Yearly"),
    quarterly: subscriptions.filter((s) => s.period === "Quarterly"),
    monthly: subscriptions.filter((s) => s.period === "Monthly"),
  };
}

/**
 * Calculate subtotal for a specific period group
 */
export function calculatePeriodSubtotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((acc, s) => acc + s.amount, 0);
}
