"use client";

import { useState, useMemo, useEffect, type Dispatch, type SetStateAction } from "react";
import {
  getImagesByCategory,
  type ExpenseCategory,
  type CategoryImage
} from "@/features/categories/domain/category.definitions";

const DEFAULT_CATEGORY: ExpenseCategory = "Food & Drinks";
const DEFAULT_AMOUNT = "0";

interface UseExpenseFormReturn {
  // Form state
  amount: string;
  category: ExpenseCategory;
  subCategory: string | null;
  note: string;
  error: string | null;

  // Available options
  availableSubCategories: CategoryImage[];

  // State setters
  setAmount: Dispatch<SetStateAction<string>>;
  setCategory: Dispatch<SetStateAction<ExpenseCategory>>;
  setSubCategory: Dispatch<SetStateAction<string | null>>;
  setNote: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;

  // Form actions
  resetForm: () => void;
  validateAmount: () => boolean;
}

/**
 * Custom hook for managing expense form state
 * Handles all form fields, validation, and reset logic
 */
export function useExpenseForm(): UseExpenseFormReturn {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [category, setCategory] = useState<ExpenseCategory>(DEFAULT_CATEGORY);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get available sub-categories based on selected category
  const availableSubCategories = useMemo(() => {
    return getImagesByCategory(category);
  }, [category]);

  // Reset sub-category when category changes
  useEffect(() => {
    setSubCategory(null);
  }, [category]);

  const resetForm = () => {
    setAmount(DEFAULT_AMOUNT);
    setCategory(DEFAULT_CATEGORY);
    setSubCategory(null);
    setNote("");
    setError(null);
  };

  const validateAmount = (): boolean => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    setError(null);
    return true;
  };

  return {
    // Form state
    amount,
    category,
    subCategory,
    note,
    error,

    // Available options
    availableSubCategories,

    // State setters
    setAmount,
    setCategory,
    setSubCategory,
    setNote,
    setError,

    // Form actions
    resetForm,
    validateAmount,
  };
}
