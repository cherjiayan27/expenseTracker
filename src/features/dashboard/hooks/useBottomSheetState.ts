"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Manages bottom sheet state locally to avoid re-rendering the page via URL changes
 * Handles opening/closing the add-expense bottom sheet
 */
export function useBottomSheetState() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = (date?: string) => {
    setIsOpen(true);
    setSelectedDate(date ?? null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedDate(null);
  };

  const handleSuccess = () => {
    router.refresh(); // Trigger server component re-fetch
  };

  return {
    isOpen,
    selectedDate,
    open: handleOpen,
    close: handleClose,
    onSuccess: handleSuccess,
  };
}
