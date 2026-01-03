"use client";

import { useTransition } from "react";
import { createExpense } from "../../actions/createExpense";
import type { ExpenseCategory } from "@/features/categories/domain/category.definitions";

interface UseExpenseSubmissionParams {
  amount: string;
  category: ExpenseCategory;
  subCategory: string | null;
  note: string;
  isOwe: boolean;
  selectedDate?: string | null;
  validateAmount: () => boolean;
  setError: (error: string | null) => void;
  resetForm: () => void;
  onSuccess?: () => void;
  onClose: () => void;
}

interface UseExpenseSubmissionReturn {
  isPending: boolean;
  handleSubmit: () => void;
}

/**
 * Custom hook for handling expense form submission
 * Manages the submission flow, validation, and callbacks
 */
export function useExpenseSubmission({
  amount,
  category,
  subCategory,
  note,
  isOwe,
  selectedDate,
  validateAmount,
  setError,
  resetForm,
  onSuccess,
  onClose,
}: UseExpenseSubmissionParams): UseExpenseSubmissionReturn {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    // Validate amount before submission
    if (!validateAmount()) {
      return;
    }

    startTransition(async () => {
      try {
        // Create FormData from state
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("category", category);

        if (subCategory) {
          formData.append("subCategory", subCategory);
        }

        // If "Owe" is checked, store the name in owedTo field
        // Otherwise, use the note as description
        if (isOwe && note.trim()) {
          formData.append("owedTo", note.trim());
        } else if (note.trim()) {
          formData.append("description", note.trim());
        }

        // Use the selected date from calendar, or fall back to today
        const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
        formData.append("date", dateToUse!);

        // Call the server action
        const result = await createExpense(undefined, formData);

        if (result.success) {
          // Reset form
          resetForm();

          // Call success callback to refresh expense list
          if (onSuccess) {
            onSuccess();
          }

          // Close the sheet
          onClose();
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error creating expense:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return {
    isPending,
    handleSubmit,
  };
}
