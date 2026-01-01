"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Manages bottom sheet state synchronized with URL query parameters
 * Handles opening/closing the add-expense bottom sheet via URL state
 */
export function useBottomSheetState() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync bottom sheet state with URL query parameters
  useEffect(() => {
    const showAddExpense = searchParams.get("add-expense");
    const dateParam = searchParams.get("date");

    if (showAddExpense === "true") {
      setIsOpen(true);
      setSelectedDate(dateParam);
    } else {
      setIsOpen(false);
      setSelectedDate(null);
    }
  }, [searchParams]);

  const handleOpen = (date?: string) => {
    const dateQuery = date ? `&date=${date}` : "";
    router.push(`/dashboard?add-expense=true${dateQuery}`);
  };

  const handleClose = () => {
    router.push("/dashboard");
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
