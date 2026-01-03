"use client";

import { useTransition } from "react";
import { updateExpense } from "../../actions/updateExpense";
import type { ExpenseCategory } from "@/features/categories/domain/category.definitions";

interface UseExpenseUpdateParams {
  expenseId: string;
  amount: string;
  category: ExpenseCategory;
  subCategory: string | null;
  note: string;
  isOwe: boolean;
  date: string;
  validateAmount: () => boolean;
  setError: (error: string | null) => void;
  onSuccess?: () => void;
  onClose: () => void;
}

interface UseExpenseUpdateReturn {
  isPending: boolean;
  handleUpdate: () => void;
}

/**
 * Custom hook for handling expense update submission
 * Manages the update flow, validation, and callbacks
 */
export function useExpenseUpdate({
  expenseId,
  amount,
  category,
  subCategory,
  note,
  isOwe,
  date,
  validateAmount,
  setError,
  onSuccess,
  onClose,
}: UseExpenseUpdateParams): UseExpenseUpdateReturn {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
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

        formData.append("date", date);

        // Call the server action
        const result = await updateExpense(expenseId, undefined, formData);

        if (result.success) {
          // Call success callback to refresh expense list
          if (onSuccess) {
            onSuccess();
          }

          // Close the modal
          onClose();
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error updating expense:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return {
    isPending,
    handleUpdate,
  };
}
