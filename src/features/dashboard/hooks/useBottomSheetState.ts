"use client";

import { useState, useEffect, useTransition, startTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

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
    // Update local state immediately for instant UI response
    setIsOpen(true);
    setSelectedDate(date ?? null);

    // Update URL in the background
    const dateQuery = date ? `&date=${date}` : "";
    startTransition(() => {
      router.push(`/dashboard?add-expense=true${dateQuery}`, { scroll: false });
    });
  };

  const handleClose = () => {
    // Update local state immediately for instant UI response
    setIsOpen(false);
    setSelectedDate(null);

    // Update URL in the background
    startTransition(() => {
      router.push("/dashboard", { scroll: false });
    });
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
