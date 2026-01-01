export interface DateItem {
  day: string;
  date: string;
  fullDate: string;
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDate(): string {
  const today = new Date();
  return formatDateToYYYYMMDD(today);
}

/**
 * Format a Date object to YYYY-MM-DD format (local timezone)
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get day abbreviation (e.g., "Mon", "Tue")
 */
export function getDayAbbreviation(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Generate a range of dates going backwards from today
 * @param days - Number of days to generate (default: 30)
 * @returns Array of DateItem objects
 */
export function generateDateRange(days: number = 30): DateItem[] {
  const dates: DateItem[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    dates.push({
      day: getDayAbbreviation(date),
      date: date.getDate().toString(),
      fullDate: formatDateToYYYYMMDD(date),
    });
  }

  return dates;
}
