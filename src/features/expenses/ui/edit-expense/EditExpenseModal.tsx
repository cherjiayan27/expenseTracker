"use client";

import { useEditExpenseForm, useExpenseUpdate } from "../../hooks";
import { CategorySelectorsRow } from "../shared/form/CategorySelectorsRow";
import { NoteInputRow } from "../shared/form/NoteInputRow";
import type { Expense } from "../../domain/expense.types";
import { formatCurrency } from "../../domain/formatters/currency.formatter";
import { getCategoryImage, getCategoryDisplayName } from "../../domain/expense.helpers";
import Image from "next/image";

interface EditExpenseModalProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditExpenseModal({
  expense,
  isOpen,
  onClose,
  onSuccess,
}: EditExpenseModalProps) {
  // Form state management
  const {
    amount,
    category,
    subCategory,
    note,
    isOwe,
    date,
    error,
    availableSubCategories,
    setAmount,
    setCategory,
    setSubCategory,
    setNote,
    setIsOwe,
    setError,
    validateAmount,
  } = useEditExpenseForm(expense);

  // Form submission logic
  const { isPending, handleUpdate } = useExpenseUpdate({
    expenseId: expense.id,
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
  });

  if (!isOpen) return null;

  // Formatting date and time for the receipt look
  const expenseDate = new Date(expense.date);
  const displayDate = expenseDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
  
  const createdAtDate = new Date(expense.createdAt);
  const displayTime = createdAtDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).toLowerCase();

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Receipt Section */}
          <div className="px-8 pt-8 pb-4 relative">
            <div className="flex items-start justify-between">
              {/* Header with Icon */}
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-md">
                <Image
                  src={getCategoryImage(category, subCategory)}
                  alt={category || "Expense"}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>

              {/* Metadata section */}
              <div className="space-y-0.5 text-right mt-1">
                <p className="text-gray-900 font-bold text-base tracking-tight">
                  Edit expense
                </p>
                <p className="text-gray-400 font-bold text-sm tracking-tight">
                  #{expense.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-gray-400 font-medium text-xs uppercase">{displayDate}</p>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-100 my-6" />
          </div>

          {/* Scrollable Edit Section */}
          <div className="flex-1 overflow-y-auto px-8 py-2">
            <div className="flex flex-col gap-6">
              {/* Amount Section */}
              <div className="flex items-center justify-between px-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Amount</label>
                <div className="flex items-center bg-gray-100 rounded-xl px-4 h-12 w-48">
                  <span className="text-lg text-gray-900 mr-2">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border-none text-right w-full text-lg text-gray-900 focus:outline-none focus:ring-0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category & SubCategory Section */}
              <CategorySelectorsRow
                category={category}
                subCategory={subCategory}
                availableSubCategories={availableSubCategories}
                onCategoryChange={setCategory}
                onSubCategoryChange={setSubCategory}
              />

              {/* Owe & Note Section */}
              <NoteInputRow
                value={note}
                onChange={setNote}
                isOwe={isOwe}
                onOweChange={setIsOwe}
              />

              {/* Error Message */}
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800 font-medium animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-8 flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-14 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-base hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isPending}
              className="flex-1 h-14 rounded-2xl bg-black text-white font-bold text-base hover:bg-gray-900 transition-colors shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
