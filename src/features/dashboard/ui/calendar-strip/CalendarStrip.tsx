"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateDateRange, getTodayDate } from "@/app/(app)/dashboard/lib/date-utils";
import { DateButton } from "./DateButton";
import {
  HIDE_SCROLLBAR_STYLE,
  HIDE_SCROLLBAR_CLASSNAME,
  DEFAULT_VISIBLE_DAYS,
  DEFAULT_DATE_RANGE_DAYS
} from "./constants";

interface CalendarStripProps {
  defaultDate?: string;
  onDateSelect?: (date: string) => void;
  daysToShow?: number;
  dateRangeDays?: number;
}

export function CalendarStrip({
  defaultDate,
  onDateSelect,
  daysToShow = DEFAULT_VISIBLE_DAYS,
  dateRangeDays = DEFAULT_DATE_RANGE_DAYS
}: CalendarStripProps) {
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate || getTodayDate());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate dates using useMemo for performance
  const allDates = useMemo(() => generateDateRange(dateRangeDays), [dateRangeDays]);

  // Get visible dates using useMemo
  const visibleDates = useMemo(() => allDates.slice(-daysToShow), [allDates, daysToShow]);

  useEffect(() => {
    // Scroll to the end (today) when component mounts
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <div
      ref={scrollContainerRef}
      className={cn("w-full overflow-x-auto", HIDE_SCROLLBAR_CLASSNAME)}
      style={HIDE_SCROLLBAR_STYLE}
    >
      <div className="flex items-center gap-2">
        {visibleDates.map((item) => (
          <DateButton
            key={item.fullDate}
            day={item.day}
            date={item.date}
            fullDate={item.fullDate}
            isSelected={selectedDate === item.fullDate}
            onClick={handleDateSelect}
          />
        ))}
      </div>
    </div>
  );
}
