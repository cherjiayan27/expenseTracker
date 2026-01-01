/**
 * Date manipulation utilities
 * Pure functions for date calculations and conversions
 */

/**
 * Helper function to format a Date object to YYYY-MM-DD in local timezone
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get array of dates for the current week (last 7 days including today)
 */
export function getCurrentWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDateToString(date));
  }

  return dates;
}

/**
 * Get start and end dates for a week containing the given date
 */
export function getWeekRange(dateString: string): { start: string; end: string } {
  const date = new Date(dateString + "T00:00:00");
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Get Sunday of this week
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);

  // Get Saturday of this week
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    start: formatDateToString(sunday),
    end: formatDateToString(saturday),
  };
}

/**
 * Get start and end dates for a month containing the given date
 */
export function getMonthRange(dateString: string): { start: string; end: string } {
  const date = new Date(dateString + "T00:00:00");
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // Last day of month

  return {
    start: formatDateToString(start),
    end: formatDateToString(end),
  };
}

/**
 * Get start and end dates for a year containing the given date
 */
export function getYearRange(dateString: string): { start: string; end: string } {
  const date = new Date(dateString + "T00:00:00");
  const year = date.getFullYear();

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  return {
    start: formatDateToString(start),
    end: formatDateToString(end),
  };
}

/**
 * Get dates for week strip (7 days)
 */
export function getWeekStripDates(selectedDate: string): string[] {
  const { start } = getWeekRange(selectedDate);
  const dates: string[] = [];
  const startDate = new Date(start + "T00:00:00");

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(formatDateToString(date));
  }

  return dates;
}

/**
 * Get months for month strip (12 months of current year)
 */
export function getMonthStripDates(selectedDate: string): string[] {
  const date = new Date(selectedDate + "T00:00:00");
  const year = date.getFullYear();
  const dates: string[] = [];

  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(year, month, 1);
    dates.push(formatDateToString(monthDate));
  }

  return dates;
}

/**
 * Get years for year strip (current year ± 5 years)
 */
export function getYearStripDates(selectedDate: string): string[] {
  const date = new Date(selectedDate + "T00:00:00");
  const currentYear = date.getFullYear();
  const dates: string[] = [];

  for (let i = -5; i <= 5; i++) {
    const year = currentYear + i;
    const yearDate = new Date(year, 0, 1);
    dates.push(formatDateToString(yearDate));
  }

  return dates;
}
