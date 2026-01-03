"use client";

import { useState, useMemo, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import {
  getImagesByCategory,
  type ExpenseCategory,
  type CategoryImage
} from "@/features/categories/domain/category.definitions";
import type { Expense } from "../../domain/expense.types";

interface UseEditExpenseFormReturn {
  // Form state
  amount: string;
  category: ExpenseCategory;
  subCategory: string | null;
  note: string;
  isOwe: boolean;
  date: string;
  error: string | null;

  // Available options
  availableSubCategories: CategoryImage[];

  // State setters
  setAmount: Dispatch<SetStateAction<string>>;
  setCategory: Dispatch<SetStateAction<ExpenseCategory>>;
  setSubCategory: Dispatch<SetStateAction<string | null>>;
  setNote: Dispatch<SetStateAction<string>>;
  setIsOwe: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;

  // Form actions
  validateAmount: () => boolean;
}

/**
 * Custom hook for managing edit expense form state
 * Pre-populates form with existing expense data
 */
export function useEditExpenseForm(expense: Expense): UseEditExpenseFormReturn {
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(
    (expense.category as ExpenseCategory) || "Food & Drinks"
  );
  const [subCategory, setSubCategory] = useState<string | null>(expense.subCategory);
  const [note, setNote] = useState(expense.owedTo || expense.description || "");
  const [isOwe, setIsOwe] = useState(!!expense.owedTo);
  const [error, setError] = useState<string | null>(null);

  // Get available sub-categories based on selected category
  const availableSubCategories = useMemo(() => {
    return getImagesByCategory(category);
  }, [category]);

  // Reset sub-category only when category actually changes and existing sub-category no longer applies
  const lastCategory = useRef(category);
  useEffect(() => {
    // Only clear sub-category when the category actually changes
    if (category === lastCategory.current) return;
    lastCategory.current = category;

    const subCategoryStillValid =
      subCategory && availableSubCategories.some((img) => img.name === subCategory);

    if (!subCategoryStillValid) {
      setSubCategory(null);
    }
  }, [category, availableSubCategories, subCategory, setSubCategory]);

  const validateAmount = (): boolean => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    // If "Owe" is checked, the note field (who you owe) is required
    if (isOwe && !note.trim()) {
      setError("Please enter who you owe money to");
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
    isOwe,
    date: expense.date,
    error,

    // Available options
    availableSubCategories,

    // State setters
    setAmount,
    setCategory,
    setSubCategory,
    setNote,
    setIsOwe,
    setError,

    // Form actions
    validateAmount,
  };
}
