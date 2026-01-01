import { CSSProperties } from "react";

/**
 * Scrollbar hiding styles for cross-browser compatibility
 */
export const HIDE_SCROLLBAR_STYLE: CSSProperties = {
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE/Edge
};

/**
 * Scrollbar hiding class names
 */
export const HIDE_SCROLLBAR_CLASSNAME = "[&::-webkit-scrollbar]:hidden";

/**
 * Default number of days to show in calendar strip
 */
export const DEFAULT_VISIBLE_DAYS = 7;

/**
 * Default number of days to generate in date range
 */
export const DEFAULT_DATE_RANGE_DAYS = 30;
