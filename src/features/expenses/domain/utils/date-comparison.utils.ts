/**
 * Date comparison utilities
 * Pure functions for comparing dates
 */

import { getWeekRange } from "./date.utils";

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(date1: string, date2: string): boolean {
  const range1 = getWeekRange(date1);
  const range2 = getWeekRange(date2);
  return range1.start === range2.start;
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + "T00:00:00");
  const d2 = new Date(date2 + "T00:00:00");
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

/**
 * Check if two dates are in the same year
 */
export function isSameYear(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + "T00:00:00");
  const d2 = new Date(date2 + "T00:00:00");
  return d1.getFullYear() === d2.getFullYear();
}
