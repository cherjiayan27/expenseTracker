"use client";

import { useExpenseForm, useExpenseSubmission } from "../hooks";
import {
  NumberKeypad,
  AmountDisplay,
  CategorySelectors,
  NoteInput,
  FormActions
} from "./expense-form";

interface AddExpenseBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh expense list
  selectedDate?: string | null; // Date selected from calendar
}

export function AddExpenseBottomSheet({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
}: AddExpenseBottomSheetProps) {
  // Form state management
  const {
    amount,
    category,
    subCategory,
    note,
    isOwe,
    error,
    availableSubCategories,
    setAmount,
    setCategory,
    setSubCategory,
    setNote,
    setIsOwe,
    setError,
    resetForm,
    validateAmount,
  } = useExpenseForm();

  // Form submission logic
  const { isPending, handleSubmit } = useExpenseSubmission({
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
  });

  if (!isOpen) return null;

  return (
    <div className="fixed top-[120px] left-0 right-0 bottom-0 bg-white z-[60] flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Top section: Amount + Keypad - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="w-full max-w-sm px-4 mx-auto flex flex-col flex-1 min-h-0">
          {/* Amount Display - Fixed height */}
          <div className="pt-4 flex-shrink-0">
            <AmountDisplay amount={amount} />
          </div>
          
          {/* 24px spacing */}
          <div className="h-0 flex-shrink-0" />
          
          {/* Keypad - Takes remaining space and fills it */}
          <div className="flex-1 min-h-0 pb-4">
            <NumberKeypad value={amount} onChange={setAmount} />
          </div>
        </div>
      </div>

      {/* Sticky Category and Note Section - Fixed height at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-4 pb-[102px]">
        {/* Error Message */}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <CategorySelectors
          category={category}
          subCategory={subCategory}
          availableSubCategories={availableSubCategories}
          onCategoryChange={setCategory}
          onSubCategoryChange={setSubCategory}
        />

        <NoteInput value={note} onChange={setNote} isOwe={isOwe} onOweChange={setIsOwe} />
      </div>

      {/* Form Actions - Fixed at bottom */}
      <FormActions
        onClose={onClose}
        onConfirm={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}
