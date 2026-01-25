"use client";

import { useMemo, useState, useTransition } from "react";
import type { Expense } from "../../domain/expense.types";
import { formatCurrency } from "../../domain/formatters/currency.formatter";
import { DebtCard } from "./DebtCard";
import { calculateTotal } from "../../domain/calculations/expense-totals";
import { markDebtsAsDone } from "@/features/expenses/actions/markDebtsAsDone";

type DebtListProps = {
  debts: Expense[];
  onMultiSelectChange?: (isActive: boolean) => void;
};

export function DebtList({ debts, onMultiSelectChange }: DebtListProps) {
  // Calculate total before early return to satisfy Rules of Hooks
  const totalDebts = useMemo(() => calculateTotal(debts), [debts]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Don't render anything if no debts
  if (debts.length === 0) {
    return null;
  }

  const handleEnterMultiSelect = () => {
    setIsMultiSelect(true);
    setError(null);
    onMultiSelectChange?.(true);
  };

  const handleCancel = () => {
    setIsMultiSelect(false);
    setSelectedIds(new Set());
    setError(null);
    onMultiSelectChange?.(false);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMarkAsDone = () => {
    if (selectedIds.size === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const ids = Array.from(selectedIds);

    startTransition(async () => {
      try {
        const result = await markDebtsAsDone(ids, today);
        if (!result.success) {
          setError(result.error);
          return;
        }
        handleCancel();
      } catch (err) {
        console.error("Error marking debts as done:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="w-full mb-8" data-testid="container-debts">
      <div className="border-b border-gray-100 pb-2 mb-4 flex justify-between items-center">
        <h4 className="text-gray-500 font-medium text-sm">Debts</h4>
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-semibold text-sm">
            {formatCurrency(totalDebts)}
          </span>
          <button
            type="button"
            className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"
            aria-label="Select multiple debts"
            onClick={handleEnterMultiSelect}
          >
            <svg 
              className="w-3.5 h-3.5 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
              />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 pb-4">
        {debts.map((debt) => (
          <DebtCard
            key={debt.id}
            expense={debt}
            isMultiSelect={isMultiSelect}
            isSelected={selectedIds.has(debt.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {isMultiSelect && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 pb-8 pt-4 md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex-1 h-12 rounded-full border border-gray-200 text-gray-700 font-semibold"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 h-12 rounded-full bg-black text-white font-semibold disabled:opacity-50"
              onClick={handleMarkAsDone}
              disabled={selectedIds.size === 0 || isPending}
            >
              Mark as done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

