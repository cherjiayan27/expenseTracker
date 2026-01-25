"use client";

import { useState, useCallback } from "react";

/**
 * Manages bottom sheet state locally to avoid re-rendering the page via URL changes
 * Handles opening/closing the add-expense bottom sheet
 *
 * Note: Server actions handle cache revalidation via revalidatePath/revalidateTag,
 * so we don't need router.refresh() here - it would cause redundant full page refresh.
 */
export function useBottomSheetState() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleOpen = useCallback((date?: string) => {
    setIsOpen(true);
    setSelectedDate(date ?? null);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedDate(null);
  }, []);

  // Server actions handle revalidation - this callback allows consumers
  // to perform additional cleanup if needed after successful submission
  const handleSuccess = useCallback(() => {
    // Revalidation is handled by server actions via revalidatePath/revalidateTag
  }, []);

  return {
    isOpen,
    selectedDate,
    open: handleOpen,
    close: handleClose,
    onSuccess: handleSuccess,
  };
}
