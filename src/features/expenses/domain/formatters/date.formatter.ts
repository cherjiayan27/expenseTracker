/**
 * Date formatting utilities
 * Pure functions for formatting dates for display
 */

import { getWeekRange } from "../utils/date.utils";

/**
 * View mode type for the date strip
 */
export type ViewMode = "day" | "week" | "month" | "year";

/**
 * Format date for display (e.g., "28 Dec 2025")
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
 * Format date for day strip header (e.g., "Sunday – 28 Dec 2025")
 */
export function formatDayStripHeader(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");

  const dayName = new Intl.DateTimeFormat("en-SG", {
    weekday: "long",
  }).format(date);

  const dateFormatted = new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return `${dayName} – ${dateFormatted}`;
}

/**
 * Get day letter for day strip (S, M, T, W, T, F, S)
 */
export function getDayLetter(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" })[0]!;
}

/**
 * Get day number for day strip (1-31)
 */
export function getDayNumber(dateString: string): number {
  const date = new Date(dateString + "T00:00:00");
  return date.getDate();
}

/**
 * Get month abbreviation (Jan, Feb, etc.)
 */
export function getMonthAbbreviation(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

/**
 * Get year number
 */
export function getYear(dateString: string): number {
  const date = new Date(dateString + "T00:00:00");
  return date.getFullYear();
}

/**
 * Format header label based on mode and date
 */
export function formatHeaderLabel(mode: ViewMode, dateString: string): string {
  const date = new Date(dateString + "T00:00:00");

  switch (mode) {
    case "day": {
      const dayName = new Intl.DateTimeFormat("en-SG", {
        weekday: "long",
      }).format(date);

      const dateFormatted = new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);

      return `${dayName} – ${dateFormatted}`;
    }

    case "week": {
      const { start, end } = getWeekRange(dateString);
      const startDate = new Date(start + "T00:00:00");
      const endDate = new Date(end + "T00:00:00");

      const startFormatted = new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
      }).format(startDate);

      const endFormatted = new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(endDate);

      return `Week of ${startFormatted}–${endFormatted}`;
    }

    case "month": {
      return new Intl.DateTimeFormat("en-SG", {
        month: "long",
        year: "numeric",
      }).format(date);
    }

    case "year": {
      return date.getFullYear().toString();
    }
  }
}
